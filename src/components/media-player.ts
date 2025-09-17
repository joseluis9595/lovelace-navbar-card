import { html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { fireDOMEvent, processTemplate } from '@/utils';
import { ActionEvents, ActionableElement } from '@/components/action-events';
import { ExtendedActionConfig } from '@/types';

export class MediaPlayer implements ActionableElement {
  private readonly _events = new ActionEvents();

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

  public executeAction = (
    _target: HTMLElement,
    _element: ActionableElement,
    action: ExtendedActionConfig | undefined,
    actionType: 'tap' | 'hold' | 'double_tap',
  ) => {
    if (action) {
      // TODO JLAQ update README to properly explain this widget does not support custom actions
      // Dispatch the action event for Home Assistant to handle
      fireDOMEvent(
        this._navbarCard,
        'hass-action',
        { bubbles: true, composed: true },
        {
          action: actionType,
          config: { [`${actionType}_action`]: action },
        },
      );
    } else if (actionType === 'tap') {
      // Default tap action: open media player more-info dialog
      const entity = this._getEntity();
      if (entity) {
        fireDOMEvent(
          this._navbarCard,
          'hass-more-info',
          { bubbles: true, composed: true },
          { entityId: entity },
        );
      }
    }
  };

  /**
   * Check if the media player should be shown.
   */
  public shouldShowMediaPlayer = (): { visible: boolean; error?: string } => {
    const config = this._navbarCard.config?.media_player;
    if (!config?.entity) return { visible: false };
    if (this._navbarCard.isDesktop) return { visible: false };

    const entity = this._getEntity();
    const state = this._navbarCard._hass.states[entity ?? ''];

    if (!state) return { visible: true, error: `Entity not found "${entity}"` };

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

  public render = () => {
    const { visible, error } = this.shouldShowMediaPlayer();
    if (!visible) return html``;

    const entity = this._getEntity();
    if (!entity) return html``;

    if (error) {
      return html`<ha-card class="media-player error">
        <ha-alert alert-type="error"> ${error} </ha-alert>
      </ha-card>`;
    }

    const mediaPlayerState = this._navbarCard._hass.states[entity];
    const progress =
      mediaPlayerState.attributes.media_position != null
        ? mediaPlayerState.attributes.media_position /
          mediaPlayerState.attributes.media_duration
        : null;

    return html`
      <ha-card
        class="media-player"
        @pointerdown=${(e: PointerEvent) =>
          this._events.handlePointerDown(e, this)}
        @pointermove=${(e: PointerEvent) =>
          this._events.handlePointerMove(e, this)}
        @pointerup=${(e: PointerEvent) => this._events.handlePointerUp(e, this)}
        @mouseenter=${(e: MouseEvent) => this._events.handleMouseEnter(e, this)}
        @mouseleave=${(e: MouseEvent) =>
          this._events.handleMouseLeave(e, this)}>
        <div
          class="media-player-bg"
          style=${this._navbarCard.config?.media_player?.album_cover_background
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
}
