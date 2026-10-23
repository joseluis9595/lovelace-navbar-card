import type { HomeAssistant } from 'custom-card-helpers';

import type { NavbarCardConfig } from '@/types';

import { getLovelace, getNavbarTemplates } from './dom';

/**
 * Shared navbar templates.
 *
 * Templates saved from the visual editor are stored in a dedicated dashboard,
 * hidden from the sidebar, so every navbar-card can use them from any
 * dashboard. They are loaded once per page and reloaded when that dashboard
 * changes.
 */

export const SHARED_TEMPLATES_DASHBOARD = 'navbar-card-templates';

export type NavbarTemplates = Record<string, NavbarCardConfig>;

type LovelaceConfig = {
  views?: unknown[];
  'navbar-templates'?: NavbarTemplates;
  [key: string]: unknown;
};

/** Loaded shared templates, or null until the first load finishes */
let sharedTemplates: NavbarTemplates | null = null;
let loading: Promise<NavbarTemplates> | null = null;
const listeners = new Set<() => void>();

/** Shared templates, or null while they are still loading */
export const getSharedTemplates = () => sharedTemplates;

/**
 * Templates available to a card: shared ones, overridden by the ones defined in
 * the current dashboard under `navbar-templates`.
 */
export const getAvailableTemplates = (): NavbarTemplates => ({
  ...sharedTemplates,
  ...getNavbarTemplates(),
});

/**
 * Subscribe to shared templates changes.
 * Returns a function to unsubscribe.
 */
export const onSharedTemplatesChange = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setSharedTemplates = (templates: NavbarTemplates) => {
  sharedTemplates = templates;
  for (const listener of listeners) listener();
};

/** Fetch the templates dashboard config, or null if it does not exist yet */
const fetchDashboardConfig = async (
  hass: HomeAssistant,
): Promise<LovelaceConfig | null> => {
  try {
    return await hass.callWS<LovelaceConfig>({
      type: 'lovelace/config',
      url_path: SHARED_TEMPLATES_DASHBOARD,
    });
  } catch (error) {
    // Any other error (e.g. connection lost) must not look like an empty
    // dashboard, or saving would replace all the templates
    if ((error as { code?: string }).code === 'config_not_found') return null;
    throw error;
  }
};

const reload = async (hass: HomeAssistant) => {
  try {
    const config = await fetchDashboardConfig(hass);
    setSharedTemplates(config?.['navbar-templates'] ?? {});
  } catch {
    setSharedTemplates(sharedTemplates ?? {});
  }
  return sharedTemplates ?? {};
};

/**
 * Load shared templates once per page, and keep them updated when the
 * templates dashboard is saved (from any device).
 */
export const loadSharedTemplates = (hass: HomeAssistant) => {
  if (!loading) {
    loading = reload(hass);
    hass.connection
      .subscribeEvents<{ data?: { url_path?: string } }>(event => {
        if (event.data?.url_path === SHARED_TEMPLATES_DASHBOARD) reload(hass);
      }, 'lovelace_updated')
      .catch(() => {});
  }
  return loading;
};

/** Create the templates dashboard, hidden from the sidebar */
const createDashboard = async (
  hass: HomeAssistant,
): Promise<LovelaceConfig> => {
  const dashboards = await hass.callWS<{ url_path: string }[]>({
    type: 'lovelace/dashboards/list',
  });
  if (!dashboards.some(d => d.url_path === SHARED_TEMPLATES_DASHBOARD)) {
    await hass.callWS({
      icon: 'mdi:dock-bottom',
      require_admin: false,
      show_in_sidebar: false,
      title: "Navbar Card templates [don't delete]",
      type: 'lovelace/dashboards/create',
      url_path: SHARED_TEMPLATES_DASHBOARD,
    });
  }
  return {
    views: [
      {
        cards: [
          {
            content:
              "This dashboard stores the **Navbar Card** templates shared by all your dashboards. Edit them from the Navbar Card visual editor, and don't delete this dashboard.",
            type: 'markdown',
          },
        ],
        title: 'Navbar Card templates',
      },
    ],
  };
};

/**
 * Save (or delete, when `config` is null) a shared template, creating the
 * templates dashboard first if needed. Requires an admin user.
 */
export const saveSharedTemplate = async (
  hass: HomeAssistant,
  name: string,
  config: NavbarCardConfig | null,
) => {
  const dashboard =
    (await fetchDashboardConfig(hass)) ?? (await createDashboard(hass));

  const templates = { ...dashboard['navbar-templates'] };
  if (config) {
    templates[name] = config;
  } else {
    delete templates[name];
  }

  await hass.callWS({
    config: { ...dashboard, 'navbar-templates': templates },
    type: 'lovelace/config/save',
    url_path: SHARED_TEMPLATES_DASHBOARD,
  });
  setSharedTemplates(templates);
};

/**
 * Move a template defined in the current dashboard (`navbar-templates`) to the
 * shared templates, keeping its name, so cards using it now use the shared one.
 */
export const moveDashboardTemplateToShared = async (
  hass: HomeAssistant,
  name: string,
) => {
  const lovelace = getLovelace();
  const dashboardTemplates = lovelace?.config['navbar-templates'];
  const template = dashboardTemplates?.[name];
  if (!(lovelace && template)) {
    throw new Error(`Template "${name}" not found in this dashboard`);
  }
  if (sharedTemplates?.[name]) {
    throw new Error(`A shared template named "${name}" already exists`);
  }

  await saveSharedTemplate(hass, name, template);

  const { [name]: _moved, ...remaining } = dashboardTemplates;
  const { 'navbar-templates': _templates, ...dashboard } = lovelace.config;
  await lovelace.saveConfig(
    Object.keys(remaining).length > 0
      ? { ...dashboard, 'navbar-templates': remaining }
      : dashboard,
  );
};

/** Reset module state, for tests */
export const resetSharedTemplates = () => {
  sharedTemplates = null;
  loading = null;
  listeners.clear();
};
