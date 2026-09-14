import { css, html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DesktopPosition,
  MobilePosition,
  type NavbarCardConfig,
  WidgetPosition,
} from '@/types/config';

import {
  conditionallyRender,
  fireDOMEvent,
  forceDashboardPadding,
  forceOpenEditMode,
  forceResetRipple,
  getNavbarTemplates,
  injectStyles,
  measureNavbarEdgeReserve,
  preventEventDefault,
  removeDashboardPadding,
} from '../../utils/dom';

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
      vi.useFakeTimers();

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

      vi.runAllTimers();

      expect(mockRipple1.hovered).toBe(false);
      expect(mockRipple1.pressed).toBe(false);
      expect(mockRipple2.hovered).toBe(false);
      expect(mockRipple2.pressed).toBe(false);

      vi.useRealTimers();
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
        autoPadding: { enabled: false },
        desktop: {},
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
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
        autoPadding: { desktop_px: 100, enabled: true },
        desktop: { min_width: 768, position: DesktopPosition.left },
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
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
        autoPadding: { desktop_px: 100, enabled: true },
        desktop: { min_width: 768, position: DesktopPosition.top },
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
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
        autoPadding: { desktop_px: 100, enabled: true },
        desktop: { min_width: 768, position: DesktopPosition.bottom },
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
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
        autoPadding: { enabled: true, mobile_px: 80 },
        desktop: { min_width: 768 },
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@media (max-width: 767px)');
      expect(styleEl.textContent).toContain('height: 80px');
    });

    it('should add mobile bottom padding gated to portrait when position is right', () => {
      const options = {
        autoPadding: { enabled: true, mobile_px: 80 },
        desktop: { min_width: 768 },
        mobile: { position: MobilePosition.right },
        widgetPositions: {
          media_player: null,
        },
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain(
        '@media (max-width: 767px) and (orientation: portrait)',
      );
      expect(styleEl.textContent).toContain('height: 80px');
    });

    it('should add mobile right padding gated to landscape when position is right', () => {
      const options = {
        autoPadding: { enabled: true, mobile_px: 80 },
        desktop: { min_width: 768 },
        mobile: { position: MobilePosition.right },
        widgetPositions: {
          media_player: null,
        },
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain(
        '@media (max-width: 767px) and (orientation: landscape)',
      );
      expect(styleEl.textContent).toContain('padding-right: 80px !important');
    });

    it('should not add orientation-gated queries for the default bottom mobile position', () => {
      const options = {
        autoPadding: { enabled: true, mobile_px: 80 },
        desktop: { min_width: 768 },
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
      };

      forceDashboardPadding(options);

      const styleEl = mockHuiRoot.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      ) as HTMLStyleElement;
      expect(styleEl.textContent).not.toContain('orientation');
    });

    describe('measured navbar reserve', () => {
      /** Stub a fixed bounding rect on an element */
      const stubRect = (
        el: HTMLElement,
        rect: { left: number; right: number; width: number; height: number },
      ) => {
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
          ...rect,
          bottom: rect.height,
          toJSON: () => ({}),
          top: 0,
          x: rect.left,
          y: 0,
        } as DOMRect);
      };

      /** Add the `#view` container that receives the forced padding */
      const addView = (left: number, right: number) => {
        const view = document.createElement('hui-view-container');
        view.id = 'view';
        mockHuiRoot.shadowRoot?.appendChild(view);
        stubRect(view, { height: 600, left, right, width: right - left });
        return view;
      };

      /** Build a detached navbar element with a stubbed rect */
      const makeNavbar = (left: number, width: number) => {
        const navbar = document.createElement('div');
        navbar.className = 'navbar';
        stubRect(navbar, {
          height: 400,
          left,
          right: left + width,
          width,
        });
        return navbar;
      };

      const setViewport = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: width,
          writable: true,
        });
      };

      const setOrientation = (orientation: 'landscape' | 'portrait') => {
        vi.spyOn(window, 'matchMedia').mockImplementation(
          query =>
            ({
              matches: query.includes(orientation),
            }) as MediaQueryList,
        );
      };

      beforeEach(() => {
        // `forceDashboardPadding` remembers the last usable measurement across
        // card instances, so clear that module state between tests.
        removeDashboardPadding();
      });

      const getPaddingCss = () =>
        (
          mockHuiRoot.shadowRoot?.querySelector(
            '#navbar-card-forced-padding-styles',
          ) as HTMLStyleElement
        ).textContent ?? '';

      describe('measureNavbarEdgeReserve', () => {
        it('measures both edges relative to the view container', () => {
          addView(0, 762);
          const navbar = makeNavbar(660, 102);

          expect(measureNavbarEdgeReserve(navbar)).toEqual({
            // 660 + 102 - 0
            left: 762,
            // 762 - 660
            right: 102,
          });
        });

        it('offsets the left edge by the view container, so the sidebar does not inflate the reserve', () => {
          // Sidebar takes the first 256px, so the view starts there
          addView(256, 1280);
          const navbar = makeNavbar(272, 100);

          // 272 + 100 - 256 - the sidebar width is excluded
          expect(measureNavbarEdgeReserve(navbar)?.left).toBe(116);
        });

        it('falls back to the viewport when there is no view container', () => {
          setViewport(1000);
          const navbar = makeNavbar(900, 100);

          expect(measureNavbarEdgeReserve(navbar)?.right).toBe(100);
        });

        it('returns no measurement for an unpainted navbar', () => {
          addView(0, 762);
          const navbar = makeNavbar(0, 0);

          expect(measureNavbarEdgeReserve(navbar)).toBeNull();
        });

        it('returns no measurement when there is no navbar', () => {
          expect(measureNavbarEdgeReserve(null)).toBeNull();
          expect(measureNavbarEdgeReserve(undefined)).toBeNull();
        });

        it('rejects a navbar from an off-screen view', () => {
          // Home Assistant keeps the previous view mounted while transitioning,
          // and its `will-change: transform` wrapper becomes the containing
          // block for the navbar's `position: fixed` - so the stale navbar
          // reports a rect outside the view entirely.
          addView(0, 762);
          const staleNavbar = makeNavbar(-87, 87);

          expect(measureNavbarEdgeReserve(staleNavbar)).toBeNull();
        });

        it('measures a navbar that only partially overlaps the view', () => {
          addView(0, 762);
          const navbar = makeNavbar(720, 87);

          // 762 - 720
          expect(measureNavbarEdgeReserve(navbar)?.right).toBe(42);
        });
      });

      it('should reserve the measured width on a mobile landscape right dock', () => {
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { enabled: true, mobile_px: 80 },
          desktop: { min_width: 768 },
          measuredEdgeReserve: measureNavbarEdgeReserve(makeNavbar(660, 102)),
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        });

        // The rendered navbar is 102px wide, so the configured 80px is not
        // enough - the measured 102px wins.
        expect(getPaddingCss()).toContain('padding-right: 102px !important');
      });

      it('should keep the configured mobile value when it exceeds the measured width', () => {
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { enabled: true, mobile_px: 200 },
          desktop: { min_width: 768 },
          measuredEdgeReserve: measureNavbarEdgeReserve(makeNavbar(700, 62)),
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-right: 200px !important');
      });

      it('should not apply a landscape measurement while in portrait', () => {
        setViewport(762);
        setOrientation('portrait');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { enabled: true, mobile_px: 80 },
          desktop: { min_width: 768 },
          measuredEdgeReserve: { left: 999, right: 999 },
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-right: 80px !important');
      });

      it('should reserve the measured width for a desktop right navbar', () => {
        setViewport(1280);
        addView(0, 1280);

        forceDashboardPadding({
          autoPadding: { desktop_px: 100, enabled: true },
          desktop: { min_width: 768, position: DesktopPosition.right },
          measuredEdgeReserve: measureNavbarEdgeReserve(makeNavbar(1140, 140)),
          mobile: {},
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-right: 140px !important');
      });

      it('should reserve the measured width for a desktop left navbar', () => {
        setViewport(1280);
        addView(256, 1280);

        forceDashboardPadding({
          autoPadding: { desktop_px: 100, enabled: true },
          desktop: { min_width: 768, position: DesktopPosition.left },
          measuredEdgeReserve: measureNavbarEdgeReserve(makeNavbar(272, 140)),
          mobile: {},
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-left: 156px !important');
      });

      it('should not apply a desktop measurement while in mobile mode', () => {
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { desktop_px: 100, enabled: true, mobile_px: 80 },
          desktop: { min_width: 768, position: DesktopPosition.right },
          measuredEdgeReserve: { left: 999, right: 999 },
          mobile: {},
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-right: 100px !important');
      });

      it('should leave an explicitly disabled side at zero', () => {
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { enabled: true, mobile_px: 0 },
          desktop: { min_width: 768 },
          measuredEdgeReserve: { left: 999, right: 999 },
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).not.toContain('padding-right');
      });

      it("should keep a visible card's measurement when an off-screen card re-applies", () => {
        // Home Assistant keeps previous views mounted while transitioning, so
        // several cards write the same style element. The ones that cannot
        // measure themselves must not undo the visible card's reserve.
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        const options = {
          autoPadding: { enabled: true, mobile_px: 80 },
          desktop: { min_width: 768 },
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        };

        // The visible card measures and reserves the navbar's 102px.
        forceDashboardPadding({
          ...options,
          measuredEdgeReserve: measureNavbarEdgeReserve(makeNavbar(660, 102)),
        });
        expect(getPaddingCss()).toContain('padding-right: 102px !important');

        // An off-screen card re-applies with nothing to measure.
        forceDashboardPadding({ ...options, measuredEdgeReserve: null });

        expect(getPaddingCss()).toContain('padding-right: 102px !important');
      });

      it('should fall back to the configured value with no measurement', () => {
        setViewport(762);
        setOrientation('landscape');
        addView(0, 762);

        forceDashboardPadding({
          autoPadding: { enabled: true, mobile_px: 80 },
          desktop: { min_width: 768 },
          mobile: { position: MobilePosition.right },
          widgetPositions: { media_player: null },
        });

        expect(getPaddingCss()).toContain('padding-right: 80px !important');
      });
    });

    it('should add media player padding to mobile when enabled', () => {
      const options = {
        autoPadding: { enabled: true, media_player_px: 20, mobile_px: 80 },
        desktop: { min_width: 768 },
        mobile: {},
        widgetPositions: {
          media_player: WidgetPosition.bottomRight,
        },
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
        autoPadding: { enabled: true, mobile_px: 80 },
        desktop: {},
        mobile: {},
        widgetPositions: {
          media_player: null,
        },
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
        detailOverride: 'test-detail',
        options: { bubbles: true },
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

  describe('conditionallyRender', () => {
    it('should render provided content when condition is true', () => {
      const renderContent = vi.fn(() => html`<div>content</div>`);

      const result = conditionallyRender(true, renderContent);

      expect(renderContent).toHaveBeenCalledTimes(1);
      expect(result.strings.join('')).toContain('content');
    });

    it('should render loader when condition is false', () => {
      const renderContent = vi.fn();

      const result = conditionallyRender(false, renderContent);

      expect(renderContent).not.toHaveBeenCalled();
      expect(result.strings.join('')).toContain('loader-container');
      expect(result.strings.join('')).toContain('loader');
    });
  });
});
