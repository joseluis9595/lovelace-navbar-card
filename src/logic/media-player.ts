// TODO review this whole logic. Should this file return a
// `visible` property, or use its context to toggle the
// `widgetVisibility` manually?
import { NavbarCard } from '../navbar-card';
import { processTemplate } from '../utils';

/**
 * Check if the media player should be shown.
 */
export const shouldShowMediaPlayer = (
  context: NavbarCard,
):
  | { visible: false }
  | { visible: boolean; error: string }
  | { visible: boolean; entity: string } => {
  // If the media player is not configured, don't show it
  if (
    !context.config ||
    !context.config.media_player ||
    !context.config.media_player.entity
  ) {
    return { visible: false };
  }

  // If the card is on desktop mode, don't show the media player
  if (context.isDesktop) return { visible: false };

  // Support JSTemplate for entity
  const entity = processTemplate<string>(
    context.hass,
    context,
    context.config.media_player.entity,
  );

  // Get the media player state
  const mediaPlayerState = context.hass.states[entity];

  // If the media player does not exist, display the media player
  if (!mediaPlayerState)
    return {
      visible: true,
      error: `Entity not found "${entity}"`,
    };

  // If the media player visibility is manually configured, use the configured value
  if (context.config.media_player.show != null) {
    const show = processTemplate<boolean>(
      context.hass,
      context,
      context.config.media_player.show,
    );
    return { visible: show, entity: entity };
  }

  return {
    visible: ['playing', 'paused'].includes(mediaPlayerState?.state),
    entity: entity,
  };
};
