import { loadHaComponents } from '@kipk/load-ha-components';
import { fixture, html } from '@open-wc/testing';
import { describe, expect, it, vi } from 'vitest';

import '@/navbar-card-editor';

import type { NavbarCardEditor } from '@/navbar-card-editor';
import type { DotNotationKeys, NavbarCardConfig } from '@/types';

vi.mock('@kipk/load-ha-components', () => ({
  loadHaComponents: vi.fn().mockResolvedValue(undefined),
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

const lastConfig = (configChanged: ReturnType<typeof vi.fn>) =>
  configChanged.mock.calls.at(-1)?.[0].detail.config as NavbarCardConfig;

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

  it('uses ui_color for color fields and accepts CSS values', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeColorPicker({
          configKey:
            'routes.0.selected_color' as DotNotationKeys<NavbarCardConfig>,
          label: 'Selected color',
        })}
      </div>
    `);
    const selector = field.querySelector('ha-selector') as HTMLElement & {
      selector?: Record<string, unknown>;
    };

    expect(selector?.selector).toEqual({
      ui_color: { include_none: true },
    });

    selector?.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: 'red' } }),
    );

    expect(lastConfig(configChanged).routes[0].selected_color).toBe('red');
  });

  it('uses boolean selector for switches and defaults unchecked to false', async () => {
    const editor = await createEditor({
      routes: [{ icon: 'mdi:home', url: '/' }],
    });
    const configChanged = listenConfigChanged(editor);

    const field = await fixture<HTMLElement>(html`
      <div>
        ${editor.makeSwitch({
          configKey:
            'layout.auto_padding.enabled' as DotNotationKeys<NavbarCardConfig>,
          defaultValue: false,
          label: 'Enable auto padding',
        })}
      </div>
    `);
    const selector = field.querySelector('ha-selector') as HTMLElement & {
      disabled?: boolean;
      selector?: Record<string, unknown>;
      value?: unknown;
    };

    expect(selector?.selector).toEqual({ boolean: {} });
    expect(selector?.disabled).toBe(false);
    expect(selector?.value).toBe(false);

    selector?.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: true } }),
    );

    expect(lastConfig(configChanged).layout?.auto_padding?.enabled).toBe(true);
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
