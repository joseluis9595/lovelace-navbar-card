import { html } from 'lit';
import { NavbarCard } from '../navbar-card';
import { shouldShowMediaPlayer } from '../logic/media-player';
import { eventDetection } from '../logic/event-detection';

export const renderMediaPlayer = (context: NavbarCard) => {
  const mediaPlayerVisibility = shouldShowMediaPlayer(context);
  if (!mediaPlayerVisibility.visible) return html``;

  if ('error' in mediaPlayerVisibility) {
    return html`<ha-card class="media-player error">
      <ha-alert alert-type="error">${mediaPlayerVisibility.error}</ha-alert>
    </ha-card>`;
  }

  const mediaPlayerConfig = context.config?.media_player;
  const { entity } = mediaPlayerVisibility;
  const mediaPlayerState = context.hass.states[entity];

  const {
    state,
    media_position,
    media_duration,
    entity_picture,
    media_title,
    media_artist,
  } = mediaPlayerState.attributes;

  const progress =
    media_position != null && media_duration
      ? media_position / media_duration
      : null;

  const playPauseIcon = state === 'playing' ? 'mdi:pause' : 'mdi:play';

  const handleClick = (cb: () => void) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!entity) return;
    cb();
  };

  const handlePlayPauseClick = handleClick(() => {
    context.hass.callService(
      'media_player',
      state === 'playing' ? 'media_pause' : 'media_play',
      { entity_id: entity },
    );
  });

  const handleSkipClick = handleClick(() => {
    context.hass.callService('media_player', 'media_next_track', {
      entity_id: entity,
    });
  });

  return html`
    <ha-card
      class="media-player"
      ${eventDetection({
        context,
        tap: mediaPlayerConfig?.tap_action ?? {
          action: 'more-info',
          entity: entity,
        },
        hold: mediaPlayerConfig?.hold_action,
        doubleTap: mediaPlayerConfig?.double_tap_action,
      })}>
      <div
        class="media-player-bg"
        style=${context.config?.media_player?.album_cover_background
          ? `background-image: url(${entity_picture});`
          : ''}></div>

      ${progress != null
        ? html`<div class="media-player-progress-bar">
            <div
              class="media-player-progress-bar-fill"
              style="width: ${progress * 100}%"></div>
          </div>`
        : ''}
      ${entity_picture
        ? html`<img
            class="media-player-image"
            src=${entity_picture}
            alt=${media_title} />`
        : html`<ha-icon
            class="media-player-image media-player-icon-fallback"
            icon="mdi:music"></ha-icon>`}

      <div class="media-player-info">
        <span class="media-player-title">${media_title}</span>
        <span class="media-player-artist">${media_artist}</span>
      </div>

      <ha-button
        class="media-player-button media-player-button-play-pause"
        appearance="accent"
        variant="brand"
        @click=${handlePlayPauseClick}>
        <ha-icon icon=${playPauseIcon}></ha-icon>
      </ha-button>

      <ha-button
        class="media-player-button media-player-button-skip"
        appearance="plain"
        variant="neutral"
        @click=${handleSkipClick}>
        <ha-icon icon="mdi:skip-next"></ha-icon>
      </ha-button>
    </ha-card>
  `;
};
