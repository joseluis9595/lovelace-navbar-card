import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCardConfig } from '@/types';

import { NavbarCard } from '../navbar-card';
import {
  loadSharedTemplates,
  resetSharedTemplates,
} from '../utils/shared-templates';

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

  describe('Shared templates', () => {
    const sharedTemplate: NavbarCardConfig = {
      routes: [{ icon: 'mdi:car', url: '/car' }],
    };

    beforeEach(() => {
      resetSharedTemplates();
      hass.callWS = vi.fn().mockResolvedValue({
        'navbar-templates': { shared: sharedTemplate },
      });
      hass.connection.subscribeEvents = vi.fn().mockResolvedValue(() => {});
    });

    afterEach(() => {
      resetSharedTemplates();
    });

    it('waits for shared templates before applying a template it does not know', async () => {
      const card = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);

      expect(() =>
        card.setConfig({ template: 'shared' } as NavbarCardConfig),
      ).not.toThrow();
      expect(card.config).toBeUndefined();

      card.hass = hass;

      await vi.waitFor(() =>
        expect(card.config?.routes).toEqual(sharedTemplate.routes),
      );
    });

    it('throws when the template is not found once shared templates are loaded', async () => {
      await loadSharedTemplates(hass);

      expect(() =>
        element.setConfig({ template: 'missing' } as NavbarCardConfig),
      ).toThrow('"routes" param is required for navbar card');
    });
  });

  describe('Desktop/Mobile Mode', () => {
    it('detects desktop mode correctly', async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(true);
    });

    it('detects mobile mode correctly', async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(false);
    });

    it('re-points the media query when min_width changes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 900,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;
      expect(element.isDesktop).toBe(true);

      element.setConfig({
        ...DEFAULT_CONFIG,
        desktop: { ...DEFAULT_CONFIG.desktop, min_width: 1024 },
      });
      await element.updateComplete;

      expect(element.isDesktop).toBe(false);
    });

    it('adds safe-area class only when mobile.safe_area is enabled', async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 375,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;
      expect(element.isDesktop).toBe(false);

      expect(
        element.shadowRoot
          ?.querySelector('.navbar')
          ?.classList.contains('safe-area'),
      ).toBe(false);

      element.setConfig({
        ...DEFAULT_CONFIG,
        mobile: { safe_area: true },
      });
      await element.updateComplete;

      expect(
        element.shadowRoot
          ?.querySelector('.navbar')
          ?.classList.contains('safe-area'),
      ).toBe(true);
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
      // Ensure desktop mode so desktop.show_labels takes effect
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1024,
        writable: true,
      });
      window.dispatchEvent(new Event('resize'));

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
      const label = element.shadowRoot?.querySelector('.label');

      expect(route?.classList.contains('active')).toBe(true);
      expect(label?.classList.contains('active')).toBe(true);
      // selected_color is applied as --navbar-primary-color (inherited by active labels)
      expect(route?.getAttribute('style') || '').toContain(
        '--navbar-primary-color: #00ff00',
      );
      expect(button?.getAttribute('style') || '').toContain(
        '--navbar-primary-color: #00ff00',
      );
      expect(
        getComputedStyle(label as Element).getPropertyValue(
          '--navbar-primary-color',
        ),
      ).toBe('#00ff00');
    });
  });

  describe('Dashboard padding', () => {
    let huiRoot: HTMLElement;

    const getPaddingStyle = () =>
      huiRoot.shadowRoot?.querySelector('#navbar-card-forced-padding-styles');

    beforeEach(async () => {
      // Mock the DOM path used to find hui-root
      const homeAssistant = document.createElement('home-assistant');
      const main = document.createElement('home-assistant-main');
      const panel = document.createElement('ha-panel-lovelace');
      huiRoot = document.createElement('hui-root');
      homeAssistant.attachShadow({ mode: 'open' }).appendChild(main);
      main.attachShadow({ mode: 'open' }).appendChild(panel);
      panel.attachShadow({ mode: 'open' }).appendChild(huiRoot);
      huiRoot.attachShadow({ mode: 'open' });
      document.body.appendChild(homeAssistant);

      // Reconnect so the card registers its padding against the mocked hui-root
      element.remove();
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      element.remove();
      document.querySelector('home-assistant')?.remove();
    });

    it('applies padding when connected', () => {
      expect(getPaddingStyle()?.textContent).toContain('height: 80px');
    });

    it('re-applies padding when config changes', async () => {
      element.setConfig({
        ...DEFAULT_CONFIG,
        layout: { auto_padding: { enabled: true, mobile_px: 50 } },
      });
      await element.updateComplete;

      expect(getPaddingStyle()?.textContent).toContain('height: 50px');
    });

    it('removes padding when the navbar is hidden', async () => {
      element.setConfig({
        ...DEFAULT_CONFIG,
        desktop: { ...DEFAULT_CONFIG.desktop, hidden: true },
        mobile: { hidden: true },
      });
      await element.updateComplete;

      expect(getPaddingStyle()).toBeNull();
    });

    it('removes padding in edit mode', async () => {
      const editModeWrapper = document.createElement('hui-card-edit-mode');
      document.body.appendChild(editModeWrapper);
      editModeWrapper.appendChild(element);
      await element.updateComplete;

      expect(getPaddingStyle()).toBeNull();
      editModeWrapper.remove();
    });

    it('removes padding when disconnected', () => {
      element.remove();

      expect(getPaddingStyle()).toBeNull();
    });
  });
});
