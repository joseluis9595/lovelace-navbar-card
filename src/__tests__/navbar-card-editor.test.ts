import { loadHaComponents } from '@kipk/load-ha-components';
import { fixture, html } from '@open-wc/testing';
import { describe, expect, it, vi } from 'vitest';

import '@/navbar-card-editor';

import type { NavbarCardEditor } from '@/navbar-card-editor';
import type { DotNotationKeys, NavbarCardConfig } from '@/types';

vi.mock('@kipk/load-ha-components', () => ({
  loadHaComponents: vi.fn().mockResolvedValue(undefined),
}));

describe('NavbarCardEditor badge fields', () => {
  const createEditor = async (config: NavbarCardConfig) => {
    const editor = await fixture<NavbarCardEditor>(
      html`<navbar-card-editor></navbar-card-editor>`,
    );
    editor.setConfig(config);
    await editor.updateComplete;
    return editor;
  };

  it('loads the required controls and writes badge UI values', async () => {
    const editor = await createEditor({
      routes: [{ badge: {}, icon: 'mdi:home', url: '/' }],
    });
    const configChanged = vi.fn();
    editor.addEventListener('config-changed', configChanged);

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
    const picker = field.querySelector('ha-icon-picker');
    const colorInput = field.querySelector<HTMLElement & { value: string }>(
      'ha-textfield',
    );

    picker?.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: 'mdi:sleep' },
      }),
    );
    if (colorInput) colorInput.value = '#123456';
    colorInput?.dispatchEvent(new Event('input'));

    const configChangedCalls = configChanged.mock.calls;
    const changedConfig = configChangedCalls[configChangedCalls.length - 1]?.[0]
      .detail.config as NavbarCardConfig;
    expect(loadHaComponents).toHaveBeenCalledWith(
      expect.arrayContaining(['ha-code-editor', 'ha-icon-picker']),
    );
    expect(changedConfig.routes[0].badge?.icon).toBe('mdi:sleep');
    expect(changedConfig.routes[0].badge?.icon_color).toBe('#123456');
  });

  it.each([
    { field: 'icon', inputType: 'icon' as const },
    { field: 'icon_color', inputType: 'color' as const },
  ])('preserves badge $field template mode', async ({
    field: configField,
    inputType,
  }) => {
    const editor = await createEditor({
      routes: [
        {
          badge: { [configField]: '[[[ return "white"; ]]]' },
          icon: 'mdi:home',
          url: '/',
        },
      ],
    });
    const configChanged = vi.fn();
    editor.addEventListener('config-changed', configChanged);

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

    const changedConfig = configChanged.mock.calls[0][0].detail
      .config as NavbarCardConfig;
    expect(changedConfig.routes[0].badge?.[configField]).toBe(
      '[[[return "black";]]]',
    );
  });
});
