import type { HomeAssistant } from 'custom-card-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCardConfig } from '@/types';

import * as dom from '../../utils/dom';
import {
  getAvailableTemplates,
  getSharedTemplates,
  loadSharedTemplates,
  moveDashboardTemplateToShared,
  onSharedTemplatesChange,
  resetSharedTemplates,
  SHARED_TEMPLATES_DASHBOARD,
  saveSharedTemplate,
} from '../../utils/shared-templates';

const template = (icon: string): NavbarCardConfig => ({
  routes: [{ icon, url: '/' }],
});

describe('Shared templates', () => {
  let callWS: ReturnType<typeof vi.fn>;
  let eventListener: ((event: unknown) => void) | undefined;
  let hass: HomeAssistant;

  /** Mock the templates dashboard config (null = dashboard not saved yet) */
  const mockDashboard = (
    config: Record<string, unknown> | null,
    dashboards: { url_path: string }[] = [],
  ) => {
    callWS.mockImplementation(async (message: { type: string }) => {
      switch (message.type) {
        case 'lovelace/config':
          if (!config) throw { code: 'config_not_found' };
          return config;
        case 'lovelace/dashboards/list':
          return dashboards;
        default:
          return null;
      }
    });
  };

  const sentMessages = (type: string) =>
    callWS.mock.calls
      .map(([message]) => message)
      .filter(message => message.type === type);

  beforeEach(() => {
    resetSharedTemplates();
    callWS = vi.fn();
    eventListener = undefined;
    hass = {
      callWS,
      connection: {
        subscribeEvents: vi.fn(async (listener: (event: unknown) => void) => {
          eventListener = listener;
          return () => {};
        }),
      },
    } as unknown as HomeAssistant;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadSharedTemplates', () => {
    it('should be null until loaded', () => {
      expect(getSharedTemplates()).toBeNull();
    });

    it('should load templates from the templates dashboard', async () => {
      mockDashboard({ 'navbar-templates': { main: template('mdi:home') } });
      const listener = vi.fn();
      onSharedTemplatesChange(listener);

      await loadSharedTemplates(hass);

      expect(callWS).toHaveBeenCalledWith({
        type: 'lovelace/config',
        url_path: SHARED_TEMPLATES_DASHBOARD,
      });
      expect(getSharedTemplates()).toEqual({ main: template('mdi:home') });
      expect(listener).toHaveBeenCalledOnce();
    });

    it('should load no templates when the dashboard does not exist', async () => {
      mockDashboard(null);

      await loadSharedTemplates(hass);

      expect(getSharedTemplates()).toEqual({});
    });

    it('should only load once', async () => {
      mockDashboard({});

      await Promise.all([loadSharedTemplates(hass), loadSharedTemplates(hass)]);

      expect(sentMessages('lovelace/config')).toHaveLength(1);
    });

    it('should reload when the templates dashboard is updated', async () => {
      mockDashboard({ 'navbar-templates': { main: template('mdi:home') } });
      await loadSharedTemplates(hass);

      mockDashboard({ 'navbar-templates': { main: template('mdi:car') } });
      eventListener?.({ data: { url_path: 'other-dashboard' } });
      await vi.waitFor(() => expect(callWS).toHaveBeenCalledTimes(1));

      eventListener?.({ data: { url_path: SHARED_TEMPLATES_DASHBOARD } });
      await vi.waitFor(() =>
        expect(getSharedTemplates()).toEqual({ main: template('mdi:car') }),
      );
    });
  });

  describe('saveSharedTemplate', () => {
    it('should create the dashboard when it does not exist', async () => {
      mockDashboard(null);

      await saveSharedTemplate(hass, 'main', template('mdi:home'));

      expect(sentMessages('lovelace/dashboards/create')).toEqual([
        expect.objectContaining({
          require_admin: false,
          show_in_sidebar: false,
          url_path: SHARED_TEMPLATES_DASHBOARD,
        }),
      ]);
      const [save] = sentMessages('lovelace/config/save');
      expect(save.config['navbar-templates']).toEqual({
        main: template('mdi:home'),
      });
      expect(save.config.views).toHaveLength(1);
      expect(getSharedTemplates()).toEqual({ main: template('mdi:home') });
    });

    it('should not create the dashboard twice', async () => {
      mockDashboard(null, [{ url_path: SHARED_TEMPLATES_DASHBOARD }]);

      await saveSharedTemplate(hass, 'main', template('mdi:home'));

      expect(sentMessages('lovelace/dashboards/create')).toHaveLength(0);
    });

    it('should keep the other templates and the dashboard config', async () => {
      const views = [{ title: 'Info' }];
      mockDashboard({
        'navbar-templates': { other: template('mdi:car') },
        views,
      });

      await saveSharedTemplate(hass, 'main', template('mdi:home'));

      const [save] = sentMessages('lovelace/config/save');
      expect(save).toEqual({
        config: {
          'navbar-templates': {
            main: template('mdi:home'),
            other: template('mdi:car'),
          },
          views,
        },
        type: 'lovelace/config/save',
        url_path: SHARED_TEMPLATES_DASHBOARD,
      });
    });

    it('should not save when the dashboard can not be read', async () => {
      callWS.mockImplementation(async (message: { type: string }) => {
        if (message.type === 'lovelace/config') {
          throw { code: 'connection_lost' };
        }
        return null;
      });

      await expect(
        saveSharedTemplate(hass, 'main', template('mdi:home')),
      ).rejects.toEqual({ code: 'connection_lost' });
      expect(sentMessages('lovelace/config/save')).toHaveLength(0);
    });

    it('should delete a template', async () => {
      mockDashboard({
        'navbar-templates': {
          main: template('mdi:home'),
          other: template('mdi:car'),
        },
      });

      await saveSharedTemplate(hass, 'main', null);

      const [save] = sentMessages('lovelace/config/save');
      expect(save.config['navbar-templates']).toEqual({
        other: template('mdi:car'),
      });
    });
  });

  describe('getAvailableTemplates', () => {
    it('should let dashboard templates override shared ones', async () => {
      mockDashboard({
        'navbar-templates': {
          main: template('mdi:home'),
          shared: template('mdi:share'),
        },
      });
      await loadSharedTemplates(hass);
      vi.spyOn(dom, 'getNavbarTemplates').mockReturnValue({
        main: template('mdi:car'),
      });

      expect(getAvailableTemplates()).toEqual({
        main: template('mdi:car'),
        shared: template('mdi:share'),
      });
    });
  });
});

describe('moveDashboardTemplateToShared', () => {
  const template = { routes: [{ icon: 'mdi:home', url: '/' }] };
  let callWS: ReturnType<typeof vi.fn>;
  let saveConfig: ReturnType<
    typeof vi.fn<(config: Record<string, unknown>) => Promise<void>>
  >;
  let hass: HomeAssistant;

  beforeEach(() => {
    resetSharedTemplates();
    callWS = vi.fn(async (message: { type: string }) =>
      message.type === 'lovelace/config' ? { views: [] } : null,
    );
    saveConfig = vi
      .fn<(config: Record<string, unknown>) => Promise<void>>()
      .mockResolvedValue(undefined);
    hass = { callWS } as unknown as HomeAssistant;
    vi.spyOn(dom, 'getLovelace').mockReturnValue({
      config: {
        'navbar-templates': { main: template, other: template },
        views: [{ title: 'Home' }],
      },
      saveConfig,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves it as a shared template and removes it from the dashboard', async () => {
    await moveDashboardTemplateToShared(hass, 'main');

    expect(getSharedTemplates()).toEqual({ main: template });
    expect(saveConfig).toHaveBeenCalledWith({
      'navbar-templates': { other: template },
      views: [{ title: 'Home' }],
    });
  });

  it('refuses to replace a shared template with the same name', async () => {
    callWS.mockImplementation(async (message: { type: string }) =>
      message.type === 'lovelace/config'
        ? { 'navbar-templates': { main: template } }
        : null,
    );
    await loadSharedTemplates({
      ...hass,
      connection: { subscribeEvents: vi.fn().mockResolvedValue(() => {}) },
    } as unknown as HomeAssistant);

    await expect(moveDashboardTemplateToShared(hass, 'main')).rejects.toThrow(
      'A shared template named "main" already exists',
    );
    expect(saveConfig).not.toHaveBeenCalled();
  });
});
