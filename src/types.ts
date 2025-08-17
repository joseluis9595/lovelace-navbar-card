import { HomeAssistant } from 'custom-card-helpers';

export type NavbarCardPublicState = {
  isDesktop: boolean;
};

export type TemplateFunction<T = unknown> = (
  states: HomeAssistant['states'],
  user: HomeAssistant['user'],
  hass: HomeAssistant,
  navbar: NavbarCardPublicState,
) => T;

export type RippleElement = Element & {
  hovered?: boolean;
  pressed?: boolean;
};
