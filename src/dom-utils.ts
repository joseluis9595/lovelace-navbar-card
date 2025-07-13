import { NavbarCardConfig, RippleElement } from './types';

/**
 * Get a list of user defined navbar-card templates
 */
export const getNavbarTemplates = (): Record<
  string,
  NavbarCardConfig
> | null => {
  const lovelacePanel = document
    ?.querySelector('home-assistant')
    ?.shadowRoot?.querySelector('home-assistant-main')
    ?.shadowRoot?.querySelector(
      'ha-drawer partial-panel-resolver ha-panel-lovelace',
    );
  if (lovelacePanel) {
    // TODO add proper typing
    // @ts-expect-error lovelacePanel does not have "lovelace" property type
    return lovelacePanel.lovelace.config['navbar-templates'];
  }
  return null;
};

/**
 * Forcefully reset the ripple effect on a Material Design ripple element.
 *
 * @param target - The HTMLElement containing the md-ripple element
 */
export const forceResetRipple = (target: HTMLElement) => {
  const rippleElements = target?.querySelectorAll('ha-ripple');

  rippleElements.forEach((ripple: RippleElement) => {
    setTimeout(() => {
      ripple.hovered = false;
      ripple.pressed = false;
    }, 10);
  });
};
