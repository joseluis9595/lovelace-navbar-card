import {
  css,
  CSSResult,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  unsafeCSS,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';
import {
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  NavbarCardConfig,
  PopupItem,
  RouteItem,
  STUB_CONFIG,
  validateConfig,
} from './config';
import { deepMergeKeepArrays, mapStringToEnum, processTemplate } from './utils';
import {
  forceDashboardPadding,
  forceResetRipple,
  getNavbarTemplates,
  injectStyles,
  removeDashboardPadding,
} from './dom-utils';
import { getDefaultStyles } from './styles';
import { shouldShowLabelBackground, shouldShowLabels } from './logic/labels';
import { checkDesktop } from './logic/device';
import { renderRoute } from './render/route';
import { renderPopupItem } from './render/popup-item';
import { shouldShowMediaPlayer } from './logic/media-player';
import { renderMediaPlayer } from './render/media-player';


declare global {
  interface Window {
    customCards: Array<object>;
  }
}

// Register navbar-card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen.',
});

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @property({ attribute: false }) private _hass!: HomeAssistant;
  @state() config?: NavbarCardConfig;
  @state() isDesktop?: boolean;
  @state() private _inEditDashboardMode?: boolean;
  @state() private _inEditCardMode?: boolean;
  @state() private _inPreviewMode?: boolean;
  @state() private _popup?: TemplateResult | null;
  @state() private widgetVisibility: {
    mediaPlayer?: boolean;
  } = {};

  /**********************************************************************/
  /* Lit native callbacks */
  /**********************************************************************/

  connectedCallback(): void {
    super.connectedCallback();

    // Quick fix for ripple effects
    forceResetRipple(this);

    // Initialize screen size listener
    window.addEventListener('resize', this._updateDesktopState);
    this._updateDesktopState();

    const homeAssistantRoot = document.querySelector('body > home-assistant');

    // Check if Home Assistant dashboard is in edit mode
    this._inEditDashboardMode =
      this.parentElement?.closest('hui-card-edit-mode') != null;

    // Check if card is in edit mode
    this._inEditCardMode =
      homeAssistantRoot?.shadowRoot
        ?.querySelector('hui-dialog-edit-card')
        ?.shadowRoot?.querySelector('ha-dialog') != null;

    // Check if the card is in preview mode (new cards list)
    this._inPreviewMode =
      this.parentElement?.closest('.card > .preview') != null;

    // Inject styles into the card to prevent unnecessary style re-rendering
    injectStyles(
      this,
      getDefaultStyles(),
      this.config?.styles ? unsafeCSS(this.config.styles) : css``,
    );

    // Force dashboard padding
    forceDashboardPadding({
      desktop: this.config?.desktop ?? DEFAULT_NAVBAR_CONFIG.desktop,
      mobile: this.config?.mobile ?? DEFAULT_NAVBAR_CONFIG.mobile,
      auto_padding: this.config?.layout?.auto_padding,
      show_media_player: this.widgetVisibility?.mediaPlayer ?? false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Remove screen size listener
    window.removeEventListener('resize', this._updateDesktopState);

    // Remove dashboard padding styles
    removeDashboardPadding();

    // Force popup closure without animation to prevent memory leaks
    this._popup = null;
  }

  /**
   * Set the Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const { visible } = shouldShowMediaPlayer(this);

    // TODO use the new API for widget visibility
    if (this.widgetVisibility?.mediaPlayer !== visible) {
      this.widgetVisibility.mediaPlayer = visible;
    }
  }

  /**
   * Get the Home Assistant instance
   */
  get hass() {
    return this._hass;
  }

  /**
   * Set the configuration
   */
  setConfig(config) {
    // Check for template configuration
    if (config?.template) {
      // Get templates from the DOM
      const templates = getNavbarTemplates();

      // If no templates are found, but the card is configured to use a template, warn and use the default configuration.
      if (!templates) {
        console.warn(
          '[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' +
            '\n\n' +
            'https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n',
        );
      } else {
        // Merge template configuration with the card configuration, giving priority to the card
        const templateConfig = templates[config.template];
        if (templateConfig) {
          config = deepMergeKeepArrays(templateConfig, config);
        }
      }
    }

    // Validate configuration before rendering
    validateConfig(config);

    // Store configuration
    this.config = config;
  }

  /**
   * Native `updated` lit callback
   */
  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // Re-apply dashboard padding if media player visibility changes
    if (_changedProperties.has('widgetVisibility')) {
      // Force dashboard padding
      forceDashboardPadding({
        desktop: this.config?.desktop ?? DEFAULT_NAVBAR_CONFIG.desktop,
        mobile: this.config?.mobile ?? DEFAULT_NAVBAR_CONFIG.mobile,
        auto_padding: this.config?.layout?.auto_padding,
        show_media_player: this.widgetVisibility?.mediaPlayer ?? false,
      });
    }
  }

  // /**
  //  * Manually control whether to re-render or not the card
  //  */
  // shouldUpdate(changedProperties: Map<string, unknown>) {
  // for (const propName of changedProperties.keys()) {
  //   if (PROPS_TO_FORCE_UPDATE.includes(propName)) {
  //     return true;
  //   }
  //   if (
  //     propName === 'hass'
  //     // && new Date().getTime() - (this._lastRender ?? 0) > 1000
  //   ) {
  //     return true;
  //   }
  // }
  // return false;
  // }

  /**
   * Stub configuration to be properly displayed in the "new card"
   * dialog in home assistant
   */
  static getStubConfig(): NavbarCardConfig {
    return STUB_CONFIG;
  }

  /**********************************************************************/
  /* State */
  /**********************************************************************/
  private _updateDesktopState = () => {
    const isDesktop = checkDesktop(this);
    if (this.isDesktop === isDesktop) {
      return;
    }
    this.isDesktop = isDesktop;
  };

  /**********************************************************************/
  /* Popup management */
  /**********************************************************************/

  /**
   * Handle gracefully closing the popup.
   */
  public closePopup = () => {
    const popup = this.shadowRoot?.querySelector('.navbar-popup');
    const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');

    if (popup && backdrop) {
      popup.classList.remove('visible');
      backdrop.classList.remove('visible');

      // Wait for transitions to complete before removing
      setTimeout(() => {
        this._popup = null;
      }, 200);
    } else {
      this._popup = null;
    }
    // Remove Escape key listener when popup is closed
    window.removeEventListener('keydown', this._onPopupKeyDownListener);
  };

  /**
   * Get the styles for the popup based on its position relative to the anchor element.
   */
  private _getPopupStyles(
    anchorRect: DOMRect,
    position: 'top' | 'left' | 'bottom' | 'right' | 'mobile',
  ): {
    style: CSSResult;
    labelPositionClassName: string;
    popupDirectionClassName: string;
  } {
    const windowWidth = window.innerWidth;

    switch (position) {
      case 'top':
        return {
          style: css`
            top: ${anchorRect.top + anchorRect.height}px;
            left: ${anchorRect.x}px;
          `,
          labelPositionClassName: 'label-right',
          popupDirectionClassName: 'open-bottom',
        };
      case 'left':
        return {
          style: css`
            top: ${anchorRect.top}px;
            left: ${anchorRect.x + anchorRect.width}px;
          `,
          labelPositionClassName: 'label-bottom',
          popupDirectionClassName: 'open-right',
        };
      case 'right':
        return {
          style: css`
            top: ${anchorRect.top}px;
            right: ${windowWidth - anchorRect.x}px;
          `,
          labelPositionClassName: 'label-bottom',
          popupDirectionClassName: 'open-left',
        };
      case 'bottom':
      case 'mobile':
      default:
        if (anchorRect.x > windowWidth / 2) {
          return {
            style: css`
              top: ${anchorRect.top}px;
              right: ${windowWidth - anchorRect.x - anchorRect.width}px;
            `,
            labelPositionClassName: 'label-left',
            popupDirectionClassName: 'open-up',
          };
        } else {
          return {
            style: css`
              top: ${anchorRect.top}px;
              left: ${anchorRect.left}px;
            `,
            labelPositionClassName: 'label-right',
            popupDirectionClassName: 'open-up',
          };
        }
    }
  }

  /**
   * Open the popup menu for a given popupConfig and anchor element.
   */
  public openPopup = (route: RouteItem, target: HTMLElement) => {
    const popupItems =
      processTemplate<PopupItem[]>(this._hass, this, route.popup) ??
      route.popup ??
      route.submenu;

    if (typeof popupItems === 'string') {
      console.warn(
        `[navbar-card] Invalid JSTemplate provided for route: ${route.label}`,
      );
      return;
    }

    if (!popupItems || popupItems.length === 0) {
      console.warn(
        `[navbar-card] No popup items provided for route: ${route.label}`,
      );
      return;
    }

    const anchorRect = target.getBoundingClientRect();

    const { style, labelPositionClassName, popupDirectionClassName } =
      this._getPopupStyles(
        anchorRect,
        !this.isDesktop
          ? 'mobile'
          : (this.config?.desktop?.position ??
              DEFAULT_NAVBAR_CONFIG.desktop.position),
      );

    const showLabelBackground = shouldShowLabelBackground(this);
    const showLabels = shouldShowLabels(this, true);

    this._popup = html`
      <div class="navbar-popup-backdrop"></div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this.isDesktop ? 'desktop' : 'mobile'}
          ${showLabelBackground ? 'popuplabelbackground' : ''}
        "
        style="${style}">
        ${repeat(popupItems, (popupItem, index) => {
          return renderPopupItem(
            this,
            popupItem,
            index,
            popupDirectionClassName,
            labelPositionClassName,
            showLabelBackground,
            showLabels,
          );
        })}
      </div>
    `;

    // Trigger animations after element is rendered
    requestAnimationFrame(() => {
      const popup = this.shadowRoot?.querySelector('.navbar-popup');
      const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');
      if (popup && backdrop) {
        popup.classList.add('visible');
        backdrop.classList.add('visible');
      }
    });
    // Add Escape key listener when popup is opened
    window.addEventListener('keydown', this._onPopupKeyDownListener);

    // Add click listener to backdrop after a short delay, to prevent a recurring issue
    // where the popup is closed right after being opened. This happens because the click
    // event that opens the popup, bubbles up the DOM up to this backdrop, even with
    // preventDefault or stopPropagation :(
    setTimeout(() => {
      const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          this.closePopup();
        });
      }
    }, 400);
  };

  /**
   * Handle the escape key press to close the popup.
   */
  private _onPopupKeyDownListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._popup) {
      e.preventDefault();
      this.closePopup();
    }
  };

  /**********************************************************************/
  /* Render function */
  /**********************************************************************/

  protected render() {
    if (!this.config) {
      return html``;
    }

    const { routes, desktop, mobile } = this.config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};

    // Check visualization modes
    const isEditMode =
      this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;

    // Choose css classnames
    const desktopPositionClassname =
      mapStringToEnum(DesktopPosition, desktopPosition as string) ??
      DEFAULT_NAVBAR_CONFIG.desktop.position;
    const deviceModeClassName = this.isDesktop ? 'desktop' : 'mobile';
    const editModeClassname = isEditMode ? 'edit-mode' : '';
    const mobileModeClassname = mobile?.mode === 'floating' ? 'floating' : '';

    // Cache hidden property evaluations
    const isDesktopHidden = processTemplate<boolean>(
      this._hass,
      this,
      desktopHidden,
    );
    const isMobileHidden = processTemplate<boolean>(
      this._hass,
      this,
      mobileHidden,
    );

    // Handle hidden props
    if (
      !isEditMode &&
      ((this.isDesktop && !!isDesktopHidden) ||
        (!this.isDesktop && !!isMobileHidden))
    ) {
      return html``;
    }

    return html`
      <div
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname} ${mobileModeClassname}">
        ${renderMediaPlayer(this)}
        <ha-card
          class="navbar-card ${deviceModeClassName} ${desktopPositionClassname} ${mobileModeClassname}">
          ${repeat(routes, route => renderRoute(this, route))}
        </ha-card>
      </div>
      ${this._popup}
    `;
  }

  /**********************************************************************/
  /* Visual editor */
  /**********************************************************************/
  static async getConfigElement() {
    await import('./navbar-card-editor');
    return document.createElement('navbar-card-editor');
  }
}

console.info(
  `%c navbar-card%cv${version} `,
  // Card name styles
  `background-color: #555;
      padding: 6px 8px;
      padding-right: 6px;
      color: #fff;
      font-weight: 800;
      font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); 
      border-radius: 16px 0 0 16px;`,
  // Card version styles
  `background-color:rgb(0, 135, 197);
      padding: 6px 8px;
      padding-left: 6px;
      color: #fff;
      font-weight: 800;
      font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); 
      border-radius: 0 16px 16px 0;`,
);
