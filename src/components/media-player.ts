import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import { type ActionableElement, eventDetection } from '@/lib/event-detection';
import type { NavbarCard } from '@/navbar-card';
import {
  DEFAULT_NAVBAR_CONFIG,
  type ExtendedActionConfig,
  type WidgetPosition,
} from '@/types';
import { preventEventDefault, processTemplate } from '@/utils';

export class MediaPlayer implements ActionableElement {
  constructor(private readonly _navbarCard: NavbarCard) {}

  get tap_action(): ExtendedActionConfig | undefined {
    return this._navbarCard.config?.media_player?.tap_action;
  }

  get hold_action(): ExtendedActionConfig | undefined {
    return this._navbarCard.config?.media_player?.hold_action;
  }

  get double_tap_action(): ExtendedActionConfig | undefined {
    return this._navbarCard.config?.media_player?.double_tap_action;
  }

  get desktop_position(): WidgetPosition {
    return (
      this._navbarCard.config?.media_player?.desktop_position ??
      DEFAULT_NAVBAR_CONFIG.media_player.desktop_position
    );
  }

  /**
   * Check if the media player should be shown.
   */
  public isVisible = (): { visible: boolean; error?: string } => {
    const config = this._navbarCard.config?.media_player;
    if (!config?.entity) return { visible: false };

    const entity = this._getEntity();
    const state = this._navbarCard._hass.states[entity ?? ''];

    if (!(state && entity)) {
      return { error: `Entity not found "${entity}"`, visible: true };
    }

    if (config.show != null) {
      return {
        visible: processTemplate<boolean>(
          this._navbarCard._hass,
          this._navbarCard,
          config.show,
        ),
      };
    }

    return { visible: ['playing', 'paused'].includes(state.state) };
  };

  private _getEntity(): string | null {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._navbarCard.config?.media_player?.entity,
    );
  }

  /**
   * Skip to next track.
   */
  private _handleMediaPlayerSkipNextClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const entity = this._getEntity();
    if (entity) {
      this._navbarCard._hass.callService('media_player', 'media_next_track', {
        entity_id: entity,
      });
    }
  };

  /**
   * Click handler for the media player play/pause button.
   */
  private _handleMediaPlayerPlayPauseClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const entity = this._getEntity();
    if (!entity) return;

    const state = this._navbarCard._hass.states[entity];
    if (!state) return;

    const action = state.state === 'playing' ? 'media_pause' : 'media_play';
    this._navbarCard._hass.callService('media_player', action, {
      entity_id: entity,
    });
  };

  public render = (options: { isInsideNavbar: boolean }) => {
    const { visible, error } = this.isVisible();

    if (!visible) return html``;

    if (error) {
      return html`<ha-card class="media-player error">
        <ha-alert alert-type="error"> ${error} </ha-alert>
      </ha-card>`;
    }

    // biome-ignore lint/style/noNonNullAssertion: `isVisible` guarantees that the entity is not null
    const entity = this._getEntity()!;
    const mediaPlayerState = this._navbarCard._hass.states[entity];
    const mediaPlayerImage = mediaPlayerState.attributes.entity_picture;
    const progress =
      mediaPlayerState.attributes.media_position != null
        ? mediaPlayerState.attributes.media_position /
          mediaPlayerState.attributes.media_duration
        : null;

    const deviceClass = this._navbarCard.isDesktop ? 'desktop' : 'mobile';

    return html`
      <ha-card
        class="${classMap({
          'media-player': true,
          'position-absolute': !options.isInsideNavbar,
          [(
            this.desktop_position ??
            DEFAULT_NAVBAR_CONFIG.media_player.desktop_position
          ).toString()]: true,
          [deviceClass]: true,
        })}"
        ${eventDetection({
          context: this._navbarCard,
          doubleTap: this.double_tap_action,
          hold: this.hold_action,
          tap: this.tap_action ?? {
            action: 'more-info',
            entity,
          },
        })}>
        <div
          class="media-player-bg"
          style=${
            this._navbarCard.config?.media_player?.album_cover_background
              ? `background-image: url(${
                  mediaPlayerState.attributes.entity_picture
                });`
              : ''
          }></div>
        ${
          progress != null
            ? html` <div class="media-player-progress-bar">
              <div
                class="media-player-progress-bar-fill"
                style="width: ${progress * 100}%"></div>
            </div>`
            : html``
        }
        ${
          mediaPlayerImage
            ? html`<img
              class="media-player-image"
              src=${mediaPlayerImage}
              alt=${mediaPlayerState.attributes.media_title} />`
            : html`<ha-icon
              class="media-player-image media-player-icon-fallback"
              icon="mdi:music"></ha-icon>`
        }
        <div class="media-player-info">
          <span class="media-player-title"
            >${mediaPlayerState.attributes.media_title}</span
          >
          <span class="media-player-artist"
            >${mediaPlayerState.attributes.media_artist}</span
          >
        </div>
        <button
          class="navbar-icon-button media-player-button media-player-button-play-pause primary"
          appearance="accent"
          variant="brand"
          @click=${this._handleMediaPlayerPlayPauseClick}
          @pointerdown=${preventEventDefault}
          @pointerup=${preventEventDefault}>
          <ha-icon
            icon=${
              mediaPlayerState.state === 'playing' ? 'mdi:pause' : 'mdi:play'
            }></ha-icon>
        </button>
        <button
          class="navbar-icon-button media-player-button media-player-button-skip"
          appearance="plain"
          variant="neutral"
          @click=${this._handleMediaPlayerSkipNextClick}
          @pointerdown=${preventEventDefault}
          @pointerup=${preventEventDefault}>
          <ha-icon icon="mdi:skip-next"></ha-icon>
        </button>
      </ha-card>
    `;
  };
}
