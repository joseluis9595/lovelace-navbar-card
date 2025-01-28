import { NavbarCardConfig } from './types';

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
    // @ts-ignore
    return lovelacePanel.lovelace.config['navbar-card'];
  }
  return null;
};
