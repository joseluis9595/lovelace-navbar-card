/**
 * Home Assistant default theme variables (the subset navbar-card uses).
 * Tweak here to change every screenshot.
 */
export type ThemeName = 'light' | 'dark';

const shared = {
  '--error-color': '#db4437',
  // Home Assistant's top bar, not drawn in the screenshots
  '--header-height': '0px',
  '--ha-card-border-radius': '12px',
  '--primary-color': '#009ac7',
  '--text-primary-color': '#ffffff',
};

export const themes: Record<ThemeName, Record<string, string>> = {
  dark: {
    ...shared,
    '--card-background-color': '#1c1c1c',
    '--disabled-color': '#6f6f6f',
    '--divider-color': 'rgba(225, 225, 225, 0.12)',
    '--input-fill-color': 'rgba(255, 255, 255, 0.05)',
    '--material-shadow-elevation-2dp':
      '0px 2px 2px 0px rgba(0, 0, 0, 0.28), 0px 1px 5px 0px rgba(0, 0, 0, 0.24), 0px 3px 1px -2px rgba(0, 0, 0, 0.4)',
    '--primary-background-color': '#111111',
    '--primary-text-color': '#e1e1e1',
    '--secondary-text-color': '#9b9b9b',
    '--state-inactive-color': '#8c8c8c',
  },
  light: {
    ...shared,
    '--card-background-color': '#ffffff',
    '--disabled-color': '#bdbdbd',
    '--divider-color': 'rgba(0, 0, 0, 0.12)',
    '--input-fill-color': 'rgba(0, 0, 0, 0.04)',
    '--material-shadow-elevation-2dp':
      '0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
    '--primary-background-color': '#fafafa',
    '--primary-text-color': '#212121',
    '--secondary-text-color': '#727272',
    '--state-inactive-color': '#949494',
  },
};

/**
 * Card background for dark shots without a phone frame. Home Assistant's
 * #1c1c1c blends into the docs' dark surface, so standalone cards are drawn
 * darker. Shots with a background behind the card (phones, popups, full
 * screens) keep the real color.
 */
export const DARK_STANDALONE_CARD_BACKGROUND = '#101010';
