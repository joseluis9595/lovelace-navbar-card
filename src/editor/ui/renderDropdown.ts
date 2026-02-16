import { html, type TemplateResult } from 'lit';

import type { DotNotationKeys, NavbarCardConfig } from '@/types';
import { supportsHAComponent } from '@/utils';

type OnChangeCallback<T> = (value: T | null) => void;

export interface RenderDropdownOptions<T> {
  label: string;
  items: { label: string; value: T }[];
  configKey: DotNotationKeys<NavbarCardConfig>;
  disabled?: boolean;
  helper?: string | TemplateResult;
  helperPersistent?: boolean;
  defaultValue?: T;
  allowEmptyValue?: boolean;
}

const renderHAComboBox = <T>(
  value: T,
  onChange: OnChangeCallback<T>,
  options: RenderDropdownOptions<T>,
) => {
  return html`
      <ha-combo-box
        helper=${options.helper}
        helperPersistent=${options.helperPersistent}
        label=${options.label}
        .items=${options.items}
        .value=${value ?? options.defaultValue ?? null}
        .disabled=${options.disabled}
        .hideClearIcon=${!options.allowEmptyValue}
        @value-changed="${e => {
          onChange(e.detail.value ?? null);
        }}" />
    `;
};

const renderHTMLSelect = <T>(
  value: T,
  onChange: OnChangeCallback<T>,
  options: RenderDropdownOptions<T>,
) => {
  const currentValue = value ?? options.defaultValue ?? null;
  const currentValueStr =
    currentValue !== null && currentValue !== undefined
      ? String(currentValue)
      : '';

  return html`
      <div class="editor-select-field">
        <label class="editor-label">${options.label}</label>
        <select
          class="editor-select"
          .value=${currentValueStr}
          ?disabled=${options.disabled}
          @change=${(e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            if (value === '') {
              onChange(null);
              return;
            }
            const selectedItem = options.items.find(
              item => String(item.value) === value,
            );
            onChange((selectedItem?.value as T) ?? null);
          }}>
          ${
            options.allowEmptyValue
              ? html`<option value="">
            &ndash;
            </option>`
              : html``
          }
          ${options.items.map(
            item => html`<option
              value=${String(item.value)}
              ?selected=${String(item.value) === currentValueStr}>
              ${item.label}
            </option>`,
          )}
        </select>
        ${
          options.helper
            ? html`<div class="editor-select-helper">
                ${options.helper}
              </div>`
            : html``
        }
      </div>
    `;
};

/**
 * Render a dropdown component. Either native HA combo box if supported, or custom
 * HTML select if not.
 *
 * @param value - The current value of the dropdown.
 * @param onChange - The callback to call when the value changes.
 * @param options - The options for the dropdown.
 * @returns The rendered dropdown component.
 */
export const renderDropdown = <T>(
  value: T,
  onChange: OnChangeCallback<T>,
  options: RenderDropdownOptions<T>,
) => {
  if (supportsHAComponent('ha-combo-box')) {
    return renderHAComboBox<T>(value, onChange, options);
  }
  return renderHTMLSelect<T>(value, onChange, options);
};
