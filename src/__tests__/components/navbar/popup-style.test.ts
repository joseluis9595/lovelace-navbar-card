import { fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { beforeEach, describe, expect, it } from 'vitest';

import { type NavbarCardConfig, NavbarCustomActions } from '@/types';

import { NavbarCard } from '../../../navbar-card';

if (!customElements.get('navbar-card')) {
  customElements.define('navbar-card', NavbarCard);
}

const config = (
  popupStyle?: NonNullable<NavbarCardConfig['layout']>['popup_style'],
): NavbarCardConfig => ({
  layout: popupStyle ? { popup_style: popupStyle } : undefined,
  mobile: { show_labels: false },
  routes: [
    {
      icon: 'mdi:dots-horizontal',
      label: 'More',
      popup: [
        { icon: 'mdi:sofa', label: 'Lounge', url: '/lounge' },
        { icon: 'mdi:kettle', label: 'Kitchen', url: '/kitchen' },
      ],
      tap_action: { action: NavbarCustomActions.openPopup },
    },
  ],
});

describe('layout.popup_style', () => {
  let element: NavbarCard;

  const navbar = () =>
    element.shadowRoot?.querySelector('.navbar') as HTMLElement;

  const tapRoute = async (index = 0) => {
    element.shadowRoot
      ?.querySelectorAll('.route')
      [index]?.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true }),
      );
    await element.updateComplete;
  };

  const openPopup = () => tapRoute();

  /** Popups fade out before they are removed */
  const afterClose = async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    await element.updateComplete;
  };

  beforeEach(async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
      writable: true,
    });
    window.dispatchEvent(new Event('resize'));
    element = await fixture<NavbarCard>(html`<navbar-card></navbar-card>`);
    element._hass = { states: {}, user: {} } as unknown as HomeAssistant;
  });

  it('keeps the bubbles style by default', async () => {
    element.setConfig(config());
    await element.updateComplete;
    expect(navbar().classList.contains('popup-panel')).toBe(false);
  });

  it('marks the navbar for the panel style', async () => {
    element.setConfig(config('panel'));
    await element.updateComplete;
    expect(navbar().classList.contains('popup-panel')).toBe(true);
  });

  it('flags the navbar while a popup is open', async () => {
    element.setConfig(config('panel'));
    await element.updateComplete;
    expect(navbar().classList.contains('popup-open')).toBe(false);

    await openPopup();
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('.navbar-popup')).not.toBeNull();
    expect(navbar().classList.contains('popup-open')).toBe(true);
  });

  it('always shows popup item labels in the panel style', async () => {
    element.setConfig(config('panel'));
    await element.updateComplete;
    await openPopup();
    await element.updateComplete;

    const labels = [
      ...(element.shadowRoot?.querySelectorAll('.popup-item .label') ?? []),
    ].map(label => label.textContent?.trim());
    expect(labels).toEqual(['Lounge', 'Kitchen']);
  });

  it('closes the popup when its route is tapped again', async () => {
    element.setConfig(config('panel'));
    await element.updateComplete;

    await openPopup();
    expect(element.activePopup).not.toBeNull();

    await openPopup();
    await afterClose();
    expect(element.activePopup).toBeNull();
    expect(element.shadowRoot?.querySelector('.navbar-popup')).toBeNull();
    expect(navbar().classList.contains('popup-open')).toBe(false);
  });

  it("switches straight to another route's popup", async () => {
    const twoPopups = config('panel');
    twoPopups.routes = [
      ...twoPopups.routes,
      {
        icon: 'mdi:cog',
        label: 'Admin',
        popup: [{ icon: 'mdi:tools', label: 'Tools', url: '/tools' }],
        tap_action: { action: NavbarCustomActions.openPopup },
      },
    ];
    element.setConfig(twoPopups);
    await element.updateComplete;

    await tapRoute(0);
    const first = element.activePopup;
    await tapRoute(1);
    await afterClose();

    expect(element.activePopup).not.toBeNull();
    expect(element.activePopup).not.toBe(first);
    const labels = [
      ...(element.shadowRoot?.querySelectorAll('.popup-item .label') ?? []),
    ].map(label => label.textContent?.trim());
    expect(labels).toEqual(['Tools']);
  });

  it('follows show_labels in the bubbles style', async () => {
    element.setConfig(config('bubbles'));
    await element.updateComplete;
    await openPopup();
    await element.updateComplete;

    expect(
      element.shadowRoot?.querySelectorAll('.popup-item .label').length,
    ).toBe(0);
  });
});
