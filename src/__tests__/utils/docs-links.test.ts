import { describe, expect, it } from 'vitest';

import { DOCS_LINKS, getOptionDocsLink } from '../../utils/docs-links';

const BASE = 'https://joseluis9595.github.io/lovelace-navbar-card/docs';

describe('getOptionDocsLink', () => {
  it.each([
    ['routes.0.icon_color', 'configuration/routes#icon_color'],
    ['routes.2.tap_action', 'configuration/routes#tap_action'],
    ['routes.0.badge.show', 'configuration/routes#badge-show'],
    ['routes.0.badge.icon', 'configuration/routes#badge-icon'],
    ['routes.0.badge.icon_color', 'configuration/routes#badge-icon_color'],
    ['routes.0.popup.1.url', 'configuration/routes#popup-url'],
    ['routes.0.popup.1.badge.icon', 'configuration/routes#badge-icon'],
    ['routes.0.popup.1.badge.count', 'configuration/routes#badge-count'],
    ['desktop.position', 'configuration/desktop#position'],
    ['mobile.safe_area', 'configuration/mobile#safe_area'],
    ['layout.reflect_child_state', 'configuration/layout#reflect_child_state'],
    [
      'layout.auto_padding.desktop_px',
      'configuration/layout#auto-padding-desktop_px',
    ],
    ['haptic.hold_action', 'configuration/haptic#hold_action'],
    [
      'media_player.album_cover_background',
      'configuration/media-player#album_cover_background',
    ],
    [
      'media_player.players.0.entity',
      'configuration/media-player#players-entity',
    ],
    ['media_player.players.1.show', 'configuration/media-player#players-show'],
  ])('links %s to its option row', (configKey, path) => {
    expect(getOptionDocsLink(configKey)).toBe(`${BASE}/${path}`);
  });

  it('links styles and templates to their pages', () => {
    expect(getOptionDocsLink('styles')).toBe(DOCS_LINKS.styles);
    expect(getOptionDocsLink('template')).toBe(DOCS_LINKS.template);
  });

  it('returns nothing for keys without documentation', () => {
    expect(getOptionDocsLink('routes.0.tap_action.navigation_path')).toBe(
      undefined,
    );
    expect(getOptionDocsLink('unknown.key')).toBeUndefined();
  });
});
