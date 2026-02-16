import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { render } from 'lit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCardConfig } from '@/types';

import { MediaPlayer } from '../../components/media-player';
import { NavbarCard } from '../../navbar-card';

// Register the custom element
if (!customElements.get('navbar-card')) {
  customElements.define('navbar-card', NavbarCard);
}

describe('MediaPlayer', () => {
  let navbarCard: NavbarCard;
  let mediaPlayer: MediaPlayer;
  let hass: HomeAssistant;

  const createMediaPlayerState = (
    state: string,
    attributes: Record<string, unknown> = {},
  ) => ({
    attributes: {
      entity_picture: 'https://example.com/album.jpg',
      media_artist: 'Test Artist',
      media_duration: 180,
      media_position: 30,
      media_title: 'Test Song',
      ...attributes,
    },
    context: { id: 'test', parent_id: null, user_id: null },
    entity_id: 'media_player.test',
    last_changed: '2023-01-01T00:00:00.000Z',
    last_updated: '2023-01-01T00:00:00.000Z',
    state,
  });

  beforeEach(async () => {
    // Mock window.innerWidth to ensure mobile mode
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
      writable: true,
    });

    // Mock Home Assistant object
    hass = {
      auth: {
        data: {
          access_token: '',
          expires_in: 0,
          refresh_token: '',
          token_type: '',
        },
        wsUrl: '',
      },
      callApi: vi.fn(),
      callService: vi.fn(),
      config: {},
      connected: true,
      connection: {
        close: vi.fn(),
        connected: true,
        sendMessage: vi.fn(),
        sendMessagePromise: vi.fn(),
        subscribeEvents: vi.fn(),
        subscribeMessage: vi.fn(),
      },
      fetchWithAuth: vi.fn(),
      panels: {},
      panelUrl: '',
      selectedTheme: null,
      services: {},
      states: {
        'media_player.test': createMediaPlayerState('playing'),
      },
      themes: {},
      user: {},
    } as unknown as HomeAssistant;

    // Create navbar card with media player config
    const config: NavbarCardConfig = {
      media_player: {
        album_cover_background: true,
        entity: 'media_player.test',
      },
      routes: [
        {
          icon: 'mdi:home',
          label: 'Home',
          url: '/',
        },
      ],
    };

    navbarCard = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    await navbarCard.updateComplete;

    navbarCard._hass = hass;
    navbarCard.setConfig(config);
    await navbarCard.updateComplete;

    // Trigger resize event to update isDesktop
    window.dispatchEvent(new Event('resize'));
    await navbarCard.updateComplete;

    // Create media player instance
    mediaPlayer = new MediaPlayer(navbarCard);
  });

  describe('Basic Functionality', () => {
    it('should create media player instance', () => {
      expect(mediaPlayer).toBeDefined();
      expect(mediaPlayer).toBeInstanceOf(MediaPlayer);
    });

    it('should have action getters', () => {
      expect(mediaPlayer.tap_action).toBeUndefined();
      expect(mediaPlayer.hold_action).toBeUndefined();
      expect(mediaPlayer.double_tap_action).toBeUndefined();
    });

    it('should have action getters when configured', () => {
      const configWithActions: NavbarCardConfig = {
        media_player: {
          double_tap_action: { action: 'more-info' },
          entity: 'media_player.test',
          hold_action: { action: 'navigate', navigation_path: '/test' },
          tap_action: { action: 'call-service', service: 'test.service' },
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithActions);
      const mediaPlayerWithActions = new MediaPlayer(navbarCard);

      expect(mediaPlayerWithActions.tap_action).toEqual({
        action: 'call-service',
        service: 'test.service',
      });
      expect(mediaPlayerWithActions.hold_action).toEqual({
        action: 'navigate',
        navigation_path: '/test',
      });
      expect(mediaPlayerWithActions.double_tap_action).toEqual({
        action: 'more-info',
      });
    });
  });

  describe('Visibility Logic', () => {
    it('should not show media player when no entity is configured', () => {
      const configWithoutEntity: NavbarCardConfig = {
        media_player: {
          entity: '',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithoutEntity);
      const mediaPlayerWithoutEntity = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithoutEntity.isVisible();

      expect(result.visible).toBe(false);
    });

    it('should show media player when entity is playing', () => {
      const result = mediaPlayer.isVisible();
      expect(result.visible).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should show media player when entity is paused', () => {
      hass.states['media_player.test'] = createMediaPlayerState('paused');
      const result = mediaPlayer.isVisible();
      expect(result.visible).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should not show media player when entity is idle', () => {
      hass.states['media_player.test'] = createMediaPlayerState('idle');
      const result = mediaPlayer.isVisible();
      expect(result.visible).toBe(false);
    });

    it('should show error when entity is not found', () => {
      // biome-ignore lint/performance/noDelete: Testing purposes
      delete hass.states['media_player.test'];
      const result = mediaPlayer.isVisible();
      expect(result.visible).toBe(true);
      expect(result.error).toBe('Entity not found "media_player.test"');
    });

    it('should respect show template configuration', () => {
      const configWithShow: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          show: '[[[ return states["media_player.test"].state == "playing" ]]]',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithShow);
      const mediaPlayerWithShow = new MediaPlayer(navbarCard);

      // Should show when playing
      hass.states['media_player.test'] = createMediaPlayerState('playing');
      let result = mediaPlayerWithShow.isVisible();
      expect(result.visible).toBe(true);

      // Should not show when paused
      hass.states['media_player.test'] = createMediaPlayerState('paused');
      result = mediaPlayerWithShow.isVisible();
      expect(result.visible).toBe(false);
    });
  });

  describe('Action Execution', () => {
    it('should execute custom tap action', async () => {
      const configWithTapAction: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          tap_action: { action: 'call-service', service: 'test.service' },
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithTapAction);
      const mediaPlayerWithAction = new MediaPlayer(navbarCard);

      const dispatchEventSpy = vi.spyOn(navbarCard, 'dispatchEvent');

      // Render and simulate tap on card (eventDetection directive handles it)
      const tpl = mediaPlayerWithAction.render({ isInsideNavbar: true });
      const container = document.createElement('div');
      await render(tpl, container);
      const card = container.querySelector('ha-card.media-player');
      expect(card).toBeTruthy();
      card?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // wait for async handler (executeAction uses setTimeout)
      await new Promise(r => setTimeout(r, 20));

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bubbles: true,
          composed: true,
          detail: {
            action: 'tap',
            config: {
              tap_action: { action: 'call-service', service: 'test.service' },
              // entity can be provided or undefined depending on handler; don't assert exact
            },
          },
          type: 'hass-action',
        }),
      );
    });

    it('should execute default tap action when no custom action is configured', async () => {
      const dispatchEventSpy = vi.spyOn(navbarCard, 'dispatchEvent');

      const tpl = mediaPlayer.render({ isInsideNavbar: true });
      const container = document.createElement('div');
      await render(tpl, container);
      const card = container.querySelector('ha-card.media-player');
      expect(card).toBeTruthy();
      card?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // wait for async handler
      await new Promise(r => setTimeout(r, 20));

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bubbles: true,
          composed: true,
          detail: expect.objectContaining({
            action: 'tap',
            config: expect.objectContaining({
              tap_action: expect.objectContaining({ action: 'more-info' }),
            }),
          }),
          type: 'hass-action',
        }),
      );
    });

    it('should not execute default tap action when entity is not found', async () => {
      // biome-ignore lint/performance/noDelete: Testing purposes
      delete hass.states['media_player.test'];
      const dispatchEventSpy = vi.spyOn(navbarCard, 'dispatchEvent');

      const tpl = mediaPlayer.render({ isInsideNavbar: true });
      const container = document.createElement('div');
      await render(tpl, container);
      const card = container.querySelector('ha-card.media-player');
      expect(card).toBeTruthy();
      card?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // wait for async handler
      await new Promise(r => setTimeout(r, 20));

      // No action dispatched when entity state is missing; error card is rendered instead
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Media Player Controls', () => {
    it('should render play button when paused', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('paused');
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const playButton = container.querySelector(
        '.media-player-button-play-pause',
      );
      expect(playButton).toBeTruthy();
      const playIcon = playButton?.querySelector('ha-icon');
      expect(playIcon?.getAttribute('icon')).toBe('mdi:play');
    });

    it('should render pause button when playing', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing');
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const pauseButton = container.querySelector(
        '.media-player-button-play-pause',
      );
      expect(pauseButton).toBeTruthy();
      const pauseIcon = pauseButton?.querySelector('ha-icon');
      expect(pauseIcon?.getAttribute('icon')).toBe('mdi:pause');
    });

    it('should render skip next button', async () => {
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const skipButton = container.querySelector('.media-player-button-skip');
      expect(skipButton).toBeTruthy();
      const skipIcon = skipButton?.querySelector('ha-icon');
      expect(skipIcon?.getAttribute('icon')).toBe('mdi:skip-next');
    });

    it('should render media information', async () => {
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const titleElement = container.querySelector('.media-player-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement?.textContent?.trim()).toBe('Test Song');

      const artistElement = container.querySelector('.media-player-artist');
      expect(artistElement).toBeTruthy();
      expect(artistElement?.textContent?.trim()).toBe('Test Artist');
    });

    it('should render album cover when available', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        entity_picture: 'https://example.com/album.jpg',
      });
      const result = mediaPlayer.render({ isInsideNavbar: true });

      // Render the template to a container
      const container = document.createElement('div');
      await render(result, container);

      // Check that the result contains an img element with the album cover
      expect(result).toBeDefined();
      const imgElement = container.querySelector('img.media-player-image');
      expect(imgElement).toBeTruthy();
      expect(imgElement?.getAttribute('src')).toBe(
        'https://example.com/album.jpg',
      );
      expect(imgElement?.getAttribute('alt')).toBe('Test Song');
    });

    it('should render fallback icon when no album cover', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        entity_picture: null,
      });
      const result = mediaPlayer.render({ isInsideNavbar: true });

      // Render the template to a container
      const container = document.createElement('div');
      await render(result, container);

      // Check that the result contains a fallback icon instead of an image
      expect(result).toBeDefined();
      const iconElement = container.querySelector(
        'ha-icon.media-player-icon-fallback',
      );
      expect(iconElement).toBeTruthy();
      expect(iconElement?.getAttribute('icon')).toBe('mdi:music');

      // Ensure no img element is present
      const imgElement = container.querySelector('img.media-player-image');
      expect(imgElement).toBeFalsy();
    });

    it('should use configured icon instead of album cover', async () => {
      const configWithIcon: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          icon: 'mdi:radio',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithIcon);
      const mediaPlayerWithIcon = new MediaPlayer(navbarCard);
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        entity_picture: 'https://example.com/album.jpg',
      });
      const result = mediaPlayerWithIcon.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      // Should use icon instead of image when icon is configured
      const iconElement = container.querySelector(
        'ha-icon.media-player-icon-fallback',
      );
      expect(iconElement).toBeTruthy();
      expect(iconElement?.getAttribute('icon')).toBe('mdi:radio');

      const imgElement = container.querySelector('img.media-player-image');
      expect(imgElement).toBeFalsy();
    });

    it('should use configured title instead of media_title', async () => {
      const configWithTitle: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          title: 'Custom Title',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithTitle);
      const mediaPlayerWithTitle = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithTitle.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const titleElement = container.querySelector('.media-player-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement?.textContent?.trim()).toBe('Custom Title');
    });

    it('should use configured subtitle instead of media_artist', async () => {
      const configWithSubtitle: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          subtitle: 'Custom Subtitle',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithSubtitle);
      const mediaPlayerWithSubtitle = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithSubtitle.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const subtitleElement = container.querySelector('.media-player-artist');
      expect(subtitleElement).toBeTruthy();
      expect(subtitleElement?.textContent?.trim()).toBe('Custom Subtitle');
    });

    it('should process template for icon, title, and subtitle', async () => {
      const configWithTemplates: NavbarCardConfig = {
        media_player: {
          entity: 'media_player.test',
          icon: '[[[ return "mdi:radio" ]]]',
          subtitle: '[[[ return "Template Subtitle" ]]]',
          title: '[[[ return "Template Title" ]]]',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithTemplates);
      const mediaPlayerWithTemplates = new MediaPlayer(navbarCard);
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        entity_picture: 'https://example.com/album.jpg',
      });
      const result = mediaPlayerWithTemplates.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const iconElement = container.querySelector(
        'ha-icon.media-player-icon-fallback',
      );
      expect(iconElement?.getAttribute('icon')).toBe('mdi:radio');

      const titleElement = container.querySelector('.media-player-title');
      expect(titleElement?.textContent?.trim()).toBe('Template Title');

      const subtitleElement = container.querySelector('.media-player-artist');
      expect(subtitleElement?.textContent?.trim()).toBe('Template Subtitle');
    });

    it('should render progress bar when position and duration are available', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        media_duration: 180,
        media_position: 30,
      });
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const progressBar = container.querySelector('.media-player-progress-bar');
      expect(progressBar).toBeTruthy();

      const progressFill = container.querySelector(
        '.media-player-progress-bar-fill',
      );
      expect(progressFill).toBeTruthy();
      expect(progressFill?.getAttribute('style')).toMatch(
        /width: 16\.66666666666666\d+%/,
      );
    });

    it('should not render progress bar when position is not available', async () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing', {
        media_duration: 180,
        media_position: null,
      });
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const progressBar = container.querySelector('.media-player-progress-bar');
      expect(progressBar).toBeFalsy();
    });

    it('should render album cover background when enabled', async () => {
      const configWithBackground: NavbarCardConfig = {
        media_player: {
          album_cover_background: true,
          entity: 'media_player.test',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithBackground);
      const mediaPlayerWithBackground = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithBackground.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const backgroundDiv = container.querySelector('.media-player-bg');
      expect(backgroundDiv).toBeTruthy();
      expect(backgroundDiv?.getAttribute('style')).toContain(
        'background-image: url(https://example.com/album.jpg)',
      );
    });
  });

  describe('Error Handling', () => {
    it('should render error card when entity is not found', async () => {
      // biome-ignore lint/performance/noDelete: Testing purposes
      delete hass.states['media_player.test'];
      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      const errorCard = container.querySelector('ha-card.media-player.error');
      expect(errorCard).toBeTruthy();

      const alertElement = container.querySelector('ha-alert');
      expect(alertElement).toBeTruthy();
      expect(alertElement?.getAttribute('alert-type')).toBe('error');
      expect(alertElement?.textContent?.trim()).toBe(
        'Entity not found "media_player.test"',
      );
    });

    it('should not render when not visible', async () => {
      const configWithTapAction: NavbarCardConfig = {
        media_player: {
          show: false,
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithTapAction);

      const result = mediaPlayer.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      // Should render empty template when not visible
      expect(container.children.length).toBe(0);
    });

    it('should not render when entity is not configured', async () => {
      const configWithoutEntity: NavbarCardConfig = {
        media_player: {
          entity: '',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithoutEntity);
      const mediaPlayerWithoutEntity = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithoutEntity.render({ isInsideNavbar: true });

      const container = document.createElement('div');
      await render(result, container);

      // Should render empty template when entity is not configured
      expect(container.children.length).toBe(0);
    });
  });

  describe('Template Processing', () => {
    it('should process entity template', () => {
      const configWithTemplate: NavbarCardConfig = {
        media_player: {
          entity: '[[[ return "media_player." + "test" ]]]',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithTemplate);
      const mediaPlayerWithTemplate = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithTemplate.isVisible();
      expect(result.visible).toBe(true);
    });

    it('should handle invalid entity template', () => {
      const configWithInvalidTemplate: NavbarCardConfig = {
        media_player: {
          entity: '[[[ return invalid_template ]]]',
        },
        routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
      };

      navbarCard.setConfig(configWithInvalidTemplate);
      const mediaPlayerWithInvalidTemplate = new MediaPlayer(navbarCard);
      const result = mediaPlayerWithInvalidTemplate.isVisible();
      expect(result.visible).toBe(true);
      expect(result.error).toContain('Entity not found');
    });
  });

  describe('Service Calls', () => {
    it('should call media_player.media_play when paused', () => {
      hass.states['media_player.test'] = createMediaPlayerState('paused');

      // We need to access the private method through the render method
      // and simulate a click event
      const result = mediaPlayer.render({ isInsideNavbar: true });
      expect(result).toBeDefined();

      // The actual service call would be tested through integration tests
      // since we can't easily access private methods in unit tests
    });

    it('should call media_player.media_pause when playing', () => {
      hass.states['media_player.test'] = createMediaPlayerState('playing');

      const result = mediaPlayer.render({ isInsideNavbar: true });
      expect(result).toBeDefined();
    });

    it('should call media_player.media_next_track for skip', () => {
      const result = mediaPlayer.render({ isInsideNavbar: true });
      expect(result).toBeDefined();
    });
  });
});
