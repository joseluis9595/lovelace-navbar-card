import type { HassEntity } from 'home-assistant-js-websocket';
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import { eventDetection } from '@/lib/event-detection';
import type { NavbarCard } from '@/navbar-card';
import {
  DEFAULT_NAVBAR_CONFIG,
  type MediaPlayerPlayerConfig,
  type WidgetPosition,
} from '@/types';
import { preventEventDefault, processTemplate } from '@/utils';

const CAROUSEL_GAP = 12;

export class MediaPlayer {
  private _activeIndex = 0;
  private _trackPointerId: number | null = null;
  private _dragStartX = 0;
  private _dragOffset = 0;
  private _isDragging = false;

  constructor(private readonly _navbarCard: NavbarCard) {}

  get desktop_position(): WidgetPosition {
    return (
      this._navbarCard.config?.media_player?.desktop_position ??
      DEFAULT_NAVBAR_CONFIG.media_player.desktop_position
    );
  }

  /**
   * Check if the media player widget should be shown.
   */
  public isVisible = (): { visible: boolean; error?: string } => {
    const config = this._navbarCard.config?.media_player;
    const players = config?.players ?? [];
    if (players.length === 0) return { visible: false };

    if (config?.show != null) {
      const widgetVisible = processTemplate<boolean>(
        this._navbarCard._hass,
        this._navbarCard,
        config.show,
      );
      if (!widgetVisible) return { visible: false };
    }

    for (const player of players) {
      const result = this._isPlayerVisible(player);
      if (result.visible || result.error) return result;
    }
    return { visible: false };
  };

  /**
   * Render either a single media-player card or a carousel of media-player cards.
   */
  public render = (options: { isInsideNavbar: boolean }) => {
    const { visible } = this.isVisible();
    if (!visible) return html``;

    const allPlayers = this._navbarCard.config?.media_player?.players ?? [];
    const visiblePlayers = allPlayers.filter(
      p => this._isPlayerVisible(p).visible,
    );

    this._activeIndex = Math.max(
      0,
      Math.min(this._activeIndex, visiblePlayers.length - 1),
    );

    if (visiblePlayers.length <= 1) {
      return this._renderSingle(visiblePlayers[0], options);
    }
    return this._renderCarousel(visiblePlayers, options);
  };

  /**
   * Check if one specific player should be shown.
   */
  private _isPlayerVisible(player: MediaPlayerPlayerConfig): {
    visible: boolean;
    error?: string;
  } {
    const entity = this._resolveEntity(player);
    const state = this._navbarCard._hass.states[entity ?? ''];

    if (!(state && entity)) {
      return { error: `Entity not found "${entity}"`, visible: true };
    }

    if (player.show != null) {
      return {
        visible: processTemplate<boolean>(
          this._navbarCard._hass,
          this._navbarCard,
          player.show,
        ),
      };
    }

    return { visible: ['playing', 'paused'].includes(state.state) };
  }

  /**
   * Resolve the entity ID for a player.
   */
  private _resolveEntity(player: MediaPlayerPlayerConfig): string | null {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      player.entity,
    );
  }

  private _resolveIcon(player: MediaPlayerPlayerConfig): string | null {
    return player.icon
      ? processTemplate<string>(
          this._navbarCard._hass,
          this._navbarCard,
          player.icon,
        )
      : null;
  }

  /**
   * Resolve the title for a player. Falls back to the media_title attribute.
   */
  private _resolveTitle(
    player: MediaPlayerPlayerConfig,
    state: HassEntity,
  ): string {
    return player.title
      ? processTemplate<string>(
          this._navbarCard._hass,
          this._navbarCard,
          player.title,
        )
      : (state.attributes.media_title ?? '');
  }

  /**
   * Resolve the subtitle for a player. Falls back to the media_artist attribute.
   */
  private _resolveSubtitle(
    player: MediaPlayerPlayerConfig,
    state: HassEntity,
  ): string {
    return player.subtitle
      ? processTemplate<string>(
          this._navbarCard._hass,
          this._navbarCard,
          player.subtitle,
        )
      : (state.attributes.media_artist ?? '');
  }

  private _handlePlayPause = (e: MouseEvent, entity: string) => {
    e.preventDefault();
    e.stopPropagation();
    const state = this._navbarCard._hass.states[entity];
    if (!state) return;
    const action = state.state === 'playing' ? 'media_pause' : 'media_play';
    this._navbarCard._hass.callService('media_player', action, {
      entity_id: entity,
    });
  };

  private _handleSkipNext = (e: MouseEvent, entity: string) => {
    e.preventDefault();
    e.stopPropagation();
    this._navbarCard._hass.callService('media_player', 'media_next_track', {
      entity_id: entity,
    });
  };

  private _onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this._trackPointerId = e.pointerId;
    this._dragStartX = e.clientX;
    this._dragOffset = 0;
    this._isDragging = false;
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this._trackPointerId) return;
    const dx = e.clientX - this._dragStartX;

    if (!this._isDragging) {
      if (Math.abs(dx) < 10) return;
      this._isDragging = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    e.preventDefault();
    const count = this._navbarCard.config?.media_player?.players?.length ?? 0;
    const atEdge =
      (this._activeIndex === 0 && dx > 0) ||
      (this._activeIndex === count - 1 && dx < 0);
    this._dragOffset = atEdge ? dx * 0.2 : dx;
    this._navbarCard.requestUpdate();
  };

  private _onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this._trackPointerId) return;
    this._trackPointerId = null;

    if (!this._isDragging) return;

    const el = e.currentTarget as HTMLElement;
    el.releasePointerCapture(e.pointerId);

    const threshold = el.offsetWidth * 0.3;
    const count = this._navbarCard.config?.media_player?.players?.length ?? 0;

    if (this._dragOffset < -threshold && this._activeIndex < count - 1) {
      this._activeIndex++;
    } else if (this._dragOffset > threshold && this._activeIndex > 0) {
      this._activeIndex--;
    }

    this._dragOffset = 0;
    this._isDragging = false;
    this._navbarCard.requestUpdate();
  };

  private _onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== this._trackPointerId) return;
    this._trackPointerId = null;
    this._isDragging = false;
    this._dragOffset = 0;
    this._navbarCard.requestUpdate();
  };

  /**
   * Render a single media-player card.
   */
  private _renderSingle(
    player: MediaPlayerPlayerConfig,
    options: { isInsideNavbar: boolean },
  ) {
    const entity = this._resolveEntity(player);
    const state = this._navbarCard._hass.states[entity ?? ''];

    if (!(state && entity)) {
      return html`<ha-card class="media-player error">
        <ha-alert alert-type="error">Entity not found "${entity}"</ha-alert>
      </ha-card>`;
    }

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
          doubleTap: player.double_tap_action,
          hold: player.hold_action,
          tap: player.tap_action ?? { action: 'more-info', entity },
        })}>
        ${this._renderCardContent(player, entity, state)}
      </ha-card>
    `;
  }

  /**
   * Render the multi-player carousel.
   */
  private _renderCarousel(
    players: MediaPlayerPlayerConfig[],
    options: { isInsideNavbar: boolean },
  ) {
    const deviceClass = this._navbarCard.isDesktop ? 'desktop' : 'mobile';
    const pct = -(this._activeIndex * 100);
    const gapPx = -(this._activeIndex * CAROUSEL_GAP) + this._dragOffset;
    const transition = this._isDragging ? 'none' : 'transform 0.3s ease-out';
    const transform = `translateX(calc(${pct}% + ${gapPx}px))`;

    return html`
      <div
        class="${classMap({
          'media-player-carousel': true,
          'position-absolute': !options.isInsideNavbar,
          [(
            this.desktop_position ??
            DEFAULT_NAVBAR_CONFIG.media_player.desktop_position
          ).toString()]: true,
          [deviceClass]: true,
        })}">
        <div
          class="media-player-viewport"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}>
          <div
            class="media-player-track"
            style="transform: ${transform}; transition: ${transition}">
            ${players.map(p => this._renderSlide(p))}
          </div>
        </div>
        <div class="media-player-dots">
          ${players.map(
            (_, i) =>
              html`<span
                class="${classMap({
                  active: i === this._activeIndex,
                  'media-player-dot': true,
                })}"></span>`,
          )}
        </div>
      </div>
    `;
  }

  /**
   * Render a single slide inside the carousel.
   */
  private _renderSlide(player: MediaPlayerPlayerConfig) {
    const entity = this._resolveEntity(player);
    const state = this._navbarCard._hass.states[entity ?? ''];

    if (!(state && entity)) {
      return html`<ha-card class="media-player error">
        <ha-alert alert-type="error">Entity not found "${entity}"</ha-alert>
      </ha-card>`;
    }

    return html`
      <ha-card
        class="media-player"
        ${eventDetection({
          context: this._navbarCard,
          doubleTap: player.double_tap_action,
          hold: player.hold_action,
          tap: player.tap_action ?? { action: 'more-info', entity },
        })}>
        ${this._renderCardContent(player, entity, state)}
      </ha-card>
    `;
  }

  /**
   * Render the content of a media-player card.
   */
  private _renderCardContent(
    player: MediaPlayerPlayerConfig,
    entity: string,
    state: HassEntity,
  ) {
    const image = state.attributes.entity_picture;
    const pos = state.attributes.media_position;
    const dur = state.attributes.media_duration;
    const progress = pos != null && dur != null && dur > 0 ? pos / dur : null;
    const icon = this._resolveIcon(player);
    const title = this._resolveTitle(player, state);
    const subtitle = this._resolveSubtitle(player, state);
    const albumBg =
      this._navbarCard.config?.media_player?.album_cover_background ??
      DEFAULT_NAVBAR_CONFIG.media_player.album_cover_background;

    return html`
      <div
        class="media-player-bg"
        style=${
          albumBg
            ? `background-image: url(${state.attributes.entity_picture});`
            : ''
        }></div>
      ${
        progress != null
          ? html`<div class="media-player-progress-bar">
              <div
                class="media-player-progress-bar-fill"
                style="width: ${progress * 100}%"></div>
            </div>`
          : html``
      }
      ${
        image && !icon
          ? html`<img
              class="media-player-image"
              src=${image}
              alt=${title || ''} />`
          : html`<ha-icon
              class="media-player-image media-player-icon-fallback"
              icon=${icon ?? 'mdi:music'}></ha-icon>`
      }
      <div class="media-player-info">
        <span class="media-player-title">${title || ''}</span>
        <span class="media-player-artist">${subtitle || ''}</span>
      </div>
      <button
        class="navbar-icon-button media-player-button media-player-button-play-pause primary"
        appearance="accent"
        variant="brand"
        @click=${(e: MouseEvent) => this._handlePlayPause(e, entity)}
        @pointerdown=${preventEventDefault}
        @pointerup=${preventEventDefault}>
        <ha-icon
          icon=${
            state.state === 'playing' ? 'mdi:pause' : 'mdi:play'
          }></ha-icon>
      </button>
      <button
        class="navbar-icon-button media-player-button media-player-button-skip"
        appearance="plain"
        variant="neutral"
        @click=${(e: MouseEvent) => this._handleSkipNext(e, entity)}
        @pointerdown=${preventEventDefault}
        @pointerup=${preventEventDefault}>
        <ha-icon icon="mdi:skip-next"></ha-icon>
      </button>
    `;
  }
}
