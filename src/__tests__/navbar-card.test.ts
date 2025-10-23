import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import { NavbarCard } from '../navbar-card';
import { HomeAssistant } from 'custom-card-helpers';
import { NavbarCardConfig } from '../config';

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
      states: {},
      config: {},
      themes: {},
      selectedTheme: null,
      panels: {},
      services: {},
      user: {},
      auth: {
        data: {
          access_token: '',
          expires_in: 0,
          refresh_token: '',
          token_type: '',
        },
        wsUrl: '',
      },
      connection: {
        connected: true,
        subscribeEvents: vi.fn(),
        subscribeMessage: vi.fn(),
        sendMessage: vi.fn(),
        sendMessagePromise: vi.fn(),
        close: vi.fn(),
      },
      connected: true,
      panelUrl: '',
      callService: vi.fn(),
      callApi: vi.fn(),
      fetchWithAuth: vi.fn(),
    } as unknown as HomeAssistant;

    // Create and setup the element
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    await element.updateComplete;

    // Set up the element
    element.hass = hass;
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
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(true);
    });

    it('detects mobile mode correctly', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await element.updateComplete;

      expect(element.isDesktop).toBe(false);
    });
  });
});
