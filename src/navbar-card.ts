import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';
import {
  css,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  unsafeCSS,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  NavbarCardConfig,
  STUB_CONFIG,
} from '@/types';
import { Route } from '@/components/navbar';
import {
  deepMergeKeepArrays,
  forceDashboardPadding,
  forceResetRipple,
  getNavbarTemplates,
  injectStyles,
  mapStringToEnum,
  processTemplate,
  removeDashboardPadding,
} from '@/utils';
import { getDefaultStyles } from './styles';
import { MediaPlayer } from './components/media-player';

declare global {
  interface Window {
    customCards: Array<object>;
  }
}

// Register in HA card list
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Full-width bottom nav on mobile and flexible desktop nav that can be placed on any side.',
});

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  /** Home Assistant state (provided by HA) */
  @property({ attribute: false }) public _hass!: HomeAssistant;

  /** Edit/preview modes */
  @state() private _inEditDashboardMode?: boolean;
  @state() private _inEditCardMode?: boolean;
  @state() private _inPreviewMode?: boolean;

  /** Current card configuration */
  @state() config?: NavbarCardConfig;

  /** Runtime state */
  private readonly _mediaPlayer: MediaPlayer = new MediaPlayer(this);
  @state() private _showMediaPlayer?: boolean;
  @state() private _routes: Route[] = [];
  @state() focusedPopup: TemplateResult<1> | null = null;
  @state() isDesktop?: boolean;

  /** Set HA instance (called by HA runtime) */
  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const { visible } = this._mediaPlayer.shouldShowMediaPlayer();

    if (this._showMediaPlayer !== visible) {
      this._showMediaPlayer = visible;
    }
  }

  /** Returns true if card is in *any* edit or preview mode */
  get isInEditMode(): boolean {
    return (
      !!this._inEditDashboardMode ||
      !!this._inEditCardMode ||
      !!this._inPreviewMode
    );
  }

  /** Stub config shown in HA card picker */
  static getStubConfig(): NavbarCardConfig {
    return STUB_CONFIG;
  }

  /** Loads config editor when card is edited */
  static async getConfigElement() {
    await import('./navbar-card-editor');
    return document.createElement('navbar-card-editor');
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Quick fix for ripple effects
    forceResetRipple(this);
    window.addEventListener('resize', this._checkDesktop);

    this._detectModes();
    this._checkDesktop();

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
      show_media_player: this._showMediaPlayer ?? false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._checkDesktop);
    removeDashboardPadding();

    // Clean up media player and routes
    this._mediaPlayer.destroy();
    this._routes.forEach(r => r.destroy?.());

    // Force popup closure without animation to prevent memory leaks
    this.focusedPopup = null;
  }

  /**
   * Apply new card configuration
   * @param config Card configuration
   */
  setConfig(config: NavbarCardConfig): void {
    // Check if the configuration has an template defined.
    // If so, merge the template configuration with the card configuration,
    // giving priority to the card configuration.
    if (config?.template) {
      const templates = getNavbarTemplates();

      if (templates) {
        // If we have templates, check if the defined template exists
        const templateConfig = templates[config.template];

        if (templateConfig) {
          config = deepMergeKeepArrays(templateConfig, config);
        }
      } else {
        console.warn(
          '[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' +
            '\n\n' +
            'https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n',
        );
      }
    }

    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }

    // Skip if unchanged (avoid rerenders)
    if (JSON.stringify(config) === JSON.stringify(this.config)) return;

    this._routes.forEach(r => r.destroy?.());
    this._routes = config.routes.map(route => new Route(this, route));
    this.config = config;
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
        desktop: this.config?.desktop ?? DEFAULT_NAVBAR_CONFIG.desktop,
        mobile: this.config?.mobile ?? DEFAULT_NAVBAR_CONFIG.mobile,
        auto_padding: this.config?.layout?.auto_padding,
        show_media_player: this._showMediaPlayer ?? false,
      });
    }
  }

  protected render() {
    if (!this.config || this._shouldHide()) return html``;

    const desktopPosition =
      mapStringToEnum(
        DesktopPosition,
        this.config.desktop?.position as string,
      ) ?? DesktopPosition.bottom;

    const deviceClass = this.isDesktop ? 'desktop' : 'mobile';
    const editClass = this.isInEditMode ? 'edit-mode' : '';
    const mobileModeClass =
      this.config.mobile?.mode === 'floating' ? 'floating' : '';

    return html`
      <div
        class="navbar ${editClass} ${deviceClass} ${desktopPosition} ${mobileModeClass}">
        ${this._mediaPlayer.render()}
        <ha-card
          class="navbar-card ${deviceClass} ${desktopPosition} ${mobileModeClass}">
          ${this._routes.map(route => route.render()).filter(Boolean)}
        </ha-card>
      </div>
      ${this.focusedPopup ?? html``}
    `;
  }

  // ---------- Private helpers ----------

  /** Update desktop/mobile state based on window width */
  private _checkDesktop = (): void => {
    this.isDesktop =
      (window.innerWidth || 0) >= (this.config?.desktop?.min_width ?? 768);
  };

  /** Determine if navbar should be hidden */
  private _shouldHide(): boolean {
    if (this.isInEditMode) return false;

    const desktopHidden = processTemplate<boolean>(
      this._hass,
      this,
      this.config?.desktop?.hidden,
    );
    const mobileHidden = processTemplate<boolean>(
      this._hass,
      this,
      this.config?.mobile?.hidden,
    );

    return (
      !this.isInEditMode &&
      ((this.isDesktop && desktopHidden) || (!this.isDesktop && mobileHidden))
    );
  }

  /** Detect edit/preview modes */
  private _detectModes(): void {
    const homeAssistantRoot = document.querySelector('body > home-assistant');

    this._inEditDashboardMode =
      this.parentElement?.closest('hui-card-edit-mode') != null;

    this._inEditCardMode = !!homeAssistantRoot?.shadowRoot
      ?.querySelector('hui-dialog-edit-card')
      ?.shadowRoot?.querySelector('ha-dialog');

    this._inPreviewMode =
      this.parentElement?.closest('.card > .preview') != null;
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
