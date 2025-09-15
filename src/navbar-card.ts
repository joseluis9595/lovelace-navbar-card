import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement, PropertyValues, TemplateResult, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  NavbarCardConfig,
  STUB_CONFIG,
} from './config';
import { NavbarRoute } from '@components';
import {
  fireDOMEvent,
  forceDashboardPadding,
  forceResetRipple,
  getNavbarTemplates,
  injectStyles,
  mapStringToEnum,
  processTemplate,
  removeDashboardPadding,
} from '@utils';
import { getDefaultStyles } from './styles';
import { EventManager } from './event-manager';

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
  eventManager = new EventManager();
  @state() private _routes: NavbarRoute.Route[] = [];
  @state() private _showMediaPlayer?: boolean;
  @state() focussedPopup: TemplateResult<1> | null = null;
  @state() isDesktop?: boolean;

  /** Set HA instance (called by HA runtime) */
  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const { visible } = this._shouldShowMediaPlayer();

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

    // Force popup closure without animation to prevent memory leaks
    this.focussedPopup = null;
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
          config = {
            ...templateConfig,
            ...config,
          };
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

    this._routes = config.routes.map(route => new NavbarRoute.Route(this, route));
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

  /**
   * Check if the media player should be shown.
   */
  private _shouldShowMediaPlayer = (): { visible: boolean; error?: string } => {
    // If the media player is not configured, don't show it
    if (
      !this.config ||
      !this.config.media_player ||
      !this.config.media_player.entity
    ) {
      return { visible: false };
    }

    // If the card is on desktop mode, don't show the media player
    if (this.isDesktop) return { visible: false };

    // Support JSTemplate for entity
    const entity = processTemplate<string>(
      this._hass,
      this,
      this.config.media_player.entity,
    );

    // Get the media player state
    const mediaPlayerState = this._hass.states[entity];

    // If the media player does not exist, display the media player
    if (!mediaPlayerState)
      return {
        visible: true,
        error: `Entity not found "${entity}"`,
      };

    // If the media player visibility is manually configured, use the configured value
    if (this.config.media_player.show != null) {
      const show = processTemplate<boolean>(
        this._hass,
        this,
        this.config.media_player.show,
      );
      return { visible: show };
    }

    return {
      visible: ['playing', 'paused'].includes(mediaPlayerState?.state),
    };
  };

  /**
   * Click handler for the media player card itself.
   */
  private _handleMediaPlayerClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const entity = processTemplate<string>(
      this._hass,
      this,
      this.config?.media_player?.entity,
    );
    if (!entity) return;

    // Open home assistant more-info dialog for the media player
    fireDOMEvent(
      this,
      'hass-more-info',
      {
        bubbles: true,
        composed: true,
      },
      {
        entityId: entity,
      },
    );
  };

  /**
   * Skip to next track.
   */
  private _handleMediaPlayerSkipNextClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const entity = processTemplate<string>(
      this._hass,
      this,
      this.config?.media_player?.entity,
    );
    if (!entity) return;
    this._hass.callService('media_player', 'media_next_track', {
      entity_id: entity,
    });
  };

  /**
   * Click handler for the media player play/pause button.
   */
  private _handleMediaPlayerPlayPauseClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const entity = processTemplate<string>(
      this._hass,
      this,
      this.config?.media_player?.entity,
    );
    if (!entity) return;
    const mediaPlayerState = this._hass.states[entity];
    if (!mediaPlayerState) return;

    if (mediaPlayerState.state === 'playing') {
      this._hass.callService('media_player', 'media_pause', {
        entity_id: entity,
      });
    } else {
      this._hass.callService('media_player', 'media_play', {
        entity_id: entity,
      });
    }
  };

  /**
   * Render the media player card.
   */
  private _renderMediaPlayer = () => {
    const { visible, error } = this._shouldShowMediaPlayer();
    if (!visible) return html``;

    const entity = processTemplate<string>(
      this._hass,
      this,
      this.config!.media_player!.entity,
    );

    if (error) {
      return html`<ha-card class="media-player error">
        <ha-alert alert-type="error"> ${error} </ha-alert>
      </ha-card>`;
    }

    const mediaPlayerState = this._hass.states[entity];
    const progress =
      mediaPlayerState.attributes.media_position != null
        ? mediaPlayerState.attributes.media_position /
          mediaPlayerState.attributes.media_duration
        : null;

    return html`
      <ha-card class="media-player" @click=${this._handleMediaPlayerClick}>
        <div
          class="media-player-bg"
          style=${this.config?.media_player?.album_cover_background
            ? `background-image: url(${
                mediaPlayerState.attributes.entity_picture
              });`
            : ''}></div>
        ${progress != null
          ? html` <div class="media-player-progress-bar">
              <div
                class="media-player-progress-bar-fill"
                style="width: ${progress * 100}%"></div>
            </div>`
          : html``}
        <img
          class="media-player-image"
          src=${mediaPlayerState.attributes.entity_picture}
          alt=${mediaPlayerState.attributes.media_title} />
        <div class="media-player-info">
          <span class="media-player-title"
            >${mediaPlayerState.attributes.media_title}</span
          >
          <span class="media-player-artist"
            >${mediaPlayerState.attributes.media_artist}</span
          >
        </div>
        <ha-button
          class="media-player-button media-player-button-play-pause"
          appearance="accent"
          variant="brand"
          @click=${this._handleMediaPlayerPlayPauseClick}>
          <ha-icon
            icon=${mediaPlayerState.state === 'playing'
              ? 'mdi:pause'
              : 'mdi:play'}></ha-icon>
        </ha-button>
        <ha-button
          class="media-player-button media-player-button-skip"
          appearance="plain"
          variant="neutral"
          @click=${this._handleMediaPlayerSkipNextClick}>
          <ha-icon icon="mdi:skip-next"></ha-icon>
        </ha-button>
      </ha-card>
    `;
  };

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
        ${this._renderMediaPlayer()}
        <ha-card
          class="navbar-card ${deviceClass} ${desktopPosition} ${mobileModeClass}">
          ${this._routes.map(route => route.render()).filter(Boolean)}
        </ha-card>
      </div>
      ${this.focussedPopup ?? html``}
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
