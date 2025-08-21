import { HomeAssistant } from 'custom-card-helpers';

// Extend the `HomeAssistant` type to include updated properties.
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    entities: Record<string, { icon?: string; [key: string]: unknown }>;
  }
}

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
