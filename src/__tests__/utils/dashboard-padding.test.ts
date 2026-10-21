import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DesktopPosition,
  type NavbarCardConfig,
  WidgetPosition,
} from '@/types/config';

import {
  removeDashboardPadding,
  setDashboardPadding,
} from '../../utils/dashboard-padding';

const config = (
  autoPadding: Partial<NonNullable<NavbarCardConfig['layout']>['auto_padding']>,
  desktop: NavbarCardConfig['desktop'] = {},
): NavbarCardConfig => ({
  desktop,
  layout: { auto_padding: { enabled: true, ...autoPadding } },
  routes: [],
});

describe('Dashboard padding', () => {
  let mockLovelacePanel: HTMLElement;
  let mockHuiRoot: HTMLElement;
  const card = document.createElement('div');
  const otherCard = document.createElement('div');

  const getStyle = () =>
    mockHuiRoot.shadowRoot?.querySelector<HTMLStyleElement>(
      '#navbar-card-forced-padding-styles',
    );

  beforeEach(() => {
    // Mock the DOM path used to find hui-root
    const homeAssistant = document.createElement('home-assistant');
    const homeAssistantMain = document.createElement('home-assistant-main');
    mockLovelacePanel = document.createElement('ha-panel-lovelace');
    mockHuiRoot = document.createElement('hui-root');
    homeAssistant.attachShadow({ mode: 'open' }).appendChild(homeAssistantMain);
    homeAssistantMain
      .attachShadow({ mode: 'open' })
      .appendChild(mockLovelacePanel);
    mockLovelacePanel.attachShadow({ mode: 'open' }).appendChild(mockHuiRoot);
    mockHuiRoot.attachShadow({ mode: 'open' });
    document.body.appendChild(homeAssistant);

    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    removeDashboardPadding(card);
    removeDashboardPadding(otherCard);
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('setDashboardPadding', () => {
    it('should warn when hui-root is not found', () => {
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      setDashboardPadding(card, config({}), null);

      expect(console.warn).toHaveBeenCalledWith(
        '[navbar-card] Could not find <hui-root>. Custom padding styles will not be applied.',
      );
    });

    it('should use default padding when not configured', () => {
      setDashboardPadding(card, undefined, null);

      expect(getStyle()?.textContent).toContain('height: 100px'); // desktop
      expect(getStyle()?.textContent).toContain('height: 80px'); // mobile
    });

    it('should not add styles when auto padding is disabled', () => {
      setDashboardPadding(card, config({ enabled: false }), null);

      expect(getStyle()).toBeNull();
    });

    it('should remove styles when auto padding gets disabled', () => {
      setDashboardPadding(card, config({}), null);
      setDashboardPadding(card, config({ enabled: false }), null);

      expect(getStyle()).toBeNull();
    });

    it('should add desktop left padding styles', () => {
      setDashboardPadding(
        card,
        config(
          { desktop_px: 100 },
          { min_width: 768, position: DesktopPosition.left },
        ),
        null,
      );

      expect(getStyle()?.textContent).toContain('@media (min-width: 768px)');
      expect(getStyle()?.textContent).toContain(
        'padding-left: 100px !important',
      );
    });

    it('should add desktop top padding styles', () => {
      setDashboardPadding(
        card,
        config({ desktop_px: 100 }, { position: DesktopPosition.top }),
        null,
      );

      expect(getStyle()?.textContent).toContain('hui-view:before');
      expect(getStyle()?.textContent).toContain('height: 100px');
    });

    it('should add mobile padding styles', () => {
      setDashboardPadding(
        card,
        config({ desktop_px: 0, mobile_px: 80 }, { min_width: 768 }),
        null,
      );

      expect(getStyle()?.textContent).toContain('@media (max-width: 767px)');
      expect(getStyle()?.textContent).toContain('height: 80px');
    });

    it('should add media player padding', () => {
      setDashboardPadding(
        card,
        config({ desktop_px: 0, media_player_px: 20, mobile_px: 80 }),
        WidgetPosition.topRight,
      );

      expect(getStyle()?.textContent).toContain('hui-view:before');
      expect(getStyle()?.textContent).toContain('height: 20px'); // desktop top
      expect(getStyle()?.textContent).toContain('height: 100px'); // 80 + 20
    });

    it('should use the largest padding of cards on the same side', () => {
      setDashboardPadding(
        card,
        config({ desktop_px: 100, mobile_px: 80 }),
        null,
      );
      setDashboardPadding(
        otherCard,
        config({ desktop_px: 50, mobile_px: 40 }),
        null,
      );

      expect(getStyle()?.textContent).toContain('height: 100px');
      expect(getStyle()?.textContent).toContain('height: 80px');
      expect(getStyle()?.textContent).not.toContain('height: 150px');
      expect(getStyle()?.textContent).not.toContain('height: 120px');
    });

    it('should keep padding of cards on different sides', () => {
      setDashboardPadding(
        card,
        config({ desktop_px: 100 }, { position: DesktopPosition.bottom }),
        null,
      );
      setDashboardPadding(
        otherCard,
        config({ desktop_px: 60 }, { position: DesktopPosition.top }),
        null,
      );

      const css = getStyle()?.textContent;
      expect(css).toMatch(/hui-view:before {[^}]*height: 60px/);
      expect(css).toMatch(/hui-view:after {[^}]*height: 100px/);
    });

    it('should ignore cards with auto padding disabled', () => {
      setDashboardPadding(card, config({ mobile_px: 80 }), null);
      setDashboardPadding(
        otherCard,
        config({ enabled: false, mobile_px: 120 }),
        null,
      );

      expect(getStyle()?.textContent).toContain('height: 80px');
      expect(getStyle()?.textContent).not.toContain('height: 120px');
    });

    it('should raise the sticky sections view footer above the navbar', () => {
      const sectionsView = document.createElement('hui-sections-view');
      sectionsView.attachShadow({ mode: 'open' });
      mockHuiRoot.shadowRoot?.appendChild(sectionsView);

      setDashboardPadding(
        card,
        config({ desktop_px: 100, mobile_px: 80 }, { min_width: 768 }),
        null,
      );

      const footerCss = sectionsView.shadowRoot?.querySelector(
        '#navbar-card-forced-padding-styles',
      )?.textContent;
      expect(footerCss).toMatch(
        /min-width: 768px[^}]*hui-view-footer\[sticky\] {[^}]*bottom: calc\(var\(--row-gap\) \+ 100px\)/,
      );
      expect(footerCss).toMatch(
        /max-width: 767px[^}]*hui-view-footer\[sticky\] {[^}]*bottom: calc\(var\(--row-gap\) \+ 80px\)/,
      );

      removeDashboardPadding(card);

      expect(
        sectionsView.shadowRoot?.querySelector(
          '#navbar-card-forced-padding-styles',
        ),
      ).toBeNull();
    });

    it('should not rewrite styles when padding is unchanged', () => {
      setDashboardPadding(card, config({}), null);
      const setter = vi.spyOn(
        getStyle() as HTMLStyleElement,
        'textContent',
        'set',
      );

      setDashboardPadding(card, config({}), null);

      expect(setter).not.toHaveBeenCalled();
    });
  });

  describe('removeDashboardPadding', () => {
    it('should remove styles when the last card is removed', () => {
      setDashboardPadding(card, config({}), null);

      removeDashboardPadding(card);

      expect(getStyle()).toBeNull();
    });

    it('should keep other cards padding', () => {
      setDashboardPadding(card, config({ mobile_px: 80 }), null);
      setDashboardPadding(otherCard, config({ mobile_px: 120 }), null);

      removeDashboardPadding(otherCard);

      expect(getStyle()?.textContent).toContain('height: 80px');
      expect(getStyle()?.textContent).not.toContain('height: 120px');
    });

    it('should not throw when hui-root does not exist', () => {
      setDashboardPadding(card, config({}), null);
      mockLovelacePanel.shadowRoot?.removeChild(mockHuiRoot);

      expect(() => removeDashboardPadding(card)).not.toThrow();
    });
  });
});
