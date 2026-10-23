const BASE_URL = 'https://joseluis9595.github.io/lovelace-navbar-card/docs';

export const DOCS_LINKS = {
  jsTemplate: `${BASE_URL}/advanced/js-templates`,
  styles: `${BASE_URL}/configuration/styles`,
  template: `${BASE_URL}/advanced/navbar-templates`,
};

const PAGES: Record<string, string> = {
  desktop: 'configuration/desktop',
  haptic: 'configuration/haptic',
  layout: 'configuration/layout',
  media_player: 'configuration/media-player',
  mobile: 'configuration/mobile',
  routes: 'configuration/routes',
};

/**
 * Link to the documentation of an option, given its config key, e.g.
 * `routes.0.popup.1.icon`. Option rows are named like their key, after the
 * section they are in: `#icon`, `#popup-icon`, `#auto-padding-desktop_px`.
 */
export const getOptionDocsLink = (configKey: string): string | undefined => {
  if (configKey === 'styles') return DOCS_LINKS.styles;
  if (configKey === 'template') return DOCS_LINKS.template;

  const key = configKey
    .replace(/\.\d+/g, '')
    // Popup items have the same badge options as routes
    .replace('routes.popup.badge.', 'routes.badge.');
  const [page, ...path] = key.split('.');
  // Options inside actions have no row of their own
  if (!(PAGES[page] && path.length) || key.includes('_action.')) {
    return undefined;
  }
  const option = path.pop();
  const sections = path.map(section => `${section.replace(/_/g, '-')}-`);
  return `${BASE_URL}/${PAGES[page]}#${sections.join('')}${option}`;
};
