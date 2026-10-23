import { loadHaComponents } from '@kipk/load-ha-components';
import { fixture, html } from '@open-wc/testing';
import { describe, expect, it, vi } from 'vitest';

import '@/navbar-card-editor';

import type { NavbarCardEditor } from '@/navbar-card-editor';
import {
  DesktopPosition,
  type DotNotationKeys,
  type NavbarCardConfig,
} from '@/types';
import {
  getAvailableTemplates,
  getSharedTemplates,
  saveSharedTemplate,
} from '@/utils/shared-templates';

vi.mock('@kipk/load-ha-components', () => ({
  loadHaComponents: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/shared-templates', async importOriginal => ({
  ...(await importOriginal<typeof import('@/utils/shared-templates')>()),
  getAvailableTemplates: vi.fn(() => ({})),
  getSharedTemplates: vi.fn(() => null),
  loadSharedTemplates: vi.fn(),
  saveSharedTemplate: vi.fn().mockResolvedValue(undefined),
}));

const createEditor = async (config: NavbarCardConfig) => {
  const editor = await fixture<NavbarCardEditor>(
    html`<navbar-card-editor></navbar-card-editor>`,
  );
  editor.setConfig(config);
  await editor.updateComplete;
  return editor;
};

const listenConfigChanged = (editor: NavbarCardEditor) => {
  const configChanged = vi.fn();
  editor.addEventListener('config-changed', configChanged);
  return configChanged;
};

const lastConfig = (configChanged: ReturnType<typeof vi.fn>) => {
  const calls = configChanged.mock.calls;
  return calls[calls.length - 1]?.[0].detail.config as NavbarCardConfig;
};

describe('NavbarCardEditor bootstrapping', () => {
  it('loads HA selector components used by the editor', async () => {
    await createEditor({ routes: [{ icon: 'mdi:home', url: '/' }] });

    expect(loadHaComponents).toHaveBeenCalledWith(
      expect.arrayContaining(['ha-selector', 'ha-code-editor', 'ha-button']),
    );
    expect(loadHaComponents).not.toHaveBeenCalledWith(
      expect.arrayContaining(['ha-textfield']),
    );
  });
});

describe('NavbarCardEditor makeSelector helpers', () => {
  it('writes string values through ha-selector', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeTemplatable({
          configKey: 'routes.0.label' as DotNotationKeys<NavbarCardConfig>,
          inputType: 'string',
          label: 'Label',
        })}
      </div>
    `);
    const selector = field.querySelector('ha-selector') as HTMLElement & {
      selector?: Record<string, unknown>;
    };

    expect(selector?.selector).toEqual({
      text: expect.objectContaining({ type: 'text' }),
    });

    selector?.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: 'Living room' } }),
    );

    expect(lastConfig(configChanged).routes[0].label).toBe('Living room');
  });

  it('clears string values when the selector emits empty', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeTextInput({
          configKey: 'routes.0.label' as DotNotationKeys<NavbarCardConfig>,
          label: 'Label',
        })}
      </div>
    `);

    field
      .querySelector('ha-selector')
      ?.dispatchEvent(
        new CustomEvent('value-changed', { detail: { value: '' } }),
      );

    expect(lastConfig(configChanged).routes[0].label).toBeUndefined();
  });

  it('accepts any CSS color and theme colors for color fields', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);
    const renderColor = () =>
      fixture<HTMLElement>(html`
        <div>
          ${editor.makeColorPicker({
            configKey:
              'routes.0.selected_color' as DotNotationKeys<NavbarCardConfig>,
            label: 'Selected color',
          })}
        </div>
      `);

    // Defined by the Home Assistant theme
    editor.style.setProperty('--light-blue-color', '#03a9f4');
    const field = await renderColor();
    const selector = field.querySelector('ha-selector') as HTMLElement & {
      selector?: Record<string, unknown>;
      value?: unknown;
    };
    expect(selector?.selector).toEqual({ ui_color: {} });
    const pick = (value: string) =>
      selector?.dispatchEvent(
        new CustomEvent('value-changed', { detail: { value } }),
      );

    pick('#ff8800');
    expect(lastConfig(configChanged).routes[0].selected_color).toBe('#ff8800');

    pick('light-blue');
    expect(lastConfig(configChanged).routes[0].selected_color).toBe(
      'var(--light-blue-color)',
    );
    // The picker shows the theme color by its name
    const updated = (await renderColor()).querySelector(
      'ha-selector',
    ) as typeof selector;
    expect(updated?.value).toBe('light-blue');
  });

  it('uses compact switches that toggle from the whole row', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);
    const renderSwitch = () =>
      fixture<HTMLElement>(html`
        <div>
          ${editor.makeSwitch({
            configKey:
              'layout.auto_padding.enabled' as DotNotationKeys<NavbarCardConfig>,
            defaultValue: false,
            label: 'Enable auto padding',
          })}
        </div>
      `);

    const field = await renderSwitch();
    const toggle = field.querySelector('ha-switch') as HTMLElement & {
      checked?: boolean;
    };
    expect(toggle?.checked).toBe(false);

    field.querySelector<HTMLElement>('.switch-row-label')?.click();
    expect(lastConfig(configChanged).layout?.auto_padding?.enabled).toBe(true);

    // The options menu is shared, and rendered by the editor
    field.querySelector<HTMLElement>('.field-menu-button')?.click();
    await editor.updateComplete;
    expect(
      editor.shadowRoot
        ?.querySelector('a.field-menu-item')
        ?.getAttribute('href'),
    ).toMatch(/configuration\/layout#auto-padding-enabled$/);
  });

  it('switches a field to a JavaScript template from its menu', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', label: 'Home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);
    const renderLabel = () =>
      fixture<HTMLElement>(html`
        <div>
          ${editor.makeTemplatable({
            configKey: 'routes.0.label' as DotNotationKeys<NavbarCardConfig>,
            inputType: 'string',
            label: 'Label',
          })}
        </div>
      `);

    (await renderLabel())
      .querySelector<HTMLElement>('.field-menu-button')
      ?.click();
    await editor.updateComplete;
    const items = [
      ...(editor.shadowRoot?.querySelectorAll<HTMLElement>(
        'button.field-menu-item',
      ) ?? []),
    ];
    items
      .find(item => item.textContent?.includes('Use a JavaScript template'))
      ?.click();
    await editor.updateComplete;

    // The field now shows the template editor, starting empty
    expect(configChanged).toHaveBeenCalled();
    expect((await renderLabel()).querySelector('ha-code-editor')).toBeTruthy();
  });

  it('parses number text selectors to integers', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeTextInput({
          configKey:
            'layout.auto_padding.desktop_px' as DotNotationKeys<NavbarCardConfig>,
          label: 'Desktop padding',
          type: 'number',
        })}
      </div>
    `);

    field
      .querySelector('ha-selector')
      ?.dispatchEvent(
        new CustomEvent('value-changed', { detail: { value: '80' } }),
      );

    expect(lastConfig(configChanged).layout?.auto_padding?.desktop_px).toBe(80);
  });
});

describe('NavbarCardEditor badge fields', () => {
  it('loads the required controls and writes badge UI values', async () => {
    const editor = await createEditor({
      routes: [{ badge: {}, icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeTemplatable({
          configKey:
            'routes.0.badge.icon' as unknown as DotNotationKeys<NavbarCardConfig>,
          inputType: 'icon',
          label: 'Icon',
        })}
        ${editor.makeTemplatable({
          configKey:
            'routes.0.badge.icon_color' as unknown as DotNotationKeys<NavbarCardConfig>,
          inputType: 'color',
          label: 'Icon color',
        })}
      </div>
    `);
    const selectors = field.querySelectorAll('ha-selector');
    expect(selectors.length).toBe(2);

    selectors[0]?.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: 'mdi:sleep' },
      }),
    );
    selectors[1]?.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: '#123456' },
      }),
    );

    const changedConfig = lastConfig(configChanged);
    expect(loadHaComponents).toHaveBeenCalledWith(
      expect.arrayContaining(['ha-code-editor', 'ha-selector']),
    );
    expect(changedConfig.routes[0].badge?.icon).toBe('mdi:sleep');
    expect(changedConfig.routes[0].badge?.icon_color).toBe('#123456');
  });

  it.each([
    { field: 'icon', inputType: 'icon' as const },
    { field: 'icon_color', inputType: 'color' as const },
  ])(
    'preserves badge $field template mode',
    async ({ field: configField, inputType }) => {
      const editor = await createEditor({
        routes: [
          {
            badge: { [configField]: '[[[ return "white"; ]]]' },
            icon: 'mdi:home',
            url: '/',
          },
        ],
      });
      const configChanged = listenConfigChanged(editor);

      const fieldFixture = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeTemplatable({
          configKey:
            `routes.0.badge.${configField}` as unknown as DotNotationKeys<NavbarCardConfig>,
          inputType,
          label: configField,
        })}
      </div>
    `);
      const codeEditor = fieldFixture.querySelector<
        HTMLElement & { value?: string }
      >('ha-code-editor');
      if (codeEditor) codeEditor.value = 'return "black";';

      codeEditor?.dispatchEvent(new CustomEvent('value-changed'));

      expect(lastConfig(configChanged).routes[0].badge?.[configField]).toBe(
        '[[[return "black";]]]',
      );
    },
  );
});

describe('NavbarCardEditor media player list', () => {
  it('removes the last player from config (#332)', async () => {
    const editor = await createEditor({
      media_player: {
        players: [{ entity: 'media_player.test' }],
      },
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    (
      editor as unknown as { removeMediaPlayer: (i: number) => void }
    ).removeMediaPlayer(0);

    expect(configChanged).toHaveBeenCalled();
    expect(lastConfig(configChanged).media_player?.players).toBeUndefined();
  });

  it('removes one player without clearing the rest', async () => {
    const editor = await createEditor({
      media_player: {
        players: [
          { entity: 'media_player.one' },
          { entity: 'media_player.two' },
        ],
      },
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    (
      editor as unknown as { removeMediaPlayer: (i: number) => void }
    ).removeMediaPlayer(0);

    expect(lastConfig(configChanged).media_player?.players).toEqual([
      { entity: 'media_player.two' },
    ]);
  });
});

describe('NavbarCardEditor shared templates', () => {
  const routes = [{ icon: 'mdi:home', label: 'Home', url: '/' }];

  it('saves the card as a shared template and uses it', async () => {
    const editor = await createEditor({
      routes,
      type: 'custom:navbar-card',
    } as NavbarCardConfig);
    const configChanged = listenConfigChanged(editor);
    const internals = editor as unknown as {
      _newTemplateName: string;
      _saveAsTemplate: () => Promise<void>;
    };

    internals._newTemplateName = 'main';
    await internals._saveAsTemplate();

    expect(saveSharedTemplate).toHaveBeenCalledWith(undefined, 'main', {
      routes,
    });
    expect(lastConfig(configChanged)).toEqual({
      template: 'main',
      type: 'custom:navbar-card',
    });
  });

  it('edits the shared template in its own dialog, without changing the card', async () => {
    vi.mocked(getSharedTemplates).mockReturnValue({ main: { routes } });
    const editor = await createEditor({
      template: 'main',
    } as NavbarCardConfig);
    const configChanged = listenConfigChanged(editor);
    const internals = editor as unknown as {
      _config: NavbarCardConfig;
      _templateDialog: { name: string; draft: NavbarCardConfig } | null;
      _startEditingTemplate: () => void;
      _saveTemplateDialog: () => Promise<void>;
    };

    internals._startEditingTemplate();
    await editor.updateComplete;
    const templateEditor = editor.shadowRoot?.querySelector(
      '.template-dialog navbar-card-editor',
    ) as NavbarCardEditor;
    expect(templateEditor.isTemplateEditor).toBe(true);

    templateEditor.updateConfigByKey(
      'routes.0.label' as DotNotationKeys<NavbarCardConfig>,
      'House',
    );
    expect(configChanged).not.toHaveBeenCalled();
    expect(internals._templateDialog?.draft.routes[0].label).toBe('House');

    // Escape stays in the dialog, so HA's card dialog doesn't close
    const escapeListener = vi.fn();
    editor.addEventListener('keydown', escapeListener);
    templateEditor.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Escape',
      }),
    );
    expect(escapeListener).not.toHaveBeenCalled();

    await internals._saveTemplateDialog();

    expect(saveSharedTemplate).toHaveBeenCalledWith(undefined, 'main', {
      routes: [{ ...routes[0], label: 'House' }],
    });
    expect(internals._templateDialog).toBeNull();
    expect(internals._config).toEqual({ template: 'main' });
  });
});

describe('NavbarCardEditor template code editor', () => {
  const routes = [{ icon: 'mdi:home', label: 'Home', url: '/' }];

  it('edits the shared template as YAML, and back in the visual editor', async () => {
    vi.mocked(getSharedTemplates).mockReturnValue({ main: { routes } });
    const editor = await createEditor({ template: 'main' } as NavbarCardConfig);
    const internals = editor as unknown as {
      _templateDialog: { draft: NavbarCardConfig; yaml?: boolean } | null;
      _startEditingTemplate: () => void;
      _saveTemplateDialog: () => Promise<void>;
    };
    const query = <T extends Element>(selector: string) =>
      editor.shadowRoot?.querySelector<T>(`.template-dialog ${selector}`);
    const buttons = () => [
      ...(editor.shadowRoot?.querySelectorAll<
        HTMLElement & { disabled: boolean }
      >('.template-dialog-actions ha-button') ?? []),
    ];
    const edit = async (value: unknown, isValid: boolean) => {
      query('ha-yaml-editor')?.dispatchEvent(
        new CustomEvent('value-changed', { detail: { isValid, value } }),
      );
      await editor.updateComplete;
    };

    internals._startEditingTemplate();
    await editor.updateComplete;
    buttons()[0].click();
    await editor.updateComplete;
    const yamlEditor = query<HTMLElement & { defaultValue: unknown }>(
      'ha-yaml-editor',
    );
    expect(yamlEditor?.defaultValue).toEqual({ routes });
    expect(query('navbar-card-editor')).toBeNull();

    // Invalid YAML can't be saved, nor shown in the visual editor
    await edit(undefined, false);
    expect(buttons().map(button => button.disabled)).toEqual([
      true,
      false,
      true,
    ]);

    const edited = { routes: [{ ...routes[0], label: 'Garage' }] };
    await edit(edited, true);
    expect(buttons()[2].disabled).toBe(false);

    buttons()[0].click();
    await editor.updateComplete;
    const templateEditor = query<NavbarCardEditor>('navbar-card-editor');
    expect((templateEditor as unknown as { _config: unknown })._config).toEqual(
      edited,
    );

    await internals._saveTemplateDialog();
    expect(saveSharedTemplate).toHaveBeenCalledWith(undefined, 'main', edited);
  });
});

describe('NavbarCardEditor quickbar action', () => {
  it('picks the quickbar mode, or none for the quick search', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:magnify', tap_action: { action: 'quickbar' } }],
    } as unknown as NavbarCardConfig);
    const configChanged = listenConfigChanged(editor);
    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeActionSelector({
          actionType: 'tap_action' as never,
          configKey: 'routes.0.tap_action' as DotNotationKeys<NavbarCardConfig>,
          inline: true,
        })}
      </div>
    `);
    const option = (label: string) =>
      [...field.querySelectorAll<HTMLElement>('.segmented-option')].find(
        button => button.textContent?.trim() === label,
      );

    expect(option('Search')?.getAttribute('aria-checked')).toBe('true');
    option('Entities')?.click();
    expect(lastConfig(configChanged).routes[0].tap_action).toEqual({
      action: 'quickbar',
      mode: 'entities',
    });
    option('Search')?.click();
    expect(lastConfig(configChanged).routes[0].tap_action).toEqual({
      action: 'quickbar',
    });
  });
});

describe('NavbarCardEditor template inheritance', () => {
  const templateRoutes = [{ icon: 'mdi:home', label: 'Home', url: '/' }];
  const template: NavbarCardConfig = {
    desktop: { position: DesktopPosition.bottom, show_labels: 'popup_only' },
    routes: templateRoutes,
  };

  type Internals = {
    _config: NavbarCardConfig;
    _getValue: (key: string) => unknown;
    _isOverridden: (key: string) => boolean;
    _countAllOverrides: () => number;
    _resetToTemplate: (key: string) => void;
  };

  const createTemplateEditor = async (config: Partial<NavbarCardConfig>) => {
    vi.mocked(getAvailableTemplates).mockReturnValue({ qa: template });
    const editor = await createEditor({
      template: 'qa',
      ...config,
    } as NavbarCardConfig);
    return {
      configChanged: listenConfigChanged(editor),
      editor,
      internals: editor as unknown as Internals,
    };
  };

  it('shows template values without copying them into the card', async () => {
    const { editor, internals, configChanged } = await createTemplateEditor({
      desktop: { position: DesktopPosition.left },
    });

    expect(internals._getValue('desktop.position')).toBe('left');
    expect(internals._getValue('desktop.show_labels')).toBe('popup_only');
    expect(internals._isOverridden('desktop.position')).toBe(true);
    expect(internals._isOverridden('desktop.show_labels')).toBe(false);
    expect(internals._countAllOverrides()).toBe(1);

    editor.updateConfigByKey(
      'mobile.mode' as DotNotationKeys<NavbarCardConfig>,
      'floating' as never,
    );
    expect(lastConfig(configChanged)).toEqual({
      desktop: { position: 'left' },
      mobile: { mode: 'floating' },
      template: 'qa',
    });
  });

  it('resets a value to the template, removing empty parents', async () => {
    const { internals, configChanged } = await createTemplateEditor({
      desktop: { position: DesktopPosition.left },
    });

    internals._resetToTemplate('desktop.position');

    expect(lastConfig(configChanged)).toEqual({ template: 'qa' });
    expect(internals._getValue('desktop.position')).toBe('bottom');
  });

  it('copies the template routes into the card to customize them', async () => {
    const { editor, internals, configChanged } = await createTemplateEditor({});
    await editor.updateComplete;

    const customize = [
      ...(editor.shadowRoot?.querySelectorAll('ha-button') ?? []),
    ].find(button =>
      button.textContent?.includes('Customize routes for this card'),
    );
    customize?.dispatchEvent(new MouseEvent('click'));

    expect(lastConfig(configChanged).routes).toEqual(templateRoutes);
    expect(lastConfig(configChanged).routes).not.toBe(templateRoutes);

    internals._resetToTemplate('routes');
    expect(lastConfig(configChanged)).toEqual({ template: 'qa' });
  });
});

describe('NavbarCardEditor route view', () => {
  const routes = [
    { icon: 'mdi:home', label: 'Home', url: '/home' },
    { icon: 'mdi:cog', label: 'Settings', url: '/config' },
  ];

  type Internals = {
    _openItem: { routeIndex: number; popupIndex?: number } | null;
    _setTapMode: (
      baseConfigKey: string,
      item: unknown,
      mode: 'navigate' | 'popup' | 'action',
    ) => void;
  };

  it('opens a route in its own view and goes back', async () => {
    const editor = await createEditor({ routes } as NavbarCardConfig);
    const internals = editor as unknown as Internals;

    const rows = editor.shadowRoot?.querySelectorAll('.item-row');
    expect(rows?.length).toBe(2);
    rows?.[1].dispatchEvent(new MouseEvent('click'));
    await editor.updateComplete;

    expect(internals._openItem).toEqual({
      popupIndex: undefined,
      routeIndex: 1,
    });
    expect(
      editor.shadowRoot?.querySelector('.item-view-title')?.textContent,
    ).toContain('Settings');

    editor.shadowRoot
      ?.querySelector<HTMLElement>('.item-view-header ha-icon-button')
      ?.dispatchEvent(new MouseEvent('click'));
    await editor.updateComplete;
    expect(internals._openItem).toBeNull();
    expect(editor.shadowRoot?.querySelector('.item-row')).toBeTruthy();
  });

  it('drops a dragged route where the drop line is', async () => {
    const labels = ['A', 'B', 'C', 'D'];
    const drag = async (clientY: number) => {
      const editor = await createEditor({
        routes: labels.map(label => ({ label, url: `/${label}` })),
      } as NavbarCardConfig);
      const configChanged = listenConfigChanged(editor);
      const rows =
        editor.shadowRoot?.querySelectorAll<HTMLElement>('.item-row');
      const lastRow = rows?.[3] as HTMLElement;
      lastRow.getBoundingClientRect = () => ({ height: 40, top: 0 }) as DOMRect;
      const dragEvent = (type: string) => {
        const event = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientY,
        }) as DragEvent;
        Object.defineProperty(event, 'dataTransfer', {
          value: { effectAllowed: '', setData: () => {} },
        });
        return event;
      };

      rows?.[0]
        .querySelector('.drag-handle')
        ?.dispatchEvent(dragEvent('dragstart'));
      lastRow.dispatchEvent(dragEvent('dragover'));
      await editor.updateComplete;
      const line = [...(rows ?? [])].findIndex(row =>
        row.matches('.drop-before, .drop-after'),
      );
      const lineAfter = lastRow.classList.contains('drop-after');
      lastRow.dispatchEvent(dragEvent('drop'));
      return {
        line,
        lineAfter,
        order: lastConfig(configChanged).routes.map(route => route.label),
      };
    };

    // Upper half of the last row: the line is above it, A lands before D
    expect(await drag(10)).toEqual({
      line: 3,
      lineAfter: false,
      order: ['B', 'C', 'A', 'D'],
    });
    // Lower half: the line is below it, A lands last
    expect(await drag(30)).toEqual({
      line: 3,
      lineAfter: true,
      order: ['B', 'C', 'D', 'A'],
    });
  });

  it('switches what a route does when tapped, keeping its URL', async () => {
    const editor = await createEditor({ routes } as NavbarCardConfig);
    const configChanged = listenConfigChanged(editor);
    const internals = editor as unknown as Internals;

    internals._setTapMode('routes.0', routes[0], 'popup');
    expect(lastConfig(configChanged).routes[0]).toEqual({
      ...routes[0],
      popup: [],
      tap_action: { action: 'open-popup' },
    });

    internals._setTapMode(
      'routes.0',
      lastConfig(configChanged).routes[0],
      'navigate',
    );
    expect(lastConfig(configChanged).routes[0]).toEqual({
      ...routes[0],
      popup: [],
    });
  });

  it('goes back to the main view when the open route is removed', async () => {
    const editor = await createEditor({ routes } as NavbarCardConfig);
    const internals = editor as unknown as Internals;

    internals._openItem = { routeIndex: 1 };
    editor.setConfig({ routes: [routes[0]] } as NavbarCardConfig);
    await editor.updateComplete;

    expect(internals._openItem).toBeNull();
  });
});
