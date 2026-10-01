import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DesktopPosition,
  MobilePosition,
  type NavbarCardConfig,
} from '@/types';

import { NavbarCard } from '../navbar-card';

const DEFAULT_CONFIG: NavbarCardConfig = {
  desktop: {
    show_labels: true,
  },
  routes: [
    {
      icon: 'mdi:home',
      label: 'Home',
      url: '/',
    },
    {
      icon: 'mdi:cog',
      label: 'Settings',
      url: '/config',
    },
  ],
};

// jsdom has no ResizeObserver - record what the card observes so the
// measured-padding path can be asserted on.
let observedElements: Element[] = [];

class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}
  observe(target: Element): void {
    observedElements.push(target);
  }
  unobserve(): void {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

// Register the custom element
if (!customElements.get('navbar-card')) {
  customElements.define('navbar-card', NavbarCard);
}

describe('NavbarCard', () => {
  let element: NavbarCard;
  let hass: HomeAssistant;

  beforeEach(async () => {
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
      states: {},
      themes: {},
      user: {},
    } as unknown as HomeAssistant;

    observedElements = [];

    // Create and setup the element
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    await element.updateComplete;

    // Set up the element
    element._hass = hass;
    element.setConfig(DEFAULT_CONFIG);
    await element.updateComplete;
  });

  describe('Basic Rendering', () => {
    it('renders with basic configuration', () => {
      expect(element).toBeDefined();
      expect(element.shadowRoot).toBeDefined();
    });

    it('renders all configured routes', () => {
      const routes = element.shadowRoot?.querySelectorAll('.route');
      expect(routes?.length).toBe(2);
    });

    it('displays correct icons and labels', () => {
      const icons = element.shadowRoot?.querySelectorAll('ha-icon');
      const labels = element.shadowRoot?.querySelectorAll('.label');

      expect(icons?.length).toBe(2);
      expect(labels?.length).toBe(2);

      expect(icons?.[0].getAttribute('icon')).toBe('mdi:home');
      expect(labels?.[0].textContent?.trim()).toBe('Home');
    });
  });

  describe('Configuration Validation', () => {
    it('throws error when routes are not provided', () => {
      expect(() => {
        element.setConfig({} as NavbarCardConfig);
      }).toThrow('"routes" param is required for navbar card');
    });

    it('throws error when route has no icon or image', () => {
      expect(() => {
        element.setConfig({
          routes: [{ label: 'Invalid Route' }],
        } as NavbarCardConfig);
      }).toThrow(
        'Each route must have either an "icon" or "image" property configured',
      );
    });

    it('throws error when route has no action configured', () => {
      expect(() => {
        element.setConfig({
          routes: [{ icon: 'mdi:home', label: 'Invalid Route' }],
        } as NavbarCardConfig);
      }).toThrow(
        'Each route must have at least one actionable property (url, popup, tap_action, hold_action, double_tap_action)',
      );
    });
  });

  describe('Desktop/Mobile Mode', () => {
    it('detects desktop mode correctly', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
        writable: true,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(true);
    });

    it('detects mobile mode correctly', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
        writable: true,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(false);
    });
  });

  describe('Mobile position', () => {
    beforeEach(async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;
    });

    it('defaults to bottom position class', () => {
      expect(element.mobilePosition).toBe(MobilePosition.bottom);

      const navbar = element.shadowRoot?.querySelector('.navbar');
      expect(navbar?.classList.contains('mobile')).toBe(true);
      expect(navbar?.classList.contains('bottom')).toBe(true);
      expect(navbar?.classList.contains('right')).toBe(false);
    });

    it('applies right position class when configured', async () => {
      element.setConfig({
        ...DEFAULT_CONFIG,
        mobile: { position: MobilePosition.right },
      });
      await element.updateComplete;

      expect(element.mobilePosition).toBe(MobilePosition.right);

      const navbar = element.shadowRoot?.querySelector('.navbar');
      const navbarCard = element.shadowRoot?.querySelector('.navbar-card');
      expect(navbar?.classList.contains('right')).toBe(true);
      expect(navbarCard?.classList.contains('right')).toBe(true);
    });

    it('does not leak desktop position class onto a mobile navbar', async () => {
      element.setConfig({
        ...DEFAULT_CONFIG,
        desktop: { position: DesktopPosition.left },
      });
      await element.updateComplete;

      const navbar = element.shadowRoot?.querySelector('.navbar');
      expect(navbar?.classList.contains('left')).toBe(false);
      expect(navbar?.classList.contains('bottom')).toBe(true);
    });
  });

  describe('Measured dashboard padding', () => {
    /** Mount the hui-root chain `forceDashboardPadding` writes into */
    const mountHuiRoot = (viewLeft: number, viewRight: number) => {
      // `findHuiRoot` resolves the first `home-assistant` in the document, so
      // drop any mock left behind by a previous test.
      document.querySelectorAll('home-assistant').forEach(stale => {
        stale.remove();
      });

      const homeAssistant = document.createElement('home-assistant');
      homeAssistant.attachShadow({ mode: 'open' });
      const main = document.createElement('home-assistant-main');
      main.attachShadow({ mode: 'open' });
      homeAssistant.shadowRoot?.appendChild(main);
      const panel = document.createElement('ha-panel-lovelace');
      panel.attachShadow({ mode: 'open' });
      main.shadowRoot?.appendChild(panel);
      const huiRoot = document.createElement('hui-root');
      huiRoot.attachShadow({ mode: 'open' });
      panel.shadowRoot?.appendChild(huiRoot);

      const view = document.createElement('hui-view-container');
      view.id = 'view';
      vi.spyOn(view, 'getBoundingClientRect').mockReturnValue({
        bottom: 600,
        height: 600,
        left: viewLeft,
        right: viewRight,
        toJSON: () => ({}),
        top: 0,
        width: viewRight - viewLeft,
        x: viewLeft,
        y: 0,
      } as DOMRect);
      huiRoot.shadowRoot?.appendChild(view);

      document.body.appendChild(homeAssistant);
      return huiRoot;
    };

    const stubNavbarWidth = (left: number, width: number) => {
      const navbar = element.shadowRoot?.querySelector(
        '.navbar',
      ) as HTMLElement;
      vi.spyOn(navbar, 'getBoundingClientRect').mockReturnValue({
        bottom: 400,
        height: 400,
        left,
        right: left + width,
        toJSON: () => ({}),
        top: 0,
        width,
        x: left,
        y: 0,
      } as DOMRect);
      return navbar;
    };

    const getPaddingCss = (huiRoot: Element) =>
      huiRoot.shadowRoot?.querySelector('#navbar-card-forced-padding-styles')
        ?.textContent ?? '';

    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 762,
        writable: true,
      });
      vi.spyOn(window, 'matchMedia').mockImplementation(
        query => ({ matches: query.includes('landscape') }) as MediaQueryList,
      );
    });

    it('reserves the rendered navbar width rather than the configured constant', async () => {
      const huiRoot = mountHuiRoot(0, 762);

      element.setConfig({
        ...DEFAULT_CONFIG,
        layout: { auto_padding: { enabled: true, mobile_px: 80 } },
        mobile: { position: MobilePosition.right },
      });
      await element.updateComplete;

      stubNavbarWidth(660, 102);
      element.requestUpdate();
      await element.updateComplete;

      // The configured 80px is narrower than the rendered navbar, so the
      // measured 102px is reserved instead.
      expect(getPaddingCss(huiRoot)).toContain(
        'padding-right: 102px !important',
      );
    });

    it('keeps the configured value when it is larger than the navbar', async () => {
      const huiRoot = mountHuiRoot(0, 762);

      element.setConfig({
        ...DEFAULT_CONFIG,
        layout: { auto_padding: { enabled: true, mobile_px: 200 } },
        mobile: { position: MobilePosition.right },
      });
      await element.updateComplete;

      stubNavbarWidth(700, 62);
      element.requestUpdate();
      await element.updateComplete;

      expect(getPaddingCss(huiRoot)).toContain(
        'padding-right: 200px !important',
      );
    });

    it('observes the rendered navbar so later size changes are picked up', () => {
      expect(observedElements.some(el => el.classList.contains('navbar'))).toBe(
        true,
      );
    });
  });

  describe('Icon rendering', () => {
    it('renders icon, selected_icon and applies icon_color', async () => {
      const config: NavbarCardConfig = {
        desktop: { show_labels: true },
        routes: [
          {
            icon: 'mdi:home',
            icon_color: '#ff0000',
            label: 'Home',
            url: '/',
          },
          {
            icon: 'mdi:cog',
            icon_color: '#00ff00',
            icon_selected: 'mdi:cog-outline',
            label: 'Settings',
            selected: true,
            url: '/config',
          },
        ],
      };

      element.setConfig(config);
      await element.updateComplete;

      const icons = element.shadowRoot?.querySelectorAll('ha-icon');
      expect(icons?.length).toBe(2);

      // First route: not selected -> base icon
      expect(icons?.[0].getAttribute('icon')).toBe('mdi:home');
      // Second route: selected -> selected icon
      expect(icons?.[1].getAttribute('icon')).toBe('mdi:cog-outline');

      // icon_color applied via CSS var (hex in current implementation)
      expect(icons?.[0].getAttribute('style')).toContain(
        '--icon-primary-color: #ff0000',
      );
      expect(icons?.[1].getAttribute('style')).toContain(
        '--icon-primary-color: #00ff00',
      );
    });
  });

  describe('Selected state styles', () => {
    it('applies selected class and selected_color', async () => {
      const config: NavbarCardConfig = {
        desktop: { show_labels: true },
        routes: [
          {
            icon: 'mdi:star',
            label: 'Fav',
            selected: true,
            selected_color: '[[[ return "#00ff00"]]]',
            url: '/fav',
          },
        ],
      };

      element.setConfig(config);
      await element.updateComplete;

      const route = element.shadowRoot?.querySelector('.route');
      const button = element.shadowRoot?.querySelector('.button');

      expect(route?.classList.contains('active')).toBe(true);
      // selected_color is applied as --navbar-primary-color on the button
      expect(button?.getAttribute('style') || '').toContain(
        '--navbar-primary-color: #00ff00',
      );
    });
  });
});
