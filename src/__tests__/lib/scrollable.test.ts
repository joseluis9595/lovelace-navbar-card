import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollableController } from '@/lib/scrollable';
import type { NavbarCardConfig } from '@/types';

import { NavbarCard } from '../../navbar-card';

if (!customElements.get('navbar-card')) {
  customElements.define('navbar-card', NavbarCard);
}

const ROUTES: NavbarCardConfig['routes'] = Array.from(
  { length: 8 },
  (_, i) => ({
    icon: 'mdi:home',
    label: `Route ${i}`,
    url: `/dashboard/view-${i}`,
  }),
);

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
    writable: true,
  });
  window.dispatchEvent(new Event('resize'));
};

/** jsdom has no layout: give an element the sizes the browser would. */
const fakeBox = (
  el: Element,
  box: { left: number; width: number },
  scroll?: { clientWidth: number; scrollWidth: number },
) => {
  el.getBoundingClientRect = () =>
    ({
      bottom: 60,
      height: 60,
      left: box.left,
      right: box.left + box.width,
      top: 0,
      width: box.width,
      x: box.left,
      y: 0,
    }) as DOMRect;
  if (scroll) {
    Object.defineProperty(el, 'clientWidth', {
      configurable: true,
      value: scroll.clientWidth,
    });
    Object.defineProperty(el, 'scrollWidth', {
      configurable: true,
      value: scroll.scrollWidth,
    });
  }
};

describe('mobile.scrollable', () => {
  let element: NavbarCard;

  const bar = () =>
    element.shadowRoot?.querySelector('.navbar-card') as HTMLElement;

  beforeEach(async () => {
    setWidth(375);
    window.history.pushState(null, '', '/dashboard/view-6');
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    element._hass = { states: {}, user: {} } as unknown as HomeAssistant;
  });

  afterEach(() => {
    window.history.pushState(null, '', '/');
  });

  it('is off by default', async () => {
    element.setConfig({ routes: ROUTES });
    await element.updateComplete;
    expect(bar().classList.contains('scrollable')).toBe(false);
  });

  it('marks the mobile bar as scrollable when enabled', async () => {
    element.setConfig({ mobile: { scrollable: true }, routes: ROUTES });
    await element.updateComplete;
    expect(bar().classList.contains('scrollable')).toBe(true);
  });

  it('does not apply on desktop', async () => {
    setWidth(1024);
    element.setConfig({ mobile: { scrollable: true }, routes: ROUTES });
    await element.updateComplete;
    expect(bar().classList.contains('scrollable')).toBe(false);
  });

  it('centres the selected route once per page, not on later updates', async () => {
    element.setConfig({ mobile: { scrollable: true }, routes: ROUTES });
    await element.updateComplete;

    const card = bar();
    const active = card.querySelector('.route.active') as HTMLElement;
    expect(active).not.toBeNull();
    fakeBox(
      card,
      { left: 0, width: 400 },
      { clientWidth: 400, scrollWidth: 800 },
    );
    fakeBox(active, { left: 600, width: 100 });
    card.scrollTo = vi.fn() as unknown as typeof card.scrollTo;

    element.requestUpdate();
    await element.updateComplete;
    await vi.waitFor(() => expect(card.scrollTo).toHaveBeenCalledTimes(1));
    // route centre 650 - bar centre 200 = 450
    expect(card.scrollTo).toHaveBeenCalledWith({
      behavior: 'instant',
      left: 450,
    });

    element.requestUpdate();
    await element.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(card.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('marks which ends of the bar have hidden routes', () => {
    const controller = new ScrollableController(element);
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 400 });
    Object.defineProperty(el, 'scrollWidth', { value: 800 });
    Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });

    el.scrollLeft = 0;
    controller.updateEdges(el);
    expect(el.hasAttribute('data-fade-start')).toBe(false);
    expect(el.hasAttribute('data-fade-end')).toBe(true);

    el.scrollLeft = 200;
    controller.updateEdges(el);
    expect(el.hasAttribute('data-fade-start')).toBe(true);
    expect(el.hasAttribute('data-fade-end')).toBe(true);

    el.scrollLeft = 400;
    controller.updateEdges(el);
    expect(el.hasAttribute('data-fade-start')).toBe(true);
    expect(el.hasAttribute('data-fade-end')).toBe(false);
  });
});
