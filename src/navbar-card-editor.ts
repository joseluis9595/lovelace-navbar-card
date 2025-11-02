/* eslint-disable @typescript-eslint/no-explicit-any */
// Reason: Dynamic dot-notation keys for deeply nested config editing in a generic editor.
import { LitElement, PropertyValues, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { loadHaComponents } from '@kipk/load-ha-components';
import {
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  ExtendedActionConfig,
  LabelVisibilityConfig,
  MobileMode,
  NavbarCardConfig,
  NavbarCustomActions,
  PopupItem,
  QuickbarActionConfig,
  RouteItem,
  DeepPartial,
  DotNotationKeys,
  genericGetProperty,
  genericSetProperty,
  NestedType,
} from '@/types';
import {
  ColorInputOptions,
  TemplatableInputOptions,
} from './navbar-card-editor.types';
import {
  getNavbarTemplates,
  cleanTemplate,
  deepMergeKeepArrays,
  isTemplate,
  processTemplate,
  wrapTemplate,
  conditionallyRender,
} from '@/utils';
import { getEditorStyles } from './styles';
import { ACTIONS_WITH_CUSTOM_ENTITY } from '@/lib/action-handler';

enum HAActions {
  tap_action = 'tap_action',
  hold_action = 'hold_action',
  double_tap_action = 'double_tap_action',
}

const GENERIC_JS_TEMPLATE_HELPER = html`Insert valid Javascript code without [[[
  ]]].
  <a
    href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#jstemplate"
    target="_blank"
    rel="noopener"
    >See documentation</a
  >
  for more info.`;

const BOOLEAN_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>boolean</strong> value`;

const STRING_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>string</strong> value`;

enum LazyLoadedEditorSections {
  routes = 'routes',
}

@customElement('navbar-card-editor')
export class NavbarCardEditor extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private _config: NavbarCardConfig = { routes: [] };
  @state() private _lazyLoadedSections: Record<
    LazyLoadedEditorSections,
    boolean
  > = {
    [LazyLoadedEditorSections.routes]: false,
  };

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    loadHaComponents([
      'ha-form',
      'ha-tooltip',
      'ha-icon',
      'ha-button',
      'ha-combo-box',
      'ha-textfield',
      'ha-switch',
      'ha-expansion-panel',
      'ha-code-editor',
      'ha-radio',
      'ha-alert',
      'ha-formfield',
      'ha-icon-picker',
      'ha-entity-picker',
      'ha-textarea',
    ]);
  }

  /**********************************************************************/
  /* Lazy load sections */
  /**********************************************************************/
  private markSectionAsLazyLoaded(section: LazyLoadedEditorSections) {
    if (this._lazyLoadedSections[section]) return;
    this._lazyLoadedSections[section] = true;
    setTimeout(() => {
      this.requestUpdate();
    }, 200);
  }

  /**********************************************************************/
  /* Config mutation functions */
  /**********************************************************************/

  setConfig(config: NavbarCardConfig) {
    this._config = config;
  }

  updateConfig(newConfig: DeepPartial<NavbarCardConfig>) {
    this._config = deepMergeKeepArrays(this._config, newConfig);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
      }),
    );
  }

  // TODO change the type of "value"
  updateConfigByKey(
    key: DotNotationKeys<NavbarCardConfig>,
    value: NestedType<
      NavbarCardConfig,
      DotNotationKeys<NavbarCardConfig>
    > | null,
  ) {
    this._config = genericSetProperty(this._config, key, value);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
      }),
    );
  }

  /**********************************************************************/
  /* Edition components */
  /**********************************************************************/

  makeHelpTooltipIcon(options: { tooltip: string | TemplateResult }) {
    return html`<ha-tooltip .placement="right" .content=${options.tooltip}>
      <ha-icon icon="mdi:help-circle"></ha-icon>
    </ha-tooltip>`;
  }

  makeComboBox<T>(options: {
    label: string;
    // TODO this type T should be replaced with the value of the key in the config
    items: { label: string; value: T }[];
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    helper?: string | TemplateResult;
    helperPersistent?: boolean;
    defaultValue?: T;
    hideClearIcon?: boolean;
  }) {
    return html`
      <ha-combo-box
        helper=${options.helper}
        helperPersistent=${options.helperPersistent}
        label=${options.label}
        .items=${options.items}
        .value=${genericGetProperty(this._config, options.configKey) ??
        options.defaultValue}
        .disabled=${options.disabled}
        .hideClearIcon=${options.hideClearIcon}
        @value-changed="${e => {
          this.updateConfigByKey(options.configKey, e.detail.value);
        }}" />
    `;
  }

  makeTextInput(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    type?: 'text' | 'number' | 'textarea' | 'url';
    disabled?: boolean;
    autocomplete?: string;
    suffix?: string;
    prefixIcon?: string;
    tooltip?: string | TemplateResult;
    helper?: string | TemplateResult;
    helperPersistent?: boolean;
    placeholder?: string;
  }) {
    return html`
      <div style="display: flex; align-items: center;">
        ${options.tooltip
          ? this.makeHelpTooltipIcon({ tooltip: options.tooltip })
          : ''}
        <ha-textfield
          helper=${options.helper}
          helperPersistent=${options.helperPersistent}
          suffix=${options.suffix}
          label=${options.label}
          type=${options.type}
          placeholder=${options.placeholder}
          .value=${genericGetProperty(this._config, options.configKey) ?? ''}
          .disabled=${options.disabled}
          .autocomplete=${options.autocomplete}
          @input="${e => {
            this.updateConfigByKey(
              options.configKey,
              e.target.value?.trim() == ''
                ? null
                : options.type == 'number'
                  ? parseInt(e.target.value)
                  : e.target.value,
            );
          }}"></ha-textfield>
      </div>
    `;
  }

  makeEntityPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    includeDomains?: string[];
    excludeDomains?: string[];
  }) {
    return html`<ha-entity-picker
      label="${options.label}"
      .hass="${this.hass}"
      .value=${genericGetProperty(this._config, options.configKey) ?? ''}
      .configValue="${options.configKey}"
      .includeDomains="${options.includeDomains}"
      .excludeDomains="${options.excludeDomains}"
      .disabled="${options.disabled}"
      allow-custom-entity
      @value-changed="${e => {
        this.updateConfigByKey(options.configKey, e.detail.value);
      }}"></ha-entity-picker>`;
  }

  makeIconPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
  }) {
    return html`
      <ha-icon-picker
        label=${options.label}
        .value=${genericGetProperty(this._config, options.configKey) ?? ''}
        .disabled=${options.disabled}
        @value-changed="${e => {
          this.updateConfigByKey(options.configKey, e.detail.value);
        }}" />
    `;
  }

  makeColorPicker(options: Omit<ColorInputOptions, 'inputType'>) {
    // TODO: for now, the color picker is not supported in the editor,
    // we need a way to handle empty color values
    return this.makeTextInput({
      ...options,
      type: 'text',
    });
  }

  makeTemplatable(options: TemplatableInputOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, inputType, ...rest } = options;

    const value = genericGetProperty(this._config, options.configKey) as
      | string
      | undefined;
    const isTemplate =
      typeof value === 'string' &&
      value.trim().startsWith('[[[') &&
      value.trim().endsWith(']]]');

    // Handler to toggle between template and text
    const toggleMode = () => {
      let newValue: string | null = value ? value.toString() : '';
      if (isTemplate) {
        // Remove template delimiters
        newValue = cleanTemplate(newValue);
      } else {
        // Add template delimiters
        newValue = wrapTemplate(newValue);
      }
      this.updateConfigByKey(options.configKey, newValue);
    };

    // Button label and icon
    const buttonLabel = isTemplate
      ? 'Switch to UI input'
      : 'Switch to template';
    const buttonIcon = isTemplate ? 'mdi:format-text' : 'mdi:code-braces';

    return html`
      <div class="templatable-field">
        <div class="templatable-field-header">
          <label class="templatable-field-header-label editor-label"
            >${options.label}
          </label>
          <ha-button
            @click=${toggleMode}
            outlined
            size="small"
            variant="neutral"
            appearance="plain">
            <ha-icon slot="start" icon="${buttonIcon}"></ha-icon>
            <span>${buttonLabel}</span>
          </ha-button>
        </div>
        ${isTemplate
          ? this.makeTemplateEditor({
              label: '',
              configKey: options.configKey,
              tooltip: options.tooltip,
              helper: options.templateHelper,
              allowNull: false,
            })
          : options.inputType === 'string'
            ? this.makeTextInput({
                label: '',
                ...rest,
              })
            : options.inputType === 'number'
              ? this.makeEntityPicker({
                  label: '',
                  ...rest,
                })
              : options.inputType === 'icon'
                ? this.makeIconPicker({
                    label: '',
                    ...rest,
                  })
                : options.inputType === 'switch'
                  ? this.makeSwitch({
                      label: '',
                      ...rest,
                    })
                  : options.inputType === 'entity'
                    ? this.makeEntityPicker({
                        label: '',
                        ...rest,
                      })
                    : options.inputType === 'color'
                      ? this.makeColorPicker({
                          label: '',
                          ...rest,
                        })
                      : this.makeTextInput({
                          label: '',
                          ...rest,
                        })}
      </div>
    `;
  }

  makeTemplateEditor(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    tooltip?: string | TemplateResult;
    helper?: string | TemplateResult;
    allowNull?: boolean;
  }) {
    return html`
      <div class="template-editor-container">
        <label class="editor-label">${options.label} </label>
        <ha-code-editor
          autofocus
          autocomplete-entities
          autocomplete-icons
          .hass=${this.hass}
          .value=${cleanTemplate(
            (genericGetProperty(this._config, options.configKey) as string) ??
              '',
          )}
          @value-changed=${e => {
            const templateValue =
              e.target.value?.trim() == ''
                ? options.allowNull
                  ? null
                  : '[[[]]]'
                : wrapTemplate(e.target.value);
            this.updateConfigByKey(options.configKey, templateValue);
          }}></ha-code-editor>
        ${options.helper
          ? html`<div class="template-editor-helper">${options.helper}</div>`
          : html``}
      </div>
    `;
  }

  makeSwitch(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    tooltip?: string | TemplateResult;
    defaultValue?: boolean;
  }) {
    return html`
      <div style="display: flex; align-items: center; gap: 1em;">
        <ha-switch
          .checked=${genericGetProperty(this._config, options.configKey) ??
          options.defaultValue}
          .disabled=${options.disabled}
          @change=${(e: Event) => {
            const checked = (e.target as HTMLInputElement).checked;
            this.updateConfigByKey(options.configKey, checked as any);
          }}></ha-switch>
        ${options.tooltip
          ? this.makeHelpTooltipIcon({ tooltip: options.tooltip })
          : ''}
        <label>${options.label}</label>
      </div>
    `;
  }

  makeButton(options: {
    onClick: (e: MouseEvent) => void;
    icon: string;
    text: string;
  }) {
    return html`<ha-button @click=${options.onClick} outlined hasTrailingIcon>
      <ha-icon slot="start" icon=${options.icon}></ha-icon>
      <span>${options.text}</span>
    </ha-button>`;
  }

  makeDraggableRouteEditor(
    item: RouteItem | PopupItem,
    routeIndex: number,
    popupIndex?: number,
  ) {
    const isPopup = popupIndex != null;
    const usesTemplate = !isPopup && isTemplate((item as RouteItem).popup);

    const baseConfigKey = isPopup
      ? `routes.${routeIndex}.popup.${popupIndex}`
      : `routes.${routeIndex}`;

    const onDragStart = (
      e: DragEvent,
      routeIndex: number,
      popupIndex?: number,
    ) => {
      const dragData = {
        routeIndex,
        popupIndex,
      };
      e.dataTransfer?.setData('application/json', JSON.stringify(dragData));
      e.dataTransfer!.effectAllowed = 'move';
      (e.currentTarget as HTMLElement).classList.add('dragging');
    };
    const onDragEnd = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('dragging');
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    };
    const onDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };
    const onDrop = (e: DragEvent, routeIndex: number, popupIndex?: number) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      const dragData = JSON.parse(
        e.dataTransfer?.getData('application/json') || '{}',
      );

      // Prevent cross dropping elements
      if ((dragData.popupIndex != null) !== (popupIndex != null)) return;

      if (popupIndex == null) {
        if (dragData.routeIndex === routeIndex) return;
        const routes = [...this._config.routes];
        const [moved] = routes.splice(dragData.routeIndex, 1);
        routes.splice(routeIndex, 0, moved);
        this.updateConfig({ routes });
      } else if (
        // Make sure we are dropping the popup item inside the same route it was dragged from
        typeof popupIndex === 'number' &&
        typeof dragData.popupIndex === 'number' &&
        dragData.routeIndex === routeIndex
      ) {
        if (dragData.popupIndex === popupIndex) return;
        const routes = [...this._config.routes];
        const popups = [...(routes[routeIndex].popup || [])];
        const [moved] = popups.splice(dragData.popupIndex, 1);
        popups.splice(popupIndex, 0, moved);
        routes[routeIndex] = { ...routes[routeIndex], popup: popups };
        this.updateConfig({ routes });
      }
    };

    return html`
      <div
        class="draggable-route"
        @dragover=${onDragOver}
        @dragleave=${onDragLeave}
        @drop=${(e: DragEvent) => onDrop(e, routeIndex, popupIndex)}>
        <ha-expansion-panel outlined>
          <div
            slot="header"
            class="route-header"
            draggable="true"
            @dragstart=${(e: DragEvent) =>
              onDragStart(e, routeIndex, popupIndex)}
            @dragend=${onDragEnd}>
            <span class="drag-handle" title="Drag to reorder">
              <ha-icon icon="mdi:drag"></ha-icon>
            </span>

            <div class="route-header-title">
              ${isPopup ? 'Popup item' : 'Route'}
            </div>

            <span class="route-header-summary">
              ${item.image != undefined
                ? html`<img src="${item.image}" class="route-header-image" />`
                : html`<ha-icon icon="${item.icon}"></ha-icon>`}
              ${item.label
                ? processTemplate(this.hass, undefined, item.label)
                : ''}
            </span>

            <ha-icon-button
              @click=${e => {
                e.preventDefault();
                e.stopPropagation();
                this.removeRouteOrPopup(routeIndex, popupIndex);
              }}
              class="delete-btn"
              label=${isPopup ? 'Delete popup' : 'Delete route'}>
              <ha-icon icon="mdi:delete"></ha-icon
            ></ha-icon-button>
          </div>

          <div class="route-editor route-editor-bg">
            <div class="editor-row">
              <div class="editor-row-item">
                ${this.makeTextInput({
                  label: 'URL',
                  configKey: `${baseConfigKey}.url` as any,
                  type: 'text',
                  placeholder: '/path/to/your/dashboard',
                })}
              </div>
            </div>

            ${this.makeTemplatable({
              inputType: 'string',
              label: 'Label',
              configKey: `${baseConfigKey}.label` as any,
              templateHelper: STRING_JS_TEMPLATE_HELPER,
            })}
            ${this.makeTemplatable({
              inputType: 'string',
              label: 'Selected color',
              configKey: `${baseConfigKey}.selected_color` as any,
              templateHelper: STRING_JS_TEMPLATE_HELPER,
            })}
            ${this.makeTemplatable({
              inputType: 'icon',
              label: 'Icon',
              configKey: `${baseConfigKey}.icon` as any,
            })}
            ${this.makeTemplatable({
              inputType: 'icon',
              label: 'Icon selected',
              configKey: `${baseConfigKey}.icon_selected` as any,
            })}
            ${this.makeTemplatable({
              inputType: 'color',
              label: 'Icon color',
              configKey: `${baseConfigKey}.icon_color` as any,
            })}
            ${this.makeTemplatable({
              inputType: 'string',
              label: 'Image',
              configKey: `${baseConfigKey}.image` as any,
              placeholder: 'URL of the image',
            })}
            ${this.makeTemplatable({
              inputType: 'string',
              label: 'Image selected',
              configKey: `${baseConfigKey}.image_selected` as any,
              placeholder: 'URL of the image',
            })}

            <div class="route-divider"></div>

            <ha-expansion-panel outlined>
              <h5 slot="header">
                <ha-icon icon="mdi:star-circle-outline"></ha-icon>
                Badge
              </h5>
              <div class="editor-section">
                ${this.makeTemplatable({
                  inputType: 'string',
                  label: 'Color',
                  configKey: `${baseConfigKey}.badge.color` as any,
                  textHelper:
                    'Color of the badge in any CSS valid format (red, #ff0000, rgba(255,0,0,1)...)',
                  templateHelper: STRING_JS_TEMPLATE_HELPER,
                })}
                ${this.makeTemplatable({
                  inputType: 'switch',
                  label: 'Show',
                  configKey: `${baseConfigKey}.badge.show` as any,
                  templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
                })}
                ${this.makeTemplatable({
                  inputType: 'string',
                  label: 'Count',
                  configKey: `${baseConfigKey}.badge.count` as any,
                  templateHelper: STRING_JS_TEMPLATE_HELPER,
                })}
                ${this.makeTemplatable({
                  inputType: 'string',
                  label: 'Text color',
                  configKey: `${baseConfigKey}.badge.text_color` as any,
                  templateHelper: STRING_JS_TEMPLATE_HELPER,
                })}
              </div>
            </ha-expansion-panel>

            ${!isPopup
              ? html`
                  <ha-expansion-panel outlined>
                    <h5 slot="header">
                      <ha-icon icon="mdi:menu"></ha-icon>
                      Popup/Submenu
                    </h5>
                    <div class="editor-section">
                      <div class="editor-tab-nav">
                        <button
                          class="editor-tab-button ${!usesTemplate
                            ? 'active'
                            : ''}"
                          @click=${() => {
                            if (!usesTemplate) return;
                            let parsedPopup = [];
                            try {
                              parsedPopup = JSON.parse(
                                cleanTemplate(
                                  (item as RouteItem).popup?.toString(),
                                ) ?? '[]',
                              );
                            } catch (_e) {
                              parsedPopup = [];
                            }

                            this.updateConfigByKey(
                              `${baseConfigKey}.popup` as any,
                              parsedPopup,
                            );
                          }}>
                          <ha-icon icon="mdi:palette"></ha-icon>
                          UI editor
                        </button>
                        <button
                          class="editor-tab-button ${usesTemplate
                            ? 'active'
                            : ''}"
                          @click=${() => {
                            if (usesTemplate) return;
                            this.updateConfigByKey(
                              `${baseConfigKey}.popup` as any,
                              wrapTemplate(
                                JSON.stringify(
                                  (item as RouteItem).popup ?? [],
                                  null,
                                  2,
                                ),
                              ),
                            );
                          }}>
                          <ha-icon icon="mdi:code-tags"></ha-icon>
                          Use template
                        </button>
                      </div>

                      ${usesTemplate
                        ? this.makeTemplateEditor({
                            label: 'Popup',
                            configKey: `${baseConfigKey}.popup` as any,
                            helper: GENERIC_JS_TEMPLATE_HELPER,
                          })
                        : html`<div class="routes-container">
                              ${((item as RouteItem).popup ?? []).map(
                                (popupItem, index) => {
                                  return this.makeDraggableRouteEditor(
                                    popupItem,
                                    routeIndex,
                                    index,
                                  );
                                },
                              )}
                            </div>
                            ${this.makeButton({
                              text: 'Add Popup item',
                              icon: 'mdi:plus',
                              onClick: () => this.addRouteOrPopup(routeIndex),
                            })}`}
                    </div>
                  </ha-expansion-panel>
                `
              : html``}

            <ha-expansion-panel outlined>
              <h5 slot="header">
                <ha-icon icon="mdi:cog"></ha-icon>
                Advanced features
              </h5>
              <div class="editor-section">
                ${this.makeTemplateEditor({
                  // TODO JLAQ maybe replace with a templateSwitchEditor
                  label: 'Hidden',
                  configKey: `${baseConfigKey}.hidden` as any,
                  helper: BOOLEAN_JS_TEMPLATE_HELPER,
                })}
                ${!isPopup
                  ? this.makeTemplateEditor({
                      // TODO JLAQ maybe replace with a templateSwitchEditor
                      label: 'Selected',
                      configKey: `${baseConfigKey}.selected` as any,
                      helper: BOOLEAN_JS_TEMPLATE_HELPER,
                    })
                  : html``}
              </div>
            </ha-expansion-panel>

            ${Object.values(HAActions).map(type => {
              const key =
                `${baseConfigKey}.${type}` as DotNotationKeys<NavbarCardConfig>;
              const actionValue = genericGetProperty(this._config, key);
              const label = this._chooseLabelForAction(type as HAActions);

              return html`
                ${actionValue != null
                  ? this.makeActionSelector({
                      actionType: type as HAActions,
                      configKey: key,
                    })
                  : html`
                      <ha-button
                        @click=${() =>
                          this.updateConfigByKey(key, {
                            action: 'none',
                          })}
                        style="margin-bottom: 1em;"
                        outlined
                        hasTrailingIcon>
                        <ha-icon slot="start" icon="mdi:plus"></ha-icon>
                        <span>Add ${label}</span>
                      </ha-button>
                    `}
              `;
            })}
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  /**********************************************************************/
  /* Editor sections */
  /**********************************************************************/

  renderTemplateEditor() {
    const availableTemplates = getNavbarTemplates();
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:bookmark-outline"></ha-icon>
          Navbar template
        </h4>
        <div class="editor-section">
          ${this.makeComboBox({
            label: 'Template',
            configKey: 'template',
            items: Object.entries(availableTemplates ?? {}).map(([key]) => ({
              label: key,
              value: key,
            })),
            helper: html`Reusable template name used for this card.
              <a
                href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#template"
                target="_blank"
                rel="noopener"
                >Check the documentation</a
              >
              for more info.`,
          })}
        </div></ha-expansion-panel
      >
    `;
  }

  renderStylesEditor() {
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:code-braces"></ha-icon>
          CSS Styles
        </h4>
        <div class="editor-section">
          <ha-alert alert-type="info" title="Custom CSS Styles">
            Use this section to change the appearance of
            <code>navbar-card</code>.<br />
            Enter your CSS code here (no <code>"styles: |"</code> prefix
            needed).<br />
            <a
              href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#styles"
              target="_blank"
              rel="noopener"
              >See documentation</a
            >
            for examples.
          </ha-alert>
          <ha-code-editor
            mode="yaml"
            autofocus
            autocomplete-entities
            autocomplete-icons
            .hass=${this.hass}
            .value=${this._config.styles}
            @value-changed=${e => {
              const trimmedStyles =
                e.target.value?.trim() == '' ? null : e.target.value;
              this.updateConfig({ styles: trimmedStyles });
            }}></ha-code-editor>
        </div>
      </ha-expansion-panel>
    `;
  }

  renderLayoutEditor() {
    const autoPaddingEnabled =
      genericGetProperty(this._config, 'layout.auto_padding.enabled') ??
      DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled;

    // TODO JLAQ Add some kind of helper / link to documentation
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:view-grid"></ha-icon>
          Layout
        </h4>
        <div class="editor-section">
          <label class="editor-label">Reflect child state</label>
          ${this.makeSwitch({
            label:
              'Display routes as selected if any of its popup items is selected',
            configKey: 'layout.reflect_child_state',
            defaultValue: DEFAULT_NAVBAR_CONFIG.layout?.reflect_child_state,
          })}
        </div>
        <div class="editor-section">
          <label class="editor-label">Auto padding</label>
          ${this.makeSwitch({
            label: 'Enable auto padding',
            configKey: 'layout.auto_padding.enabled',
            defaultValue: DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled,
          })}
          ${this.makeTextInput({
            disabled: !autoPaddingEnabled,
            label: 'Desktop padding',
            configKey: 'layout.auto_padding.desktop_px',
            type: 'number',
            suffix: 'px',
            placeholder:
              DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.desktop_px?.toString(),
            helper: 'Padding for desktop mode. 0 to disable.',
          })}
          ${this.makeTextInput({
            disabled: !autoPaddingEnabled,
            label: 'Mobile padding',
            configKey: 'layout.auto_padding.mobile_px',
            type: 'number',
            suffix: 'px',
            placeholder:
              DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.mobile_px?.toString(),
            helper: 'Padding for mobile mode. 0 to disable.',
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderHapticEditor() {
    const hapticRawValue = genericGetProperty(this._config, 'haptic');
    const hapticValue: boolean | undefined =
      typeof hapticRawValue === 'boolean' ? hapticRawValue : undefined;

    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:vibrate"></ha-icon>
          Haptic
        </h4>
        <div class="editor-section">
          ${this.makeSwitch({
            label: 'When pressing routes with URL configured',
            configKey: 'haptic.url',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label: "When executing the 'tap_action' configured for a route",
            configKey: 'haptic.tap_action',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label: "When executing the 'hold_action' configured for a route",
            configKey: 'haptic.hold_action',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label:
              "When executing the 'double_tap_action' configured for a route",
            configKey: 'haptic.double_tap_action',
            defaultValue: hapticValue,
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderMediaPlayerEditor() {
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:music"></ha-icon>
          Media player
        </h4>
        <div class="editor-section">
          ${this.makeTemplatable({
            inputType: 'entity',
            label: 'Media player entity',
            configKey: 'media_player.entity',
            includeDomains: ['media_player'],
          })}
          ${this.makeSwitch({
            label: 'Show album cover background',
            configKey: 'media_player.album_cover_background',
            defaultValue:
              DEFAULT_NAVBAR_CONFIG.media_player?.album_cover_background,
          })}
          ${this.makeTemplateEditor({
            // TODO JLAQ maybe replace with a templateSwitchEditor
            label: 'Show media player',
            configKey: 'media_player.show',
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
          })}
          ${Object.values(HAActions).map(type => {
            const key =
              `media_player.${type}` as DotNotationKeys<NavbarCardConfig>;
            const actionValue = genericGetProperty(this._config, key);
            const label = this._chooseLabelForAction(type as HAActions);

            return html`
              ${actionValue != null
                ? this.makeActionSelector({
                    actionType: type as HAActions,
                    configKey: key,
                    disabledActions: [NavbarCustomActions.openPopup],
                  })
                : html`
                    <ha-button
                      @click=${() =>
                        this.updateConfigByKey(key, {
                          action: 'none',
                        })}
                      style="margin-bottom: 1em;"
                      outlined
                      hasTrailingIcon>
                      <ha-icon slot="start" icon="mdi:plus"></ha-icon>
                      <span>Add ${label}</span>
                    </ha-button>
                  `}
            `;
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderDesktopEditor() {
    const labelVisibility =
      genericGetProperty(this._config, 'desktop.show_labels') ??
      DEFAULT_NAVBAR_CONFIG.desktop?.show_labels;

    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:laptop"></ha-icon>
          Desktop options
        </h4>
        <div class="editor-section">
          <div class="editor-row">
            <div class="editor-row-item">
              ${this.makeComboBox<DesktopPosition>({
                label: 'Position',
                items: [
                  { label: 'Top', value: DesktopPosition.top },
                  { label: 'Bottom', value: DesktopPosition.bottom },
                  { label: 'Left', value: DesktopPosition.left },
                  { label: 'Right', value: DesktopPosition.right },
                ],
                configKey: 'desktop.position',
              })}
            </div>
            <div class="editor-row-item">
              ${this.makeTextInput({
                label: 'Min width',
                configKey: 'desktop.min_width',
                type: 'number',
                suffix: 'px',
                helper: 'Min screen width for desktop mode to be active.',
              })}
            </div>
          </div>
          ${this.makeComboBox<LabelVisibilityConfig>({
            label: 'Show labels',
            items: [
              { label: 'Always', value: true },
              { label: 'Never', value: false },
              { label: 'Popup only', value: 'popup_only' },
              { label: 'Routes only', value: 'routes_only' },
            ],
            configKey: 'desktop.show_labels',
          })}
          ${this.makeSwitch({
            label: 'Show popup label backgrounds',
            configKey: 'desktop.show_popup_label_backgrounds',
            disabled: ![true, 'popup_only'].includes(labelVisibility),
            defaultValue:
              DEFAULT_NAVBAR_CONFIG.desktop?.show_popup_label_backgrounds,
          })}
          ${this.makeTemplateEditor({
            // TODO JLAQ maybe replace with a templateSwitchEditor
            label: 'Hidden',
            configKey: 'desktop.hidden',
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderMobileEditor() {
    const labelVisibility =
      genericGetProperty(this._config, 'mobile.show_labels') ??
      DEFAULT_NAVBAR_CONFIG.mobile?.show_labels;

    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:cellphone"></ha-icon>
          Mobile options
        </h4>
        <div class="editor-section">
          ${this.makeComboBox<MobileMode>({
            label: 'Mode',
            items: [
              { label: 'Floating', value: 'floating' },
              { label: 'Docked', value: 'docked' },
            ],
            configKey: 'mobile.mode',
            defaultValue: DEFAULT_NAVBAR_CONFIG.mobile?.mode,
            hideClearIcon: true,
          })}
          ${this.makeComboBox<LabelVisibilityConfig>({
            label: 'Show labels',
            items: [
              { label: 'Always', value: true },
              { label: 'Never', value: false },
              { label: 'Popup only', value: 'popup_only' },
              { label: 'Routes only', value: 'routes_only' },
            ],
            configKey: 'mobile.show_labels',
          })}
          ${this.makeSwitch({
            label: 'Show popup label backgrounds',
            configKey: 'mobile.show_popup_label_backgrounds',
            disabled: ![true, 'popup_only'].includes(labelVisibility),
            defaultValue:
              DEFAULT_NAVBAR_CONFIG.mobile?.show_popup_label_backgrounds,
          })}
          ${this.makeTemplateEditor({
            // TODO JLAQ maybe replace with a templateSwitchEditor
            label: 'Hidden',
            configKey: 'mobile.hidden',
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderRoutesEditor() {
    return html`
      <ha-expansion-panel
        outlined
        @expanded-changed=${e => {
          if (e.target.expanded) {
            this.markSectionAsLazyLoaded(LazyLoadedEditorSections.routes);
          }
        }}>
        <h4 slot="header">
          <ha-icon icon="mdi:routes"></ha-icon>
          Routes
        </h4>
        <div class="editor-section">
          ${conditionallyRender(
            this._lazyLoadedSections[LazyLoadedEditorSections.routes],
            () => html`
              <div class="routes-container">
                ${(this._config.routes ?? []).map((route, i) => {
                  return this.makeDraggableRouteEditor(route, i);
                })}
              </div>
            `,
          )}
          ${this.makeButton({
            text: 'Add Route',
            icon: 'mdi:plus',
            onClick: () => this.addRouteOrPopup(),
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  _chooseIconForAction(actionType: HAActions) {
    switch (actionType) {
      case HAActions.hold_action:
        return 'mdi:gesture-tap-hold';
      case HAActions.double_tap_action:
        return 'mdi:gesture-double-tap';
      case HAActions.tap_action:
      default:
        return 'mdi:gesture-tap';
    }
  }

  _chooseLabelForAction(actionType: HAActions) {
    switch (actionType) {
      case HAActions.tap_action:
        return 'Tap action';
      case HAActions.hold_action:
        return 'Hold action';
      case HAActions.double_tap_action:
        return 'Double tap action';
      default:
        return '';
    }
  }

  isCustomAction(value: string) {
    if (value === 'none') return false;
    return Object.values(NavbarCustomActions).includes(value as any);
  }

  makeActionSelector(options: {
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    actionType: HAActions;
    disabledActions?: (NavbarCustomActions | 'hass_action')[];
  }) {
    const ACTIONS = (
      [
        { label: 'Home Assistant action', value: 'hass_action' },
        { label: 'Open Popup', value: NavbarCustomActions.openPopup },
        { label: 'Navigate Back', value: NavbarCustomActions.navigateBack },
        { label: 'Toggle Menu', value: NavbarCustomActions.toggleMenu },
        { label: 'Quickbar', value: NavbarCustomActions.quickbar },
        { label: 'Open Edit Mode', value: NavbarCustomActions.openEditMode },
        { label: 'Logout current user', value: NavbarCustomActions.logout },
        {
          label: 'Custom JS Action',
          value: NavbarCustomActions.customJSAction,
        },
        {
          label: 'Show Notifications',
          value: NavbarCustomActions.showNotifications,
        },
      ] as {
        label: string;
        value: NavbarCustomActions | 'hass_action';
      }[]
    ).filter(action => !options.disabledActions?.includes(action.value));

    const raw = genericGetProperty(
      this._config,
      options.configKey,
    ) as ExtendedActionConfig;

    const selected: 'hass_action' | NavbarCustomActions = this.isCustomAction(
      raw?.action,
    )
      ? (raw?.action as NavbarCustomActions)
      : 'hass_action';

    return html`
      <ha-expansion-panel outlined>
        <h5 slot="header" style="display: flex; flex-direction: row">
          <div class="expansion-panel-title">
            <ha-icon
              icon="${this._chooseIconForAction(options.actionType)}"></ha-icon>
            ${this._chooseLabelForAction(options.actionType)}
          </div>
          <ha-icon-button
            .label=${`Remove ${options.actionType}`}
            class="delete-btn"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.updateConfigByKey(options.configKey, null);
            }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </h5>
        <div class="editor-section">
          <ha-combo-box
            label=${this._chooseLabelForAction(options.actionType)}
            .items=${ACTIONS}
            .value=${selected}
            .disabled=${options.disabled}
            @value-changed=${(e: CustomEvent) => {
              const newSel = e.detail.value;

              if (newSel === 'hass_action') {
                // By default, start with action: "none"
                this.updateConfigByKey(options.configKey, { action: 'none' });
              } else {
                this.updateConfigByKey(options.configKey, {
                  action: newSel,
                });
              }
            }}></ha-combo-box>

          ${selected === NavbarCustomActions.quickbar
            ? html`
                <div class="quickbar-mode-container">
                  <ha-formfield label="Devices">
                    <ha-radio
                      name="quickbar-mode"
                      value="devices"
                      label="Devices"
                      .checked=${(raw as QuickbarActionConfig)?.mode ===
                      'devices'}
                      @change=${() => {
                        this.updateConfigByKey(options.configKey, {
                          action: NavbarCustomActions.quickbar,
                          mode: 'devices',
                        });
                      }}></ha-radio>
                  </ha-formfield>
                  <ha-formfield label="Entities">
                    <ha-radio
                      name="quickbar-mode"
                      value="entities"
                      label="Entities"
                      .checked=${(raw as QuickbarActionConfig)?.mode ===
                      'entities'}
                      @change=${() => {
                        this.updateConfigByKey(options.configKey, {
                          action: NavbarCustomActions.quickbar,
                          mode: 'entities',
                        });
                      }}></ha-radio>
                  </ha-formfield>
                  <ha-formfield label="Commands">
                    <ha-radio
                      name="quickbar-mode"
                      value="commands"
                      label="Commands"
                      .checked=${(raw as QuickbarActionConfig)?.mode ===
                      'commands'}
                      @change=${() => {
                        this.updateConfigByKey(options.configKey, {
                          action: NavbarCustomActions.quickbar,
                          mode: 'commands',
                        });
                      }}></ha-radio>
                  </ha-formfield>
                </div>
              `
            : html``}
          ${selected === NavbarCustomActions.customJSAction
            ? this.makeTemplateEditor({
                label: 'Code',
                configKey: `${options.configKey}.code` as any,
                helper: GENERIC_JS_TEMPLATE_HELPER,
              })
            : html``}
          ${selected === 'hass_action'
            ? html`
                <ha-form
                  .hass=${this.hass}
                  .data=${typeof raw === 'object' ? { action: raw } : {}}
                  .schema=${[
                    {
                      name: 'action',
                      label: this._chooseLabelForAction(options.actionType),
                      required: true,
                      selector: {
                        ui_action: {
                          default_action: 'none',
                        },
                      },
                    },
                  ]}
                  @value-changed=${(ev: CustomEvent) => {
                    const formValue: any = ev.detail.value;
                    // If the form returned { action: { ... } }, unwrap it
                    const flatValue =
                      formValue.action && typeof formValue.action === 'object'
                        ? formValue.action
                        : formValue;

                    this.updateConfigByKey(
                      options.configKey,
                      flatValue.action != undefined
                        ? flatValue
                        : { action: 'none' },
                    );
                  }}></ha-form>
              `
            : html``}
          ${selected === 'hass_action' &&
          ACTIONS_WITH_CUSTOM_ENTITY.includes(raw?.action)
            ? this.makeEntityPicker({
                label: '',
                configKey: `${options.configKey}.entity` as any,
                disabled: options.disabled,
              })
            : html``}
        </div>
      </ha-expansion-panel>
    `;
  }

  /**********************************************************************/
  /* Native methods */
  /**********************************************************************/
  protected render() {
    return html`
      <div class="navbar-editor">
        ${this._config.template != undefined &&
        this._config.template?.trim() != ''
          ? html`<ha-alert alert-type="warning"
              >You have the <code>template</code> field configured for
              navbar-card. Using the editor will override the props for
              <strong>this card only</strong>, but will not update the template
              defined in your dashboard.
              <br />
              <a
                href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#template"
                target="_blank"
                rel="noopener"
                >Check the documentation</a
              >
              to know how to configure your navbar-card templates.</ha-alert
            >`
          : html``}
        ${this.renderTemplateEditor()} ${this.renderRoutesEditor()}
        ${this.renderDesktopEditor()} ${this.renderMobileEditor()}
        ${this.renderLayoutEditor()} ${this.renderMediaPlayerEditor()}
        ${this.renderHapticEditor()} ${this.renderStylesEditor()}
      </div>
    `;
  }

  static styles = getEditorStyles();

  private addRouteOrPopup = (routeIndex?: number) => {
    let routes = [...(this._config.routes ?? [])];
    const newItemData = {
      icon: 'mdi:alert-circle-outline',
      label: '',
      url: '',
    };
    if (routeIndex == null) {
      routes = [...routes, newItemData];
    } else {
      const popup = [...(routes[routeIndex].popup || []), newItemData];
      routes[routeIndex] = { ...routes[routeIndex], popup };
    }

    this.updateConfig({ routes });
  };

  private removeRouteOrPopup = (routeIndex: number, popupIndex?: number) => {
    if (!this._config.routes || this._config.routes.length == 0) return;
    const routes = [...this._config.routes];

    if (popupIndex == null) {
      routes.splice(routeIndex, 1);
    } else {
      const popup = [...(routes[routeIndex].popup || [])];
      popup.splice(popupIndex, 1);
      routes[routeIndex] = {
        ...routes[routeIndex],
        popup: popup.length === 0 ? undefined : popup,
      };
    }

    this.updateConfig({ routes: routes.length === 0 ? undefined : routes });
  };
}
