import {
  css,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  unsafeCSS,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';
import {
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  NavbarCardConfig,
  STUB_CONFIG,
} from './config';
import {
  mapStringToEnum,
  processTemplate,
} from './utils';
import {
  forceDashboardPadding,
  forceResetRipple,
  getNavbarTemplates,
  injectStyles,
  removeDashboardPadding,
} from './utils/dom-utils';
import { getDefaultStyles } from './styles';
import { Route } from './navbar/route/route';

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

const DEFAULT_DESKTOP_POSITION = DesktopPosition.bottom;

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @property({ attribute: false }) public _hass!: HomeAssistant;

  @state() isDesktop?: boolean;
  @state() private _config?: NavbarCardConfig;
  @state() private _inEditDashboardMode?: boolean;
  @state() private _inEditCardMode?: boolean;
  @state() private _inPreviewMode?: boolean;

  @state() private _popup?: TemplateResult | null;
  @state() private _routes?: Route[];
  @state() private _showMediaPlayer?: boolean;

  /**********************************************************************/
  /* Lit native callbacks */
  /**********************************************************************/

  connectedCallback(): void {
    super.connectedCallback();

    // Quick fix for ripple effects
    forceResetRipple(this);

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

    // Inject styles into the card to prevent unnecessary style re-rendering
    injectStyles(
      this,
      getDefaultStyles(),
      this._config?.styles ? unsafeCSS(this._config.styles) : css``,
    );

    // Force dashboard padding
    forceDashboardPadding({
      desktop: this._config?.desktop ?? DEFAULT_NAVBAR_CONFIG.desktop,
      mobile: this._config?.mobile ?? DEFAULT_NAVBAR_CONFIG.mobile,
      auto_padding: this._config?.layout?.auto_padding,
      show_media_player: this._showMediaPlayer ?? false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Remove screen size listener
    window.removeEventListener('resize', this._checkDesktop);

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
    const { visible } = this._shouldShowMediaPlayer();

    if (this._showMediaPlayer !== visible) {
      this._showMediaPlayer = visible;
    }
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

    // Store configuration
    this._config = config;

    config.routes.forEach(route => new Route(this, route));
  }

  /**
   * Native `updated` lit callback
   */
  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // Re-apply dashboard padding if media player visibility changes
    if (_changedProperties.has('_showMediaPlayer')) {
      // Force dashboard padding
      forceDashboardPadding({
        desktop: this._config?.desktop ?? DEFAULT_NAVBAR_CONFIG.desktop,
        mobile: this._config?.mobile ?? DEFAULT_NAVBAR_CONFIG.mobile,
        auto_padding: this._config?.layout?.auto_padding,
        show_media_player: this._showMediaPlayer ?? false,
      });
    }
  }

  /**
   * Stub configuration to be properly displayed in the "new card"
   * dialog in home assistant
   */
  static getStubConfig(): NavbarCardConfig {
    return STUB_CONFIG;
  }

  protected render() {
    if (!this._config) {
      return html``;
    }

    const { routes, desktop, mobile } = this._config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};

    // Check visualization modes
    const isEditMode =
      this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;

    // Choose css classnames
    const desktopPositionClassname =
      mapStringToEnum(DesktopPosition, desktopPosition as string) ??
      DEFAULT_DESKTOP_POSITION;
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
        <ha-card
          class="navbar-card ${deviceModeClassName} ${desktopPositionClassname} ${mobileModeClassname}">
          ${routes?.map(route => route.render()).filter(x => x != null)}
        </ha-card>
      </div>
      ${this._popup}
    `;
  }

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
