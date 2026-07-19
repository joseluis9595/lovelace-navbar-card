import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { beforeEach, describe, expect, it } from 'vitest';

import '@/navbar-card';

import { type Popup, PopupItem } from '@/components/navbar';
import type { NavbarCard } from '@/navbar-card';
import type { NavbarCardConfig } from '@/types';

type HaIconElement = HTMLElement & { icon?: string };

const createHass = (states: HomeAssistant['states'] = {}): HomeAssistant =>
  ({
    states,
    user: {},
  }) as unknown as HomeAssistant;

describe('Badge', () => {
  let element: NavbarCard;

  beforeEach(async () => {
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    element._hass = createHass();
  });

  const setConfig = async (config: NavbarCardConfig) => {
    element.setConfig(config);
    await element.updateComplete;
  };

  it('renders a configured icon instead of the count', async () => {
    await setConfig({
      routes: [
        {
          badge: {
            color: 'red',
            count: 7,
            icon: 'mdi:lock-open-variant',
            icon_color: 'white',
            show: true,
          },
          icon: 'mdi:lock',
          selected: true,
          url: '/lock',
        },
      ],
    });

    const badge = element.shadowRoot?.querySelector<HTMLElement>('.badge');
    const badgeIcon = badge?.querySelector<HaIconElement>('.badge-icon');

    expect(badge).toHaveClass('active', 'with-icon');
    expect(badge).not.toHaveClass('with-counter');
    expect(badge?.textContent?.trim()).toBe('');
    expect(badge?.style.backgroundColor).toBe('red');
    expect(badge?.style.color).toBe('white');
    expect(badgeIcon?.icon).toBe('mdi:lock-open-variant');
  });

  it('updates templated icon and color and falls back to count', async () => {
    element._hass = createHass({
      'lock.front_door': { state: 'unlocked' },
    } as unknown as HomeAssistant['states']);

    await setConfig({
      routes: [
        {
          badge: {
            count: 'Locked',
            icon: `[[[
              return states['lock.front_door'].state === 'unlocked'
                ? 'mdi:lock-open-variant'
                : '';
            ]]]`,
            icon_color: '[[[ return "#123456"; ]]]',
            show: true,
          },
          icon: 'mdi:lock',
          url: '/lock',
        },
      ],
    });

    let badge = element.shadowRoot?.querySelector<HTMLElement>('.badge');
    let badgeIcon = badge?.querySelector<HaIconElement>('.badge-icon');

    expect(badge).toHaveClass('with-icon');
    expect(badge?.style.color).toBe('rgb(18, 52, 86)');
    expect(badgeIcon?.icon).toBe('mdi:lock-open-variant');

    element._hass = createHass({
      'lock.front_door': { state: 'locked' },
    } as unknown as HomeAssistant['states']);
    await element.updateComplete;

    badge = element.shadowRoot?.querySelector<HTMLElement>('.badge');
    badgeIcon = badge?.querySelector<HaIconElement>('.badge-icon');

    expect(badge).toHaveClass('with-counter');
    expect(badge).not.toHaveClass('with-icon');
    expect(badge?.textContent?.trim()).toBe('Locked');
    expect(badgeIcon).toBeNull();
  });

  it('preserves dot, zero, text, legacy color, and hidden badges', async () => {
    await setConfig({
      routes: [
        {
          badge: { show: true },
          icon: 'mdi:circle',
          url: '/dot',
        },
        {
          badge: { count: 0, show: true },
          icon: 'mdi:numeric-0',
          url: '/zero',
        },
        {
          badge: { count: 'ON', show: true, textColor: 'yellow' },
          icon: 'mdi:text',
          url: '/text',
        },
        {
          badge: { count: 1, show: false },
          icon: 'mdi:eye-off',
          url: '/hidden',
        },
      ],
    });

    const routes = element.shadowRoot?.querySelectorAll<HTMLElement>('.route');
    const dotBadge = routes?.[0].querySelector<HTMLElement>('.badge');
    const zeroBadge = routes?.[1].querySelector<HTMLElement>('.badge');
    const textBadge = routes?.[2].querySelector<HTMLElement>('.badge');

    expect(dotBadge).not.toHaveClass('with-counter', 'with-icon');
    expect(dotBadge?.style.color).toBe('rgb(255, 255, 255)');
    expect(zeroBadge).toHaveClass('with-counter');
    expect(zeroBadge?.textContent?.trim()).toBe('0');
    expect(textBadge?.textContent?.trim()).toBe('ON');
    expect(textBadge?.style.color).toBe('yellow');
    expect(routes?.[3].querySelector('.badge')).toBeNull();
  });

  it('uses the documented icon foreground color priority', async () => {
    await setConfig({
      routes: [
        {
          badge: {
            icon: 'mdi:alpha-a',
            show: true,
            text_color: 'lime',
            textColor: 'yellow',
          },
          icon: 'mdi:home',
          url: '/text-color',
        },
        {
          badge: {
            color: 'black',
            icon: 'mdi:alpha-b',
            show: true,
            textColor: 'yellow',
          },
          icon: 'mdi:home',
          url: '/legacy-text-color',
        },
        {
          badge: { color: 'black', icon: 'mdi:alpha-c', show: true },
          icon: 'mdi:home',
          url: '/automatic-color',
        },
      ],
    });

    const badges = element.shadowRoot?.querySelectorAll<HTMLElement>('.badge');

    expect(badges?.[0].style.color).toBe('lime');
    expect(badges?.[1].style.color).toBe('yellow');
    expect(badges?.[2].style.color).toBe('rgb(255, 255, 255)');
  });

  it('renders an icon badge inside a popup item button', async () => {
    const popupItem = new PopupItem(
      element,
      {} as Popup,
      {
        badge: {
          icon: 'mdi:sleep',
          icon_color: 'white',
          show: true,
        },
        icon: 'mdi:baby-face-outline',
        url: '/nursery',
      },
      0,
    );
    const popupFixture = await fixture<HTMLElement>(html`
      <div>${popupItem.render('open-up', 'label-right')}</div>
    `);

    const button = popupFixture.querySelector<HTMLElement>(
      '.popup-item .button',
    );
    const badge = button?.querySelector<HTMLElement>('.badge.with-icon');
    const badgeIcon = badge?.querySelector<HaIconElement>('.badge-icon');

    expect(badge?.parentElement).toBe(button);
    expect(badgeIcon?.icon).toBe('mdi:sleep');
  });

  it('exposes Home Assistant-aligned badge sizing variables', async () => {
    await setConfig({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });

    const styles = element.shadowRoot?.querySelector<HTMLStyleElement>(
      '#navbar-card-default-styles',
    );

    expect(styles?.textContent).toContain('--navbar-badge-size: 16px');
    expect(styles?.textContent).toContain('--navbar-badge-icon-size: 12px');
    expect(styles?.textContent).toContain('--icon-primary-color: currentColor');
  });
});
