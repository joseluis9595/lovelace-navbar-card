import { css, CSSResult, html, LitElement, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant, navigate } from 'custom-card-helpers';
import { DesktopPosition, NavbarCardConfig, RouteItem } from './types';
import {
  mapStringToEnum,
  processBadgeTemplate,
  processTemplate,
} from './utils';
import { getNavbarTemplates } from './dom-utils';
import { getDefaultStyles } from './styles';

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

// Register our new custom card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen.',
});

const PROPS_TO_FORCE_UPDATE = [
  // TODO JLAQ replace this with proper keys instead of hardcoded strings
  '_config',
  '_isDesktop',
  '_inEditDashboardMode',
  '_inEditCardMode',
  '_inPreviewMode',
  '_location',
  '_popup',
];

const DEFAULT_DESKTOP_POSITION = DesktopPosition.bottom;

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state() private hass!: HomeAssistant;
  @state() private _config?: NavbarCardConfig;
  @state() private _isDesktop?: boolean;
  @state() private _inEditDashboardMode?: boolean;
  @state() private _inEditCardMode?: boolean;
  @state() private _inPreviewMode?: boolean;
  @state() private _lastRender?: number;
  @state() private _location?: string;
  @state() private _popup?: any;

  /**********************************************************************/
  /* Lit native callbacks */
  /**********************************************************************/

  connectedCallback(): void {
    super.connectedCallback();

    // Initialize location
    this._location = window.location.pathname;

    // Initialize screen size listener
    window.addEventListener('resize', this._checkDesktop);
    this._checkDesktop();

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

    // Manually append styles to the card to prevent unnecessary style re-rendering
    const style = document.createElement('style');
    style.textContent = this.generateCustomStyles().cssText;
    this.shadowRoot?.appendChild(style);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Remove event listeners
    window.removeEventListener('resize', this._checkDesktop);
  }

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
          config = {
            ...templateConfig,
            ...config,
          };
        }
      }
    }

    // Check for valid configuration
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }
    config.routes.forEach(route => {
      if (route.icon == null) {
        throw new Error('Each route must have an "icon" property configured');
      }
      if (
        route.submenu == null &&
        route.tap_action == null &&
        route.url == null
      ) {
        throw new Error(
          'Each route must have either "url", "submenu" or "tap_action" property configured',
        );
      }
    });

    // Store configuration
    this._config = config;
  }

  /**
   * Manually control whether to re-render or not the card
   */
  shouldUpdate(changedProperties: Map<string, unknown>) {
    for (const propName of changedProperties.keys()) {
      if (PROPS_TO_FORCE_UPDATE.includes(propName)) {
        return true;
      }
      if (
        propName === 'hass'
        // && new Date().getTime() - (this._lastRender ?? 0) > 1000
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Stub configuration to be properly displayed in the "new card"
   * dialog in home assistant
   */
  static getStubConfig(): NavbarCardConfig {
    return {
      routes: [
        { url: window.location.pathname, icon: 'mdi:home', label: 'Home' },
        {
          url: `${window.location.pathname}/devices`,
          icon: 'mdi:devices',
          label: 'Devices',
        },
        {
          url: '/config/automation/dashboard',
          icon: 'mdi:creation',
          label: 'Automations',
        },
        { url: '/config/dashboard', icon: 'mdi:cog', label: 'Settings' },
      ],
    };
  }

  /**********************************************************************/
  /* Navbar callbacks */
  /**********************************************************************/

  /**
   * Label visibility evaluator
   */
  private _shouldShowLabels = () => {
    const { show_labels: desktopShowLabels } = this._config?.desktop ?? {};
    const { show_labels: mobileShowLabels } = this._config?.mobile ?? {};

    return (
      (this._isDesktop && desktopShowLabels) ||
      (!this._isDesktop && mobileShowLabels)
    );
  };

  /**
   * Check if we are on a desktop device
   */
  private _checkDesktop = () => {
    this._isDesktop =
      (window.innerWidth ?? 0) >= (this._config?.desktop?.min_width ?? 768);
  };

  /**
   * Render route item
   */
  private _renderRoute = (route: RouteItem) => {
    const isActive = this._location == route.url;
    let showBadge = false;
    if (route.badge?.show) {
      showBadge = processTemplate(this.hass, route.badge?.show);
    } else if (route.badge?.template) {
      showBadge = processBadgeTemplate(this.hass, route.badge?.template);
    }

    if (processTemplate(this.hass, route.hidden)) {
      return null;
    }

    return html`
      <div
        class="route ${isActive ? 'active' : ''}"
        @click=${(e: MouseEvent) => this._handleClick(e, route)}>
        ${showBadge
          ? html`<div
              class="badge ${isActive ? 'active' : ''}"
              style="background-color: ${route.badge?.color || 'red'};"></div>`
          : html``}

        <div class="button ${isActive ? 'active' : ''}">
          <ha-icon
            class="icon ${isActive ? 'active' : ''}"
            icon="${isActive && route.icon_selected
              ? route.icon_selected
              : route.icon}"></ha-icon>
        </div>
        ${this._shouldShowLabels()
          ? html`<div class="label ${isActive ? 'active' : ''}">
              ${processTemplate(this.hass, route.label) ?? ' '}
            </div>`
          : html``}
      </div>
    `;
  };

  /**
   * Handle gracefully closing the popup
   */
  private _closePopup = () => {
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
  private _openPopup = (
    popupConfig: RouteItem['submenu'],
    target: HTMLElement,
  ) => {
    const anchorRect = target.getBoundingClientRect();

    const { style, labelPositionClassName, popupDirectionClassName } =
      this._getPopupStyles(
        anchorRect,
        !this._isDesktop
          ? 'mobile'
          : (this._config?.desktop?.position ?? DEFAULT_DESKTOP_POSITION),
      );

    this._popup = html`
      <div
        class="navbar-popup-backdrop"
        @click=${() => this._closePopup()}></div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this._isDesktop ? 'desktop' : ''}
        "
        style="${style}">
        ${popupConfig!
          .map((popupItem, index) => {
            const showBadge = processBadgeTemplate(
              this.hass,
              popupItem.badge?.template,
            );

            if (processTemplate(this.hass, popupItem.hidden)) {
              return null;
            }

            return html`<div
              class="
              popup-item 
              ${popupDirectionClassName}
              ${labelPositionClassName}
            "
              style="--index: ${index}"
              @click=${(e: MouseEvent) =>
                this._handleClick(e, popupItem, true)}>
              ${showBadge
                ? html`<div
                    class="badge"
                    style="background-color: ${popupItem.badge?.color ||
                    'red'};"></div>`
                : html``}

              <div class="button">
                <ha-icon class="icon" icon="${popupItem.icon}"></ha-icon>
              </div>
              ${this._shouldShowLabels()
                ? html`<div class="label">
                    ${processTemplate(this.hass, popupItem.label) ?? ' '}
                  </div>`
                : html``}
            </div>`;
          })
          .filter(x => x != null)}
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
  };

  /**
   * Private click callback to handle navigation or tap actions
   */
  private _handleClick = (e: MouseEvent, route: RouteItem, isPopup = false) => {
    // Prevent default
    e.preventDefault();
    e.stopPropagation();

    // Handle click event
    if (!isPopup && route.submenu) {
      // Get the position of the clicked element
      const target = e.currentTarget as HTMLElement;

      this._openPopup(route.submenu, target);
    } else if (route.tap_action != null) {
      const event = new Event('hass-action', { bubbles: true, composed: true });
      // @ts-ignore
      event.detail = {
        action: 'tap',
        config: {
          tap_action: route.tap_action,
        },
      };

      this.dispatchEvent(event);

      // Close popup
      this._closePopup();
    } else {
      navigate(this, route.url);

      // Close popup
      this._closePopup();
    }
  };

  /**********************************************************************/
  /* Render function */
  /**********************************************************************/

  /**
   * Default render function
   */
  protected render() {
    if (!this._config) {
      return html``;
    }

    const { routes, desktop, mobile } = this._config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};

    // Keep last render timestamp for debounced state updates
    this._lastRender = new Date().getTime();

    // Check visualization modes
    const isEditMode =
      this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;

    // Choose css classnames
    const desktopPositionClassname =
      mapStringToEnum(DesktopPosition, desktopPosition as string) ??
      DEFAULT_DESKTOP_POSITION;
    const deviceModeClassName = this._isDesktop ? 'desktop' : 'mobile';
    const editModeClassname = isEditMode ? 'edit-mode' : '';

    // Handle hidden props
    if (
      !isEditMode &&
      ((this._isDesktop && !!processTemplate(this.hass, desktopHidden)) ||
        (!this._isDesktop && !!processTemplate(this.hass, mobileHidden)))
    ) {
      return html``;
    }

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname}">
        ${routes?.map(this._renderRoute).filter(x => x != null)}
      </ha-card>
      ${this._popup}
    `;
  }

  /**********************************************************************/
  /* Styles */
  /**********************************************************************/

  /**
   * Dynamically apply user-provided styles
   */
  private generateCustomStyles(): CSSResult {
    const userStyles = this._config?.styles
      ? unsafeCSS(this._config.styles)
      : css``;

    // Combine default styles and user styles
    return css`
      ${getDefaultStyles()}
      ${userStyles}
    `;
  }
}

console.info(
  `%c navbar-card %c ${version} `,
  // Card name styles
  'background-color: #555;\
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 10px 0 0 10px;',
  // Card version styles
  'background-color: #00abd1; \
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 0 10px 10px 0;',
);
