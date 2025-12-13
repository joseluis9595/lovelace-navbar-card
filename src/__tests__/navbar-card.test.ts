import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCardConfig } from '@/types';

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
