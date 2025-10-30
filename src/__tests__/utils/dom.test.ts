import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { css } from 'lit';
import {
  getNavbarTemplates,
  forceResetRipple,
  forceOpenEditMode,
  removeDashboardPadding,
  forceDashboardPadding,
  fireDOMEvent,
  injectStyles,
  hapticFeedback,
  preventEventDefault,
} from '../../utils/dom';
import { NavbarCardConfig, DesktopPosition } from '@/types/config';

// Type definitions for test mocks
interface MockLovelacePanel extends HTMLElement {
  lovelace?: {
    config: {
      'navbar-templates'?: Record<string, NavbarCardConfig>;
    };
  };
}

interface MockRippleElement extends HTMLElement {
  hovered?: boolean;
  pressed?: boolean;
}

interface MockHuiRoot extends HTMLElement {
  lovelace?: {
    setEditMode: (enabled: boolean) => void;
  };
}

interface MockEvent extends Event {
  detail?: unknown;
}

describe('DOM utilities', () => {
  let mockHomeAssistant: HTMLElement;
  let mockHomeAssistantMain: HTMLElement;
  let mockLovelacePanel: HTMLElement;
  let mockHuiRoot: HTMLElement;

  beforeEach(() => {
    // Create mock DOM structure

    // Mock home-assistant element
    mockHomeAssistant = document.createElement('home-assistant');
    mockHomeAssistant.attachShadow({ mode: 'open' });

    // Mock home-assistant-main element
    mockHomeAssistantMain = document.createElement('home-assistant-main');
    mockHomeAssistantMain.attachShadow({ mode: 'open' });
    mockHomeAssistant.shadowRoot?.appendChild(mockHomeAssistantMain);

    // Mock lovelace panel - this is what findHuiRoot looks for
    mockLovelacePanel = document.createElement('ha-panel-lovelace');
    mockLovelacePanel.attachShadow({ mode: 'open' });
    mockHomeAssistantMain.shadowRoot?.appendChild(mockLovelacePanel);

    // Mock hui-root element
    mockHuiRoot = document.createElement('hui-root');
    mockHuiRoot.attachShadow({ mode: 'open' });
    mockLovelacePanel.shadowRoot?.appendChild(mockHuiRoot);

    // Create the nested structure that getNavbarTemplates expects
    const drawer = document.createElement('ha-drawer');
    const partialPanelResolver = document.createElement(
      'partial-panel-resolver',
    );
    const haPanelLovelaceForTemplates =
      document.createElement('ha-panel-lovelace');

    drawer.appendChild(partialPanelResolver);
    partialPanelResolver.appendChild(haPanelLovelaceForTemplates);
    mockHomeAssistantMain.shadowRoot?.appendChild(drawer);

    // Add to document
    document.body.appendChild(mockHomeAssistant);

    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('getNavbarTemplates', () => {
    it('should return navbar templates when lovelace panel exists', () => {
      const mockTemplates = {
        template1: { routes: [] },
        template2: { routes: [] },
      };

      // Find the actual lovelace panel element that getNavbarTemplates will query
      const lovelacePanel = document
        ?.querySelector('home-assistant')
        ?.shadowRoot?.querySelector('home-assistant-main')
        ?.shadowRoot?.querySelector(
          'ha-drawer partial-panel-resolver ha-panel-lovelace',
        );

      // Mock lovelace config
      (lovelacePanel as MockLovelacePanel).lovelace = {
        config: {
          'navbar-templates': mockTemplates,
        },
      };

      const result = getNavbarTemplates();
      expect(result).toEqual(mockTemplates);
    });

    it('should return null when lovelace panel does not exist', () => {
      // Remove the drawer element
      const drawer =
        mockHomeAssistantMain.shadowRoot?.querySelector('ha-drawer');
      if (drawer) {
        mockHomeAssistantMain.shadowRoot?.removeChild(drawer);
      }

      const result = getNavbarTemplates();
      expect(result).toBeNull();
    });

    it('should return null when home-assistant element does not exist', () => {
      document.body.removeChild(mockHomeAssistant);

      const result = getNavbarTemplates();
      expect(result).toBeNull();
    });
  });

  describe('forceResetRipple', () => {
    it('should reset ripple elements', () => {
      const mockTarget = document.createElement('div');
      const mockRipple1 = document.createElement(
        'ha-ripple',
      ) as MockRippleElement;
      const mockRipple2 = document.createElement(
        'ha-ripple',
      ) as MockRippleElement;

      // Mock ripple properties
      mockRipple1.hovered = true;
      mockRipple1.pressed = true;
      mockRipple2.hovered = true;
      mockRipple2.pressed = true;

      mockTarget.appendChild(mockRipple1);
      mockTarget.appendChild(mockRipple2);

      forceResetRipple(mockTarget);

      // Use setTimeout to check after the delay
      setTimeout(() => {
        expect(mockRipple1.hovered).toBe(false);
        expect(mockRipple1.pressed).toBe(false);
        expect(mockRipple2.hovered).toBe(false);
        expect(mockRipple2.pressed).toBe(false);
      }, 20);
    });

    it('should handle target without ripple elements', () => {
      const mockTarget = document.createElement('div');

      expect(() => forceResetRipple(mockTarget)).not.toThrow();
    });
  });

  describe('forceOpenEditMode', () => {
    it('should open edit mode when hui-root exists', () => {
      const mockLovelace = {
        setEditMode: vi.fn(),
      };
      (mockHuiRoot as MockHuiRoot).lovelace = mockLovelace;

      forceOpenEditMode();

      expect(mockLovelace.setEditMode).toHaveBeenCalledWith(true);
    });

    it('should not throw when hui-root does not exist', () => {
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      expect(() => forceOpenEditMode()).not.toThrow();
    });

    it('should not throw when hui-root has no shadowRoot', () => {
      // Remove the hui-root element so findHuiRoot returns null
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      expect(() => forceOpenEditMode()).not.toThrow();
    });
  });

  describe('removeDashboardPadding', () => {
    it('should remove existing dashboard padding style', () => {
      const mockStyle = document.createElement('style');
      mockStyle.id = 'navbar-card-forced-padding-styles';
      mockHuiRoot.shadowRoot?.appendChild(mockStyle);

      removeDashboardPadding();

      expect(
        mockHuiRoot.shadowRoot?.querySelector(
          '#navbar-card-forced-padding-styles',
        ),
      ).toBeNull();
    });

    it('should not throw when hui-root does not exist', () => {
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      expect(() => removeDashboardPadding()).not.toThrow();
    });

    it('should not throw when style element does not exist', () => {
      expect(() => removeDashboardPadding()).not.toThrow();
    });
  });

  describe('forceDashboardPadding', () => {
    it('should warn when hui-root is not found', () => {
      // Remove hui-root element
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      forceDashboardPadding();

      expect(console.warn).toHaveBeenCalledWith(
        '[navbar-card] Could not find hui-root. Custom padding styles will not be applied.',
      );
    });

    it('should remove styles when auto padding is disabled', () => {
      const mockStyle = document.createElement('style');
      mockStyle.id = 'navbar-card-forced-padding-styles';
      mockHuiRoot.shadowRoot?.appendChild(mockStyle);

      const options = {
        desktop: {},
        mobile: {},
        auto_padding: { enabled: false },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      expect(
        mockHuiRoot.shadowRoot?.querySelector(
          '#navbar-card-forced-padding-styles',
        ),
      ).toBeNull();
    });

    it('should add desktop left/right padding styles', () => {
      const options = {
        desktop: { position: DesktopPosition.left, min_width: 768 },
        mobile: {},
        auto_padding: { enabled: true, desktop_px: 100 },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@media (min-width: 768px)');
      expect(styleEl.textContent).toContain('padding-left: 100px !important');
    });

    it('should add desktop top padding styles', () => {
      const options = {
        desktop: { position: DesktopPosition.top, min_width: 768 },
        mobile: {},
        auto_padding: { enabled: true, desktop_px: 100 },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@media (min-width: 768px)');
      expect(styleEl.textContent).toContain('hui-view:before');
      expect(styleEl.textContent).toContain('height: 100px');
    });

    it('should add desktop bottom padding styles', () => {
      const options = {
        desktop: { position: DesktopPosition.bottom, min_width: 768 },
        mobile: {},
        auto_padding: { enabled: true, desktop_px: 100 },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@media (min-width: 768px)');
      expect(styleEl.textContent).toContain('hui-view:after');
      expect(styleEl.textContent).toContain('height: 100px');
    });

    it('should add mobile padding styles', () => {
      const options = {
        desktop: { min_width: 768 },
        mobile: {},
        auto_padding: { enabled: true, mobile_px: 80 },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@media (max-width: 767px)');
      expect(styleEl.textContent).toContain('height: 80px');
    });

    it('should add media player padding to mobile when enabled', () => {
      const options = {
        desktop: { min_width: 768 },
        mobile: {},
        auto_padding: { enabled: true, mobile_px: 80, media_player_px: 20 },
        show_media_player: true,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('height: 100px'); // 80 + 20
    });

    it('should update existing style element', () => {
      const existingStyle = document.createElement('style');
      existingStyle.id = 'navbar-card-forced-padding-styles';
      existingStyle.textContent = 'old styles';
      mockHuiRoot.shadowRoot?.appendChild(existingStyle);

      const options = {
        desktop: {},
        mobile: {},
        auto_padding: { enabled: true, mobile_px: 80 },
        show_media_player: false,
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl.textContent).not.toContain('old styles');
      expect(styleEl.textContent).toContain('height: 80px');
    });
  });

  describe('fireDOMEvent', () => {
    it('should fire a basic event', () => {
      const mockNode = document.createElement('div');
      const dispatchSpy = vi.spyOn(mockNode, 'dispatchEvent');

      const event = fireDOMEvent(mockNode, 'test-event');

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('test-event');
    });

    it('should fire a custom event with detail', () => {
      const mockNode = document.createElement('div');
      const dispatchSpy = vi.spyOn(mockNode, 'dispatchEvent');

      const event = fireDOMEvent(mockNode, 'test-event', {
        options: { bubbles: true },
        detailOverride: 'test-detail',
      });

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect((event as MockEvent).detail).toBe('test-detail');
      expect(event.bubbles).toBe(true);
    });

    it('should fire a mouse event', () => {
      const mockNode = document.createElement('div');
      const dispatchSpy = vi.spyOn(mockNode, 'dispatchEvent');

      const event = fireDOMEvent(
        mockNode,
        'click',
        { options: { clientX: 100, clientY: 200 } as MouseEventInit },
        MouseEvent,
      );

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('click');
      expect((event as MouseEvent).clientX).toBe(100);
      expect((event as MouseEvent).clientY).toBe(200);
    });

    it('should fire a keyboard event', () => {
      const mockNode = document.createElement('div');
      const dispatchSpy = vi.spyOn(mockNode, 'dispatchEvent');

      const event = fireDOMEvent(
        mockNode,
        'keydown',
        { options: { key: 'Enter' } as KeyboardEventInit },
        KeyboardEvent,
      );

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('keydown');
      expect((event as KeyboardEvent).key).toBe('Enter');
    });

    it('should fire event on window', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const event = fireDOMEvent(window, 'resize');

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('resize');
    });
  });

  describe('injectStyles', () => {
    it('should inject default and user styles', () => {
      const mockRoot = document.createElement('div');
      mockRoot.attachShadow({ mode: 'open' });

      const defaultStyles = css`
        body {
          margin: 0;
        }
      `;
      const userStyles = css`
        div {
          padding: 10px;
        }
      `;

      injectStyles(mockRoot, defaultStyles, userStyles);

      const defaultStyleEl = mockRoot.shadowRoot?.querySelector(
        '#navbar-card-default-styles',
      ) as HTMLStyleElement;
      const userStyleEl = mockRoot.shadowRoot?.querySelector(
        '#navbar-card-user-styles',
      ) as HTMLStyleElement;

      expect(defaultStyleEl).toBeTruthy();
      expect(userStyleEl).toBeTruthy();
      expect(defaultStyleEl.textContent).toContain('margin: 0');
      expect(userStyleEl.textContent).toContain('padding: 10px');
    });

    it('should replace existing styles', () => {
      const mockRoot = document.createElement('div');
      mockRoot.attachShadow({ mode: 'open' });

      // Add existing styles
      const existingDefaultStyle = document.createElement('style');
      existingDefaultStyle.id = 'navbar-card-default-styles';
      existingDefaultStyle.textContent = 'old default styles';
      mockRoot.shadowRoot?.appendChild(existingDefaultStyle);

      const defaultStyles = css`
        body {
          margin: 0;
        }
      `;
      const userStyles = css`
        div {
          padding: 10px;
        }
      `;

      injectStyles(mockRoot, defaultStyles, userStyles);

      const defaultStyleEl = mockRoot.shadowRoot?.querySelector(
        '#navbar-card-default-styles',
      ) as HTMLStyleElement;
      expect(defaultStyleEl.textContent).not.toContain('old default styles');
      expect(defaultStyleEl.textContent).toContain('margin: 0');
    });
  });

  describe('hapticFeedback', () => {
    it('should fire haptic event with default type', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const event = hapticFeedback();

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('haptic');
      expect((event as MockEvent).detail).toBe('selection');
    });

    it('should fire haptic event with custom type', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const event = hapticFeedback('impact');

      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.type).toBe('haptic');
      expect((event as MockEvent).detail).toBe('impact');
    });
  });

  describe('preventEventDefault', () => {
    it('should prevent default and stop propagation', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as Event;

      preventEventDefault(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });
});
