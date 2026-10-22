import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { html as litHtml } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { COLLAPSED_STORAGE_KEY } from '@/lib/autohide';
import type { NavbarCardConfig } from '@/types';

import { NavbarCard } from '../../navbar-card';

if (!customElements.get('navbar-card')) {
  customElements.define('navbar-card', NavbarCard);
}

const ROUTES: NavbarCardConfig['routes'] = [
  { icon: 'mdi:home', label: 'Home', url: '/' },
  { icon: 'mdi:cog', label: 'Settings', url: '/config' },
];

const PAGE_HEIGHT = 3000;

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
    writable: true,
  });
  window.dispatchEvent(new Event('resize'));
};

/** Scroll the window to `y` in steps, the way a finger would. */
const scrollTo = async (y: number) => {
  const step = Math.sign(y - window.scrollY) * 10;
  while (window.scrollY !== y) {
    const next =
      Math.abs(y - window.scrollY) < Math.abs(step) ? y : window.scrollY + step;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: next,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    // The controller reads scroll once per animation frame
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
};

describe('mobile.autohide', () => {
  let element: NavbarCard;

  const navbar = () =>
    element.shadowRoot?.querySelector('.navbar') as HTMLElement;

  const setup = async (
    autohide: NonNullable<NavbarCardConfig['mobile']>['autohide'],
  ) => {
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    element._hass = { states: {}, user: {} } as unknown as HomeAssistant;
    element.setConfig({ mobile: { autohide }, routes: ROUTES });
    await element.updateComplete;
  };

  beforeEach(() => {
    setWidth(375);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: PAGE_HEIGHT,
    });
    window.localStorage.removeItem(COLLAPSED_STORAGE_KEY);
  });

  afterEach(() => {
    window.localStorage.removeItem(COLLAPSED_STORAGE_KEY);
  });

  it('is off by default', async () => {
    await setup(undefined);
    expect(navbar().className).not.toMatch(/autohide-/);
  });

  it('does not apply on desktop', async () => {
    setWidth(1024);
    await setup('slide');
    expect(navbar().className).not.toMatch(/autohide-/);
  });

  describe('slide', () => {
    it('hides after a steady scroll down and returns on scroll up', async () => {
      await setup('slide');
      expect(navbar().classList.contains('autohide-slide')).toBe(true);

      await scrollTo(400);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);

      await scrollTo(380);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });

    it('ignores small movements', async () => {
      await setup('slide');
      await scrollTo(200);
      await scrollTo(100);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);

      await scrollTo(115);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });

    it('comes back at the end of the page', async () => {
      await setup('slide');
      await scrollTo(1000);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);

      await scrollTo(PAGE_HEIGHT - 800);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });

    it('stays visible while a popup is open', async () => {
      await setup('slide');
      await scrollTo(400);
      element.focusedPopup = litHtml`<div class="navbar-popup"></div>`;
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });

    it('comes back after navigating', async () => {
      await setup('slide');
      await scrollTo(400);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);

      window.dispatchEvent(new CustomEvent('location-changed'));
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });
  });

  describe('minimize', () => {
    it('stays minimized at the end of the page', async () => {
      await setup('minimize');
      await scrollTo(PAGE_HEIGHT - 800);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);
    });

    it('a tap on the pill only expands the bar', async () => {
      await setup('minimize');
      await scrollTo(400);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);

      const route = element.shadowRoot?.querySelector('.route') as HTMLElement;
      const routeClick = vi.fn();
      route.addEventListener('click', routeClick);

      route.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, composed: true }),
      );
      route.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true }),
      );
      await element.updateComplete;

      expect(navbar().classList.contains('away')).toBe(false);
      expect(routeClick).not.toHaveBeenCalled();
    });

    it('lets taps through once expanded', async () => {
      await setup('minimize');
      const route = element.shadowRoot?.querySelector('.route') as HTMLElement;
      const routeClick = vi.fn();
      route.addEventListener('click', routeClick);

      route.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true }),
      );
      expect(routeClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggle', () => {
    const toggle = () =>
      element.shadowRoot?.querySelector('.autohide-tab') as HTMLElement;

    it('renders an arrow tab and ignores scrolling', async () => {
      await setup('toggle');
      expect(toggle()).not.toBeNull();
      expect(toggle().getAttribute('aria-label')).toBe('Hide navigation');

      await scrollTo(400);
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
    });

    it('folds the bar away and back, remembering the choice', async () => {
      await setup('toggle');

      toggle().click();
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(true);
      expect(toggle().getAttribute('aria-label')).toBe('Show navigation');
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      expect(window.localStorage.getItem(COLLAPSED_STORAGE_KEY)).toBe('1');

      // A new card (another view) starts folded
      await setup('toggle');
      expect(navbar().classList.contains('away')).toBe(true);

      toggle().click();
      await element.updateComplete;
      expect(navbar().classList.contains('away')).toBe(false);
      expect(window.localStorage.getItem(COLLAPSED_STORAGE_KEY)).toBeNull();
    });

    it('has no tab in other modes', async () => {
      await setup('slide');
      expect(toggle()).toBeNull();
    });
  });
});
