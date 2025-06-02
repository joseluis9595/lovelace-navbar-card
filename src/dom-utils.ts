import { NavbarCardConfig } from './types';

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
 * Quick fix to prevent ripple effect from getting stuck in the hovered state
 * @param element The navbar-card parent element
 */
export const forceResetRipple = (element: HTMLElement) => {
  const ripples = element.querySelectorAll('md-ripple');
  if (ripples) {
    ripples.forEach(ripple => {
      const surface = ripple?.shadowRoot?.querySelector('.surface');
      surface?.classList?.remove('hovered');
    });
  }
};
