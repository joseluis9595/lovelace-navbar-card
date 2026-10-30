/** biome-ignore-all lint/suspicious/noExplicitAny: TODO - `any` keywords are used when calling `updateConfigByKey` */
import { loadHaComponents } from '@kipk/load-ha-components';
import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import {
  type RenderDropdownOptions,
  renderDropdown,
} from '@/editor/ui/renderDropdown';
import { ACTIONS_WITH_CUSTOM_ENTITY } from '@/lib/action-handler';
import {
  DEFAULT_NAVBAR_CONFIG,
  type DeepPartial,
  DesktopPosition,
  type DotNotationKeys,
  type ExtendedActionConfig,
  genericGetProperty,
  genericSetProperty,
  type LabelVisibilityConfig,
  type MediaPlayerPlayerConfig,
  type NavbarAutohideMode,
  type NavbarCardConfig,
  NavbarCustomActions,
  type NavbarDisplayMode,
  type NestedType,
  type PopupItem,
  type PopupStyle,
  type QuickbarActionConfig,
  type RouteItem,
  WidgetPosition,
} from '@/types';
import {
  cleanTemplate,
  conditionallyRender,
  deepMergeKeepArrays,
  getAvailableTemplates,
  getNavbarTemplates,
  getSharedTemplates,
  isTemplate,
  loadSharedTemplates,
  moveDashboardTemplateToShared,
  onSharedTemplatesChange,
  processTemplate,
  saveSharedTemplate,
  wrapTemplate,
} from '@/utils';
import { DOCS_LINKS, getOptionDocsLink } from '@/utils/docs-links';

import type {
  ColorInputOptions,
  FieldAction,
  TemplatableInputOptions,
} from './navbar-card-editor.types';
import { getEditorStyles } from './styles';

enum HAActions {
  tap_action = 'tap_action',
  hold_action = 'hold_action',
  double_tap_action = 'double_tap_action',
}

const GENERIC_JS_TEMPLATE_HELPER = html`Insert valid Javascript code without [[[
  ]]].
  <a
    href="${DOCS_LINKS.jsTemplate}"
    target="_blank"
    rel="noopener"
    >See documentation</a
  >
  for more info.`;

const BOOLEAN_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>boolean</strong> value`;

const STRING_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>string</strong> value`;

const ACTION_INFO: Record<HAActions, { icon: string; label: string }> = {
  [HAActions.tap_action]: { icon: 'mdi:gesture-tap', label: 'Tap action' },
  [HAActions.hold_action]: {
    icon: 'mdi:gesture-tap-hold',
    label: 'Hold action',
  },
  [HAActions.double_tap_action]: {
    icon: 'mdi:gesture-double-tap',
    label: 'Double tap action',
  },
};

// 'search' is the quickbar without a mode: Home Assistant's quick search
type QuickbarMode = NonNullable<QuickbarActionConfig['mode']> | 'search';
const QUICKBAR_MODES: { label: string; value: QuickbarMode }[] = [
  { label: 'Search', value: 'search' },
  { label: 'Entities', value: 'entities' },
  { label: 'Devices', value: 'devices' },
  { label: 'Commands', value: 'commands' },
];

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

const errorMessage = (error: unknown) =>
  (error as { message?: string })?.message ?? String(error);

/**
 * Index a dragged row would be inserted at: before the row under the pointer,
 * or after it when over its lower half
 */
const dropIndex = (e: DragEvent, rowIndex: number) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return e.clientY > rect.top + rect.height / 2 ? rowIndex + 1 : rowIndex;
};

@customElement('navbar-card-editor')
export class NavbarCardEditor extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private _config: NavbarCardConfig = { routes: [] };
  @state() private _loadingComponents: boolean = false;
  @state() private _templateModeByField: Record<string, boolean> = {};

  /** Editor of a template, shown in the template dialog of a card editor */
  @property({ attribute: false }) public isTemplateEditor = false;
  /** Shared template edited in the template dialog, with its unsaved changes */
  @state() private _templateDialog: {
    name: string;
    draft: NavbarCardConfig;
    dirty: boolean;
    /** Edited as YAML instead of with the visual editor */
    yaml?: boolean;
    invalidYaml?: boolean;
  } | null = null;
  @state() private _newTemplateName = '';
  @state() private _showSaveAsTemplate = false;
  /** Config key of the last added route, popup item, player or action, shown expanded */
  private _expandedItemKey?: string;
  /** Route or popup item shown in its own view, instead of the main view */
  @state() private _openItem: {
    routeIndex: number;
    popupIndex?: number;
  } | null = null;
  /** Device whose options are shown in the appearance section */
  @state() private _appearanceDevice: 'desktop' | 'mobile' = 'desktop';
  /**
   * Where the dragged route or popup item would be inserted. `popupOf` is the
   * route whose popup items are being reordered.
   */
  @state() private _dropTarget: { popupOf?: number; index: number } | null =
    null;
  private _draggedItem?: { popupOf?: number; index: number };
  /** Options menu of a field, shown as a popover next to its button */
  @state() private _fieldMenu: { key: string; actions: FieldAction[] } | null =
    null;
  /** Last closed field menu, so its button closes it instead of reopening it */
  private _lastClosedFieldMenu?: { key: string; time: number };
  @state() private _templateError?: string;
  @state() private _savingTemplate = false;
  private _unsubscribeSharedTemplates?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this._unsubscribeSharedTemplates = onSharedTemplatesChange(() =>
      this.requestUpdate(),
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribeSharedTemplates?.();
    this._unwatchScroll();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('hass') && this.hass) {
      loadSharedTemplates(this.hass);
    }
    // Go back to the main view if the open route or popup item is gone
    if (this._openItem) {
      const { routeIndex, popupIndex } = this._openItem;
      const route = this._config.routes?.[routeIndex];
      const exists =
        popupIndex == null
          ? !!route
          : Array.isArray(route?.popup) && !!route.popup[popupIndex];
      if (!exists) this._openItem = null;
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._templateModeByField = {};
    this._loadingComponents = true;
    loadHaComponents([
      'ha-form',
      'ha-icon',
      'ha-button',
      'ha-input',
      'ha-switch',
      'ha-expansion-panel',
      'ha-code-editor',
      'ha-alert',
      'ha-selector',
      'ha-icon-button',
    ])
      .catch(error => {
        console.warn(
          '[navbar-card] Failed to load some HA editor components',
          error,
        );
      })
      .finally(() => {
        this._loadingComponents = false;
      });
  }

  /**********************************************************************/
  /* Config mutation functions */
  /**********************************************************************/

  private _dispatchConfigChangedEvent() {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {
          config: this._config,
        },
      }),
    );
  }

  setConfig(config: NavbarCardConfig) {
    this._config = config;
  }

  updateConfig(newConfig: DeepPartial<NavbarCardConfig>) {
    this._config = deepMergeKeepArrays(this._config, newConfig);
    this._dispatchConfigChangedEvent();
  }

  // TODO change the type of "value"
  updateConfigByKey(
    key: DotNotationKeys<NavbarCardConfig>,
    value:
      | NestedType<NavbarCardConfig, DotNotationKeys<NavbarCardConfig>>
      | null
      | undefined,
  ) {
    this._config = genericSetProperty(this._config, key, value, {
      allowDeletion: true,
    });
    this._dispatchConfigChangedEvent();
  }

  private addMediaPlayer = () => {
    const players = this._config.media_player?.players ?? [];
    const newPlayer: MediaPlayerPlayerConfig = { entity: '' };
    this._expandedItemKey = `media_player.players.${players.length}`;
    this.updateConfig({
      media_player: {
        ...this._config.media_player,
        players: [...players, newPlayer],
      },
    });
  };

  private removeMediaPlayer = (playerIndex: number) => {
    const players = [...(this._config.media_player?.players ?? [])];
    players.splice(playerIndex, 1);
    this.updateConfigByKey(
      'media_player.players' as DotNotationKeys<NavbarCardConfig>,
      (players.length === 0 ? null : players) as never,
    );
  };

  private addRouteOrPopup = (routeIndex?: number) => {
    let routes = [...(this._config.routes ?? [])];
    const newItemData = {
      icon: 'mdi:alert-circle-outline',
      label: '',
      url: '',
    };
    if (routeIndex == null) {
      routes = [...routes, newItemData];
      this._expandedItemKey = `routes.${routes.length - 1}`;
    } else {
      const popup = [...(routes[routeIndex].popup || []), newItemData];
      routes[routeIndex] = { ...routes[routeIndex], popup };
      this._expandedItemKey = `routes.${routeIndex}.popup.${popup.length - 1}`;
    }

    this.updateConfig({ routes });
  };

  private removeRouteOrPopup = (routeIndex: number, popupIndex?: number) => {
    if (!this._config.routes || this._config.routes.length == 0) return;
    const routes = [...this._config.routes];

    if (popupIndex == null) {
      routes.splice(routeIndex, 1);
      if (routes.length === 0) {
        this.updateConfigByKey(
          'routes' as DotNotationKeys<NavbarCardConfig>,
          null,
        );
        return;
      }
      this.updateConfig({ routes });
      return;
    }

    const popup = [...(routes[routeIndex].popup || [])];
    popup.splice(popupIndex, 1);
    if (popup.length === 0) {
      this.updateConfigByKey(
        `routes.${routeIndex}.popup` as DotNotationKeys<NavbarCardConfig>,
        null,
      );
      return;
    }

    routes[routeIndex] = { ...routes[routeIndex], popup };
    this.updateConfig({ routes });
  };

  /**********************************************************************/
  /* Template overrides functions */
  /**********************************************************************/

  private _resetToTemplateOnly = () => {
    const type = (this._config as any).type;
    // @ts-expect-error: intentionally omitting routes to clear all overrides
    this._config = {
      ...(type != null ? { type } : {}),
      template: this._config.template,
    };
    this._dispatchConfigChangedEvent();
  };

  /**********************************************************************/
  /* Template inheritance functions */
  /**********************************************************************/

  /**
   * Config of the template used by the card, if any. Undefined while editing a
   * shared template, as the editor then shows the template itself.
   */
  private get _templateConfig(): NavbarCardConfig | undefined {
    if (this.isTemplateEditor || !this._config.template) return undefined;
    return getAvailableTemplates()[this._config.template];
  }

  /** Value shown for a key: the card's own, or the one from its template */
  private _getValue(key: DotNotationKeys<NavbarCardConfig>): any {
    const own = genericGetProperty(this._config, key);
    if (own !== undefined) return own;
    const template = this._templateConfig;
    return template ? genericGetProperty(template, key) : undefined;
  }

  /**
   * Whether the card overrides its template at this key. Items of lists
   * (routes, players) are not tracked one by one, as the card replaces the
   * whole list.
   */
  private _isOverridden(key: string): boolean {
    return (
      !!this._templateConfig &&
      key !== 'template' &&
      !/^(routes|media_player\.players)\./.test(key) &&
      genericGetProperty(this._config, key as never) !== undefined
    );
  }

  /** Number of values the card overrides under a config key */
  private _countOverrides(key: string): number {
    if (!this._templateConfig) return 0;
    const count = (value: unknown): number =>
      value != null && typeof value === 'object' && !Array.isArray(value)
        ? Object.values(value).reduce<number>((sum, v) => sum + count(v), 0)
        : value === undefined
          ? 0
          : 1;
    return count(genericGetProperty(this._config, key as never));
  }

  /** Number of values the card overrides in total */
  private _countAllOverrides(): number {
    return Object.keys(this._config)
      .filter(key => key !== 'type' && key !== 'template')
      .reduce((sum, key) => sum + this._countOverrides(key), 0);
  }

  /** Remove the card's value for a key, so it uses the template's again */
  private _resetToTemplate = (key: string) => {
    let config = genericSetProperty(this._config, key as never, null, {
      allowDeletion: true,
    });
    // Remove the parent objects left empty
    const paths = key.split('.');
    for (let i = paths.length - 1; i > 0; i--) {
      const parentKey = paths.slice(0, i).join('.') as never;
      const parent = genericGetProperty(config, parentKey);
      if (
        parent &&
        typeof parent === 'object' &&
        Object.keys(parent).length === 0
      ) {
        config = genericSetProperty(config, parentKey, null, {
          allowDeletion: true,
        });
      }
    }
    this._config = config;
    this._dispatchConfigChangedEvent();
  };

  /**
   * Shell of every field: marks values that override the template, and adds an
   * options menu (reset to the template value, JavaScript template toggle,
   * documentation). The menu button is always there, so fields keep the same
   * width and nothing moves when an option appears.
   */
  private _renderField(
    key: string | undefined,
    content: TemplateResult,
    options: { actions?: FieldAction[] } = {},
  ) {
    const overridden = !!key && this._isOverridden(key);
    const docs = key ? getOptionDocsLink(key) : undefined;
    const actions: FieldAction[] = [
      ...(overridden && key
        ? [
            {
              icon: 'mdi:undo-variant',
              label: 'Reset to template value',
              onClick: () => this._resetToTemplate(key),
            },
          ]
        : []),
      ...(options.actions ?? []),
      ...(docs
        ? [
            {
              href: docs,
              icon: 'mdi:book-open-variant',
              label: 'Documentation',
            },
          ]
        : []),
    ];
    const menuOpen = !!key && this._fieldMenu?.key === key;
    const highlighted =
      overridden || (options.actions ?? []).some(action => action.active);

    return html`<div class="field ${overridden ? 'field-overridden' : ''}">
      <div class="field-row">
        <div class="field-content">${content}</div>
        ${
          actions.length > 0
            ? html`<ha-icon-button
                class="field-menu-button ${highlighted ? 'highlighted' : ''}"
                .label=${'Field options'}
                title="Field options"
                aria-expanded=${menuOpen}
                @click=${(e: Event) => {
                  e.stopPropagation();
                  if (key) {
                    this._toggleFieldMenu(
                      key,
                      actions,
                      e.currentTarget as HTMLElement,
                    );
                  }
                }}>
                <ha-icon icon="mdi:dots-vertical"></ha-icon>
              </ha-icon-button>`
            : html`<span class="field-menu-spacer"></span>`
        }
      </div>
    </div>`;
  }

  /** Open the options menu of a field next to its button, or close it */
  private async _toggleFieldMenu(
    key: string,
    actions: FieldAction[],
    anchor: HTMLElement,
  ) {
    // Clicking the button of an open menu first dismisses it (as a click
    // outside the popover), so the click must not open it again
    const closed = this._lastClosedFieldMenu;
    if (
      this._fieldMenu?.key === key ||
      (closed?.key === key && Date.now() - closed.time < 300)
    ) {
      this._closeFieldMenu();
      return;
    }

    this._fieldMenu = { actions, key };
    await this.updateComplete;
    const menu = this._fieldMenuElement;
    if (!menu) return;
    menu.showPopover?.();
    this._positionFieldMenu(menu, anchor);
    this._watchScroll(anchor);
  }

  private get _fieldMenuElement() {
    return this.shadowRoot?.querySelector<HTMLElement>('.field-menu') ?? null;
  }

  /** Place the menu under its button, or above it when there is no room */
  private _positionFieldMenu(menu: HTMLElement, anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const { offsetHeight: height, offsetWidth: width } = menu;
    const left = Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    );
    const below = rect.bottom + 4;
    const top =
      below + height > window.innerHeight - 8
        ? Math.max(8, rect.top - height - 4)
        : below;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  private _closeFieldMenu = () => {
    this._unwatchScroll();
    const menu = this._fieldMenuElement;
    if (menu?.matches?.(':popover-open')) menu.hidePopover();
    if (this._fieldMenu) {
      this._lastClosedFieldMenu = {
        key: this._fieldMenu.key,
        time: Date.now(),
      };
    }
    this._fieldMenu = null;
  };

  /** The menu doesn't follow scrolling, so it closes instead */
  private _onScroll = () => {
    if (this._fieldMenu) this._closeFieldMenu();
  };

  private _scrollContainers: EventTarget[] = [];

  /**
   * Listen to scrolling of every container of the menu button. Scroll events
   * don't cross shadow roots, so a listener on the window would never get
   * them: the dialog of the card editor scrolls deep inside Home Assistant.
   */
  private _watchScroll(anchor: Element) {
    this._unwatchScroll();
    let node: Node | null = anchor;
    while (node) {
      if (
        node instanceof Element &&
        /auto|scroll|overlay/.test(getComputedStyle(node).overflowY)
      ) {
        this._scrollContainers.push(node);
      }
      // Walk up the rendered tree: through slots and out of shadow roots
      node =
        (node as Element).assignedSlot ??
        node.parentNode ??
        (node as ShadowRoot).host ??
        null;
    }
    this._scrollContainers.push(window);
    for (const container of this._scrollContainers) {
      container.addEventListener('scroll', this._onScroll, { passive: true });
    }
  }

  private _unwatchScroll() {
    for (const container of this._scrollContainers) {
      container.removeEventListener('scroll', this._onScroll);
    }
    this._scrollContainers = [];
  }

  /**
   * Shared options menu of the fields. It is a popover, shown in the browser
   * top layer: it is never clipped by the dialog or covered by other fields,
   * and closes on a click outside or Escape.
   */
  private _renderFieldMenu() {
    return html`<div
      popover="auto"
      class="field-menu"
      role="menu"
      @toggle=${(e: Event) => {
        if ((e as ToggleEvent).newState === 'closed' && this._fieldMenu) {
          this._closeFieldMenu();
        }
      }}>
      ${(this._fieldMenu?.actions ?? []).map(action =>
        action.href
          ? html`<a
              role="menuitem"
              class="field-menu-item"
              href=${action.href}
              target="_blank"
              rel="noopener"
              @click=${this._closeFieldMenu}>
              <ha-icon icon=${action.icon}></ha-icon>
              <span>${action.label}</span>
              <ha-icon
                class="field-menu-external"
                icon="mdi:open-in-new"></ha-icon>
            </a>`
          : html`<button
              type="button"
              role="menuitem"
              class="field-menu-item"
              @click=${() => {
                this._closeFieldMenu();
                action.onClick?.();
              }}>
              <ha-icon icon=${action.icon}></ha-icon>
              <span>${action.label}</span>
            </button>`,
      )}
    </div>`;
  }

  /**
   * List (routes, players) the card can inherit from its template. The card
   * either uses the template list as is, or replaces it with its own.
   */
  private _renderInheritableList<T>(options: {
    configKey: 'routes' | 'media_player.players';
    customizeLabel: string;
    resetLabel: string;
    editor: () => TemplateResult;
    renderItem: (item: T) => {
      icon: string;
      title: string;
      subtitle?: string;
    };
  }) {
    const key =
      options.configKey as string as DotNotationKeys<NavbarCardConfig>;
    const templateItems = this._templateConfig
      ? (genericGetProperty(this._templateConfig, key) as T[] | undefined)
      : undefined;
    if (!templateItems?.length) return options.editor();

    if (genericGetProperty(this._config, key) === undefined) {
      return html`<div class="inherited-list">
        <span class="inherited-list-hint">From the template</span>
        ${templateItems.map(item => {
          const { icon, title, subtitle } = options.renderItem(item);
          return html`<div class="inherited-item">
            <ha-icon icon=${icon}></ha-icon>
            <span class="inherited-item-title">${title}</span>
            ${
              subtitle
                ? html`<span class="inherited-item-subtitle">${subtitle}</span>`
                : html``
            }
          </div>`;
        })}
        ${this.makeButton({
          icon: 'mdi:pencil',
          onClick: () =>
            this.updateConfigByKey(
              key,
              structuredClone(templateItems) as never,
            ),
          text: options.customizeLabel,
        })}
      </div>`;
    }

    return html`<ha-alert alert-type="info" class="inherited-list-notice">
        This card uses its own list instead of the template's.
        <ha-button
          slot="action"
          size="s"
          appearance="plain"
          @click=${() => this._resetToTemplate(options.configKey)}>
          ${options.resetLabel}
        </ha-button>
      </ha-alert>
      ${options.editor()}`;
  }

  /** Expansion panel header, with the number of overrides of its section */
  private _renderSectionHeader(options: {
    icon: string;
    title: string;
    subtitle?: string;
    configKeys?: string[];
  }) {
    const overrides = (options.configKeys ?? []).reduce(
      (sum, key) => sum + this._countOverrides(key),
      0,
    );
    return html`<h4 slot="header">
      <ha-icon icon=${options.icon}></ha-icon>
      <span class="expansion-panel-title">
        ${options.title}
        ${
          options.subtitle
            ? html`<span class="expansion-panel-subtitle"
                >${options.subtitle}</span
              >`
            : html``
        }
      </span>
      ${
        overrides > 0
          ? html`<span class="override-chip">${plural(overrides, 'override')}</span>`
          : html``
      }
    </h4>`;
  }

  /**********************************************************************/
  /* Shared templates functions */
  /**********************************************************************/

  /** Whether the card uses a shared template (not one from its dashboard) */
  private _usesSharedTemplate(): boolean {
    const name = this._config.template;
    return (
      !!name && !!getSharedTemplates()?.[name] && !getNavbarTemplates()?.[name]
    );
  }

  /** Edit the shared template used by this card, in its own dialog */
  private _startEditingTemplate = () => {
    const name = this._config.template;
    const template = name ? getSharedTemplates()?.[name] : undefined;
    if (!(name && template)) return;
    this._templateError = undefined;
    this._templateDialog = {
      dirty: false,
      draft: structuredClone(template),
      name,
    };
  };

  /** Close the template dialog, asking first if it has unsaved changes */
  private _closeTemplateDialog = (force = false) => {
    if (
      !force &&
      this._templateDialog?.dirty &&
      !window.confirm('Discard your changes to this template?')
    ) {
      return;
    }
    this._templateDialog = null;
    this._templateError = undefined;
  };

  private _saveTemplateDialog = async () => {
    const dialog = this._templateDialog;
    if (!dialog) return;
    if (await this._saveTemplate(dialog.name, dialog.draft)) {
      this._closeTemplateDialog(true);
    }
  };

  /** Move the dashboard template used by this card to the shared templates */
  private _moveTemplateToShared = async () => {
    const name = this._config.template;
    if (!name) return;
    this._savingTemplate = true;
    this._templateError = undefined;
    try {
      await moveDashboardTemplateToShared(this.hass, name);
      this.requestUpdate();
    } catch (error) {
      this._templateError = `Could not move the template: ${errorMessage(error)}`;
    } finally {
      this._savingTemplate = false;
    }
  };

  /** Save this card's config (with its template merged) as a new shared template, and use it */
  private _saveAsTemplate = async () => {
    const name = this._newTemplateName.trim();
    if (!name) return;
    if (getAvailableTemplates()[name]) {
      this._templateError = `A template named "${name}" already exists.`;
      return;
    }

    const { type, template, ...cardConfig } = this
      ._config as NavbarCardConfig & {
      type?: string;
    };
    const templateConfig = template
      ? getAvailableTemplates()[template]
      : undefined;
    const config = deepMergeKeepArrays<NavbarCardConfig>(
      templateConfig ?? { routes: [] },
      cardConfig,
    );

    if (await this._saveTemplate(name, config)) {
      this._newTemplateName = '';
      this._showSaveAsTemplate = false;
      // @ts-expect-error: routes come from the template
      this._config = { ...(type != null ? { type } : {}), template: name };
      this._dispatchConfigChangedEvent();
    }
  };

  /** Save a shared template, showing the error if it fails */
  private async _saveTemplate(name: string, config: NavbarCardConfig) {
    this._savingTemplate = true;
    this._templateError = undefined;
    try {
      await saveSharedTemplate(this.hass, name, config);
      return true;
    } catch (error) {
      this._templateError = `Could not save the template: ${errorMessage(error)}`;
      return false;
    } finally {
      this._savingTemplate = false;
    }
  }

  /**********************************************************************/
  /* Template detection functions */
  /**********************************************************************/
  private _isTemplateMode(configKey: DotNotationKeys<NavbarCardConfig>) {
    const modeByField = this._templateModeByField[String(configKey)];
    if (modeByField !== undefined) return modeByField;

    return isTemplate(this._getValue(configKey));
  }

  private _setTemplateMode(
    configKey: DotNotationKeys<NavbarCardConfig>,
    isTemplate: boolean,
  ) {
    this._templateModeByField = {
      ...this._templateModeByField,
      [String(configKey)]: isTemplate,
    };
  }

  /**********************************************************************/
  /* Edition components */
  /**********************************************************************/

  makeComboBox<T>(
    options: RenderDropdownOptions<T> & { actions?: FieldAction[] },
  ) {
    return this._renderField(
      options.configKey,
      renderDropdown(
        this._getValue(options.configKey) ?? options.defaultValue ?? null,
        value => {
          this.updateConfigByKey(options.configKey, value);
        },
        // TODO: review this improper `any` typing
        options as RenderDropdownOptions<any>,
      ),
      { actions: options.actions },
    );
  }

  makeNavigationPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    helper?: string;
  }) {
    return this.makeSelector({
      configKey: options.configKey,
      disabled: options.disabled,
      helper: options.helper,
      label: options.label,
      selector: { navigation: {} },
    });
  }

  /**
   * Native HA control via `ha-selector` (preferred over raw ha-input / pickers).
   */
  makeSelector(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    selector: Record<string, unknown>;
    disabled?: boolean;
    helper?: string | TemplateResult;
    mapValue?: (value: unknown) => unknown;
    /** Override displayed value (e.g. boolean default when config key is unset). */
    value?: unknown;
    /** Options added to the field menu, like the JavaScript template toggle */
    actions?: FieldAction[];
  }) {
    const value =
      options.value !== undefined
        ? options.value
        : (this._getValue(options.configKey) ?? '');
    return this._renderField(
      options.configKey,
      html`<ha-selector
        .hass=${this.hass}
        .label=${options.label}
        .helper=${options.helper}
        .selector=${options.selector}
        .value=${value}
        .required=${false}
        .disabled=${options.disabled ?? false}
        @value-changed=${(e: CustomEvent) => {
          let next = e.detail.value;
          if (options.mapValue) {
            next = options.mapValue(next);
          }
          this.updateConfigByKey(
            options.configKey,
            next === '' || next == null ? null : (next as never),
          );
        }}></ha-selector>`,
      { actions: options.actions },
    );
  }

  makeTextInput(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    type?: 'number';
    disabled?: boolean;
    suffix?: string;
    helper?: string | TemplateResult;
    placeholder?: string;
    actions?: FieldAction[];
  }) {
    return this.makeSelector({
      actions: options.actions,
      configKey: options.configKey,
      disabled: options.disabled,
      helper: options.helper,
      label: options.label,
      mapValue:
        options.type === 'number'
          ? (value: unknown) => {
              if (value === '' || value == null) return null;
              const parsed = parseInt(String(value), 10);
              return Number.isNaN(parsed) ? null : parsed;
            }
          : undefined,
      selector: {
        text: {
          placeholder: options.placeholder,
          suffix: options.suffix,
          type: options.type ?? 'text',
        },
      },
    });
  }

  makeEntityPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    includeDomains?: string[];
    actions?: FieldAction[];
  }) {
    return this.makeSelector({
      actions: options.actions,
      configKey: options.configKey,
      disabled: options.disabled,
      label: options.label,
      selector: {
        entity: {
          filter: options.includeDomains?.length
            ? { domain: options.includeDomains }
            : undefined,
        },
      },
    });
  }

  makeIconPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    actions?: FieldAction[];
  }) {
    return this.makeSelector({
      actions: options.actions,
      configKey: options.configKey,
      disabled: options.disabled,
      label: options.label,
      selector: { icon: {} },
    });
  }

  /**
   * Home Assistant's color picker: theme colors, or any CSS color typed in.
   * Theme colors are stored as CSS variables (`var(--red-color)`), so they
   * follow the user's theme wherever the card expects a CSS color.
   */
  makeColorPicker(
    options: Omit<ColorInputOptions, 'inputType'> & { actions?: FieldAction[] },
  ) {
    const value = this._getValue(options.configKey);
    const themeColor =
      typeof value === 'string' ? value.match(/^var\(--(.+)-color\)$/) : null;
    return this.makeSelector({
      actions: options.actions,
      configKey: options.configKey,
      disabled: options.disabled,
      label: options.label,
      mapValue: color =>
        typeof color === 'string' &&
        getComputedStyle(this).getPropertyValue(`--${color}-color`)
          ? `var(--${color}-color)`
          : color,
      selector: { ui_color: {} },
      value: themeColor?.[1] ?? value ?? '',
    });
  }

  makeTemplatable(options: TemplatableInputOptions) {
    const value = this._getValue(options.configKey) as
      | string
      | null
      | undefined;
    const isTemplate = this._isTemplateMode(options.configKey);

    // Switching keeps the value, with or without the [[[ ]]] wrapper
    const toggleMode = () => {
      const source =
        typeof value === 'string' ? (cleanTemplate(value) ?? '').trim() : '';
      this._setTemplateMode(options.configKey, !isTemplate);
      this.updateConfigByKey(
        options.configKey,
        source === '' ? null : isTemplate ? source : wrapTemplate(source),
      );
    };

    const templateAction: FieldAction = {
      active: isTemplate,
      icon: isTemplate ? 'mdi:form-textbox' : 'mdi:code-braces',
      label: isTemplate ? 'Use the visual input' : 'Use a JavaScript template',
      onClick: toggleMode,
    };
    const common = {
      actions: [templateAction],
      configKey: options.configKey,
      disabled: options.disabled,
      label: options.label,
    };

    if (isTemplate) {
      return this.makeTemplateEditor({
        ...common,
        helper: options.templateHelper,
      });
    }
    switch (options.inputType) {
      case 'string':
        return this.makeTextInput({
          ...common,
          helper: 'textHelper' in options ? options.textHelper : undefined,
          placeholder:
            'placeholder' in options ? options.placeholder : undefined,
        });
      case 'icon':
        return this.makeIconPicker(common);
      case 'switch':
        return this.makeSwitch({
          ...common,
          defaultValue:
            'defaultValue' in options ? options.defaultValue : undefined,
          helper: 'helper' in options ? options.helper : undefined,
        });
      case 'entity':
        return this.makeEntityPicker({
          ...common,
          includeDomains:
            'includeDomains' in options ? options.includeDomains : undefined,
        });
      case 'color':
        return this.makeColorPicker(common);
      default:
        return html``;
    }
  }

  makeTemplateEditor(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    helper?: string | TemplateResult;
    actions?: FieldAction[];
  }) {
    return this._renderField(
      options.configKey,
      html`
      <div class="template-editor-container">
        <label class="editor-label">${options.label}</label>
        <ha-code-editor
          autocomplete-entities
          autocomplete-icons
          .hass=${this.hass}
          .value=${cleanTemplate(
            (this._getValue(options.configKey) as string) ?? '',
          )}
          @value-changed=${e => {
            this._setTemplateMode(options.configKey, true);
            const templateValue =
              e.target.value?.trim() === ''
                ? null
                : wrapTemplate(e.target.value);
            this.updateConfigByKey(options.configKey, templateValue);
          }}></ha-code-editor>
        ${
          options.helper
            ? html`<div class="template-editor-helper">${options.helper}</div>`
            : html``
        }
      </div>
    `,
      { actions: options.actions },
    );
  }

  /**
   * Compact on/off row, meant to be grouped in a `.switch-list`. The whole row
   * toggles the switch.
   */
  makeSwitch(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    helper?: string | TemplateResult;
    defaultValue?: boolean;
    actions?: FieldAction[];
  }) {
    const checked = Boolean(
      this._getValue(options.configKey) ?? options.defaultValue ?? false,
    );
    const set = (value: boolean) => {
      if (options.disabled) return;
      this.updateConfigByKey(options.configKey, value as never);
    };

    return this._renderField(
      options.configKey,
      html`<div
        class="switch-row ${options.disabled ? 'disabled' : ''}"
        @click=${(e: Event) => {
          // The switch itself reports its own change
          if (
            e
              .composedPath()
              .some(el => (el as Element).localName === 'ha-switch')
          ) {
            return;
          }
          set(!checked);
        }}>
        <span class="switch-row-text">
          <span class="switch-row-label">${options.label}</span>
          ${
            options.helper
              ? html`<span class="switch-row-helper">${options.helper}</span>`
              : html``
          }
        </span>
        <ha-switch
          .checked=${checked}
          .disabled=${options.disabled ?? false}
          aria-label=${options.label}
          @change=${(e: Event) =>
            set((e.target as HTMLInputElement).checked)}></ha-switch>
      </div>`,
      { actions: options.actions },
    );
  }

  makeButton(options: {
    onClick: (e: MouseEvent) => void;
    icon: string;
    text: string;
  }) {
    return html`<ha-button
      @click=${options.onClick}
      appearance="outlined"
      variant="brand">
      <ha-icon slot="start" icon=${options.icon}></ha-icon>
      <span>${options.text}</span>
    </ha-button>`;
  }

  /**
   * Shared drag handlers for reorderable list items (routes, players, etc.).
   */
  private _createListDragHandlers(dragData: object) {
    return {
      onDragEnd: (e: DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('dragging');
      },
      onDragLeave: (e: DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        (e.currentTarget as HTMLElement).classList.add('drag-over');
      },
      onDragStart: (e: DragEvent) => {
        e.dataTransfer?.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer!.effectAllowed = 'move';
        (e.currentTarget as HTMLElement).classList.add('dragging');
      },
    };
  }

  /**
   * Shared wrapper for draggable list items. Use for routes, players, etc.
   */
  private _renderDraggableItem(options: {
    dragData: object;
    /** Config key of the item, to expand it when just added */
    expandKey: string;
    onDrop: (e: DragEvent) => void;
    headerIcon: TemplateResult;
    headerTitle: string;
    headerSubtitle?: string;
    onDelete: () => void;
    deleteLabel: string;
    body: TemplateResult;
  }) {
    const handlers = this._createListDragHandlers(options.dragData);
    return html`
      <div
        class="draggable-item"
        @dragover=${handlers.onDragOver}
        @dragleave=${handlers.onDragLeave}
        @drop=${options.onDrop}>
        <ha-expansion-panel
          outlined
          .expanded=${this._expandedItemKey === options.expandKey}>
          <div
            slot="header"
            class="draggable-item-header"
            draggable="true"
            @dragstart=${handlers.onDragStart}
            @dragend=${handlers.onDragEnd}>
            <span class="drag-handle" title="Drag to reorder">
              <ha-icon icon="mdi:drag"></ha-icon>
            </span>
            <span class="draggable-item-header-icon">${options.headerIcon}</span>
            <div class="draggable-item-header-text">
              <span class="draggable-item-header-title"
                >${options.headerTitle}</span
              >
              ${
                options.headerSubtitle
                  ? html`<span class="draggable-item-header-subtitle"
                      >${options.headerSubtitle}</span
                    >`
                  : html``
              }
            </div>
            <ha-icon-button
              @click=${(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                options.onDelete();
              }}
              class="delete-btn"
              label=${options.deleteLabel}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
          <div class="draggable-item-editor">${options.body}</div>
        </ha-expansion-panel>
      </div>
    `;
  }

  /** Icon (or image) of a route or popup item */
  private _renderItemIcon(item: RouteItem | PopupItem) {
    if (item.image != null && !isTemplate(item.image)) {
      return html`<img src="${item.image}" class="draggable-item-header-image" />`;
    }
    const icon = isTemplate(item.icon)
      ? processTemplate<string>(this.hass, undefined, item.icon)
      : item.icon;
    return html`<ha-icon icon=${icon || 'mdi:help-circle-outline'}></ha-icon>`;
  }

  /** Label of a route or popup item, or a fallback when it has none */
  private _itemLabel(item: RouteItem | PopupItem, fallback: string) {
    const label = item.label
      ? processTemplate<string>(this.hass, undefined, item.label)
      : '';
    return label ? String(label) : fallback;
  }

  /** Tap, hold and double tap actions of a route, popup item or player */
  private _renderActions(
    baseConfigKey: string,
    types: HAActions[] = Object.values(HAActions) as HAActions[],
  ) {
    const keyFor = (type: HAActions) =>
      `${baseConfigKey}.${type}` as DotNotationKeys<NavbarCardConfig>;
    const missing = types.filter(type => this._getValue(keyFor(type)) == null);

    return html`
      ${types
        .filter(type => !missing.includes(type))
        .map(type =>
          this.makeActionSelector({
            actionType: type,
            configKey: keyFor(type),
          }),
        )}
      ${
        missing.length > 0
          ? html`<div class="add-actions">
              <span class="add-actions-label">Add action</span>
              ${missing.map(
                type => html`<ha-button
                  size="s"
                  appearance="plain"
                  @click=${() => {
                    this._expandedItemKey = keyFor(type);
                    this.updateConfigByKey(keyFor(type), {
                      action: 'none',
                    } as never);
                  }}>
                  <ha-icon
                    slot="start"
                    icon=${ACTION_INFO[type].icon}></ha-icon>
                  ${ACTION_INFO[type].label}
                </ha-button>`,
              )}
            </div>`
          : html``
      }
    `;
  }

  private isCustomAction(value: string) {
    if (value === 'none') return false;
    return Object.values(NavbarCustomActions).includes(value as any);
  }

  /**********************************************************************/
  /* Editor sections */
  /**********************************************************************/

  /** Template section: which template the card uses, and its actions */
  renderTemplateEditor() {
    const dashboardTemplates = getNavbarTemplates() ?? {};
    const name = this._config.template?.trim() || undefined;
    const overrides = this._countAllOverrides();
    const missing =
      !!name && !this._templateConfig && getSharedTemplates() !== null;
    const kind = name
      ? dashboardTemplates[name]
        ? 'From this dashboard'
        : 'Shared'
      : undefined;

    return html`
      <ha-expansion-panel outlined class="template-section">
        <h4 slot="header">
          <ha-icon icon="mdi:bookmark-outline"></ha-icon>
          <span class="expansion-panel-title">
            Template
            <span class="expansion-panel-subtitle">
              ${
                name
                  ? html`<strong>${name}</strong> · ${missing ? 'not found' : kind}${
                      overrides > 0 && this._templateConfig
                        ? ` · ${plural(overrides, 'override')} on this card`
                        : ''
                    }`
                  : 'None, this card has its own configuration'
              }
            </span>
          </span>
        </h4>
        <div class="editor-section">
          ${renderDropdown<string | null>(
            name ?? null,
            value => this.updateConfigByKey('template', value),
            {
              allowEmptyValue: true,
              configKey: 'template',
              helper: html`Reuse the same navbar in several cards. Shared
                templates work on every dashboard.
                <a href="${DOCS_LINKS.template}" target="_blank" rel="noopener"
                  >Learn more</a
                >`,
              items: Object.keys(getAvailableTemplates()).map(key => ({
                label: dashboardTemplates[key]
                  ? `${key} (this dashboard)`
                  : `${key} (shared)`,
                value: key,
              })),
              label: 'Template',
            },
          )}
          ${
            missing
              ? html`<ha-alert alert-type="warning">
                  Template "${name}" not found.
                </ha-alert>`
              : html``
          }
          ${
            name && this._templateConfig
              ? html`<span class="editor-subsection-helper">
                  ${
                    overrides > 0
                      ? `This card overrides ${plural(overrides, 'template option')}. Overridden options are marked, and can be reset one by one from their ⋮ menu.`
                      : 'This card uses the template as is. Options you change here override it for this card only.'
                  }
                </span>`
              : html``
          }
          ${
            this._showSaveAsTemplate
              ? html`<div class="template-save-as">
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{ text: {} }}
                    .label=${'Template name'}
                    .required=${false}
                    .helper=${'Saves this navbar as a shared template, used by this card from now on.'}
                    .value=${this._newTemplateName}
                    @value-changed=${(e: CustomEvent) => {
                      this._newTemplateName = e.detail.value ?? '';
                      this._templateError = undefined;
                    }}></ha-selector>
                  <div class="template-save-as-actions">
                    <ha-button
                      .disabled=${
                        !this._newTemplateName.trim() || this._savingTemplate
                      }
                      @click=${this._saveAsTemplate}>
                      Save template
                    </ha-button>
                    <ha-button
                      appearance="plain"
                      @click=${() => {
                        this._showSaveAsTemplate = false;
                        this._templateError = undefined;
                      }}>
                      Cancel
                    </ha-button>
                  </div>
                </div>`
              : html`<div class="template-actions">
                  ${
                    this._usesSharedTemplate()
                      ? html`<ha-button
                          size="s"
                          appearance="outlined"
                          @click=${this._startEditingTemplate}>
                          <ha-icon slot="start" icon="mdi:pencil"></ha-icon>
                          Edit template
                        </ha-button>`
                      : html``
                  }
                  ${
                    name && dashboardTemplates[name]
                      ? html`<ha-button
                          size="s"
                          appearance="outlined"
                          .disabled=${this._savingTemplate}
                          @click=${this._moveTemplateToShared}>
                          <ha-icon
                            slot="start"
                            icon="mdi:share-variant-outline"></ha-icon>
                          Move to shared templates
                        </ha-button>`
                      : html``
                  }
                  ${
                    overrides > 0 && this._templateConfig
                      ? html`<ha-button
                          size="s"
                          appearance="outlined"
                          @click=${this._resetToTemplateOnly}>
                          <ha-icon slot="start" icon="mdi:undo-variant"></ha-icon>
                          Reset changes
                        </ha-button>`
                      : html``
                  }
                  <ha-button
                    size="s"
                    appearance="outlined"
                    @click=${() => {
                      this._showSaveAsTemplate = true;
                    }}>
                    <ha-icon
                      slot="start"
                      icon="mdi:bookmark-plus-outline"></ha-icon>
                    Save as new shared template
                  </ha-button>
                </div>`
          }
          ${this._renderTemplateError()}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderTemplateError() {
    return this._templateError
      ? html`<ha-alert alert-type="error">${this._templateError}</ha-alert>`
      : html``;
  }

  /**
   * Dialog to edit a shared template, with its own editor and buttons. It
   * covers the card editor, so the card can't be saved by mistake while the
   * template has unsaved changes.
   */
  private _renderTemplateDialog() {
    const dialog = this._templateDialog;
    return html`<dialog
      class="template-dialog"
      @cancel=${(e: Event) => {
        // Escape behaves like the cancel button
        e.preventDefault();
        this._closeTemplateDialog();
      }}
      @keydown=${(e: KeyboardEvent) => {
        // Otherwise HA's card dialog closes on Escape too, losing the draft
        if (e.key === 'Escape') e.stopPropagation();
      }}>
      ${
        dialog
          ? html`
            <div class="template-dialog-header">
              <span class="template-dialog-title">
                Edit template "${dialog.name}"
                <span class="template-dialog-subtitle">
                  Changes apply to every navbar using it, on all dashboards.
                </span>
              </span>
              <ha-icon-button
                .label=${'Close'}
                @click=${() => this._closeTemplateDialog()}>
                <ha-icon icon="mdi:close"></ha-icon>
              </ha-icon-button>
            </div>
            <div class="template-dialog-body">
              ${
                dialog.yaml
                  ? html`<ha-yaml-editor
                      .hass=${this.hass}
                      .defaultValue=${dialog.draft}
                      @value-changed=${(e: CustomEvent) => {
                        e.stopPropagation();
                        const { value, isValid } = e.detail;
                        const valid =
                          isValid && !!value && typeof value === 'object';
                        this._templateDialog = {
                          ...dialog,
                          dirty: true,
                          draft: valid ? value : dialog.draft,
                          invalidYaml: !valid,
                        };
                      }}></ha-yaml-editor>`
                  : html`<navbar-card-editor
                      .hass=${this.hass}
                      .isTemplateEditor=${true}
                      @config-changed=${(e: CustomEvent) => {
                        e.stopPropagation();
                        this._templateDialog = {
                          ...dialog,
                          dirty: true,
                          draft: e.detail.config,
                        };
                      }}></navbar-card-editor>`
              }
            </div>
            ${this._renderTemplateError()}
            <div class="template-dialog-actions">
              <ha-button
                class="template-dialog-mode"
                appearance="plain"
                .disabled=${!!dialog.invalidYaml}
                @click=${() => {
                  this._templateDialog = { ...dialog, yaml: !dialog.yaml };
                }}>
                ${dialog.yaml ? 'Show visual editor' : 'Show code editor'}
              </ha-button>
              <ha-button
                appearance="plain"
                .disabled=${this._savingTemplate}
                @click=${() => this._closeTemplateDialog()}>
                Cancel
              </ha-button>
              <ha-button
                .disabled=${this._savingTemplate || !!dialog.invalidYaml}
                @click=${this._saveTemplateDialog}>
                Save template
              </ha-button>
            </div>
          `
          : html``
      }
    </dialog>`;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (!changedProperties.has('_templateDialog')) return;
    const dialog =
      this.shadowRoot?.querySelector<HTMLDialogElement>('.template-dialog');
    if (!dialog) return;
    const previous = changedProperties.get('_templateDialog') as
      | NavbarCardEditor['_templateDialog']
      | undefined;
    const current = this._templateDialog;
    // The visual editor starts from the draft when the dialog opens, and when
    // coming back from the code editor
    if (current && !current.yaml && (!previous || previous.yaml)) {
      dialog
        .querySelector<NavbarCardEditor>('navbar-card-editor')
        ?.setConfig(current.draft);
    }
    if (current && !dialog.open) dialog.showModal?.();
    if (!current && dialog.open) dialog.close();
  }

  /** Labelled group of fields; switches go in a compact bordered list */
  private _renderGroup(
    caption: string | null,
    content: TemplateResult,
    options: { switches?: boolean; helper?: TemplateResult | string } = {},
  ) {
    return html`<div class="group">
      ${
        caption
          ? html`<div class="group-caption">
              <span class="group-title">${caption}</span>
              ${
                options.helper
                  ? html`<span class="group-helper">${options.helper}</span>`
                  : html``
              }
            </div>`
          : html``
      }
      <div class=${options.switches ? 'switch-list' : 'group-fields'}>
        ${content}
      </div>
    </div>`;
  }

  /** Advanced section: auto padding, haptic feedback and custom CSS */
  renderAdvancedSection() {
    const autoPaddingEnabled =
      this._getValue('layout.auto_padding.enabled') ??
      DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled;
    const hapticRawValue = this._getValue('haptic');
    const hapticValue: boolean | undefined =
      typeof hapticRawValue === 'boolean' ? hapticRawValue : undefined;
    const hapticDefaults = DEFAULT_NAVBAR_CONFIG.haptic as Record<
      string,
      boolean
    >;

    return html`
      <ha-expansion-panel outlined>
        ${this._renderSectionHeader({
          configKeys: ['layout.auto_padding', 'haptic', 'styles'],
          icon: 'mdi:tune-variant',
          subtitle: 'Padding, haptic feedback and CSS',
          title: 'Advanced',
        })}
        <div class="editor-section">
          ${this._renderGroup(
            'Auto padding',
            html`
              <div class="switch-list">
                ${this.makeSwitch({
                  configKey: 'layout.auto_padding.enabled',
                  defaultValue:
                    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled,
                  label: 'Reserve space for the navbar',
                })}
              </div>
              <div class="editor-row">
                ${(
                  [
                    ['desktop_px', 'Desktop'],
                    ['mobile_px', 'Mobile'],
                    ['media_player_px', 'Media player'],
                  ] as const
                ).map(
                  ([option, label]) => html`<div class="editor-row-item">
                    ${this.makeTextInput({
                      configKey: `layout.auto_padding.${option}`,
                      disabled: !autoPaddingEnabled,
                      label,
                      placeholder:
                        DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.[
                          option
                        ]?.toString(),
                      suffix: 'px',
                      type: 'number',
                    })}
                  </div>`,
                )}
              </div>
            `,
            {
              helper:
                "Space added to the dashboard so the navbar doesn't cover it.",
            },
          )}
          ${this._renderGroup(
            'Haptic feedback',
            html`${(
              [
                ['url', 'Navigates to its URL'],
                ['tap_action', 'Runs its tap action'],
                ['hold_action', 'Runs its hold action'],
                ['double_tap_action', 'Runs its double tap action'],
              ] as const
            ).map(([option, label]) =>
              this.makeSwitch({
                configKey: `haptic.${option}`,
                defaultValue: hapticValue ?? hapticDefaults[option],
                label,
              }),
            )}`,
            {
              helper: 'Vibrate the device (where supported) when a route…',
              switches: true,
            },
          )}
          ${this._renderGroup(
            'Custom CSS',
            this._renderField(
              'styles',
              html`<ha-code-editor
                mode="yaml"
                autocomplete-entities
                autocomplete-icons
                .hass=${this.hass}
                .value=${this._getValue('styles') ?? ''}
                @value-changed=${e => {
                  const trimmedStyles =
                    e.target.value?.trim() === '' ? null : e.target.value;
                  this.updateConfig({ styles: trimmedStyles });
                }}></ha-code-editor>`,
            ),
            {
              helper: html`Change the look of the navbar, without the
                <code>styles: |</code> prefix.`,
            },
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderMediaPlayerEditor() {
    const players = this._config.media_player?.players ?? [];

    return html`
      <ha-expansion-panel outlined>
        ${this._renderSectionHeader({
          configKeys: ['media_player'],
          icon: 'mdi:music',
          subtitle: 'Players shown while media plays',
          title: 'Media player',
        })}
        <div class="editor-section">
          ${this._renderGroup(
            'Players',
            this._renderInheritableList({
              configKey: 'media_player.players',
              customizeLabel: 'Customize players for this card',
              editor: () => html`
                <div class="routes-container">
                  ${players.map((player, i) =>
                    this.makeDraggablePlayerEditor(player, i),
                  )}
                </div>
                ${this.makeButton({
                  icon: 'mdi:plus',
                  onClick: () => this.addMediaPlayer(),
                  text: 'Add player',
                })}
              `,
              renderItem: (player: MediaPlayerPlayerConfig) => {
                const entity = processTemplate<string>(
                  this.hass,
                  undefined,
                  player.entity,
                );
                return {
                  icon: 'mdi:speaker',
                  subtitle: entity,
                  title:
                    this.hass?.states?.[entity]?.attributes?.friendly_name ??
                    entity,
                };
              },
              resetLabel: 'Use template',
            }),
            {
              helper:
                'Shown while one of them is playing or paused. With several players, swipe between them.',
            },
          )}
          ${this._renderGroup(
            'Settings',
            html`
              ${this.makeComboBox<WidgetPosition>({
                configKey: 'media_player.desktop_position',
                defaultValue:
                  DEFAULT_NAVBAR_CONFIG.media_player?.desktop_position,
                helper: 'Where the player appears on desktop.',
                items: [
                  { label: 'Top left', value: WidgetPosition.topLeft },
                  { label: 'Top center', value: WidgetPosition.topCenter },
                  { label: 'Top right', value: WidgetPosition.topRight },
                  { label: 'Bottom left', value: WidgetPosition.bottomLeft },
                  {
                    label: 'Bottom center',
                    value: WidgetPosition.bottomCenter,
                  },
                  { label: 'Bottom right', value: WidgetPosition.bottomRight },
                ],
                label: 'Desktop position',
              })}
              <div class="switch-list">
                ${this.makeTemplatable({
                  configKey: 'media_player.show',
                  defaultValue: true,
                  helper:
                    'Turn off to never show it, or use a template to choose when.',
                  inputType: 'switch',
                  label: 'Show the media player',
                  templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
                })}
                ${this.makeSwitch({
                  configKey: 'media_player.album_cover_background',
                  defaultValue:
                    DEFAULT_NAVBAR_CONFIG.media_player?.album_cover_background,
                  helper:
                    'Shows the cover of what is playing behind the player.',
                  label: 'Album art as background',
                })}
              </div>
            `,
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  makeDraggablePlayerEditor(
    player: MediaPlayerPlayerConfig,
    playerIndex: number,
  ) {
    const baseConfigKey = `media_player.players.${playerIndex}`;
    const entity = processTemplate<string>(this.hass, undefined, player.entity);

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      const dragData = JSON.parse(
        e.dataTransfer?.getData('application/json') || '{}',
      );
      const fromIndex = dragData.playerIndex;
      if (typeof fromIndex !== 'number' || fromIndex === playerIndex) return;
      const players = [...(this._config.media_player?.players ?? [])];
      const [moved] = players.splice(fromIndex, 1);
      players.splice(playerIndex, 0, moved);
      this.updateConfig({
        media_player: {
          ...this._config.media_player,
          players,
        },
      });
    };

    return this._renderDraggableItem({
      body: html`
          ${this.makeTemplatable({
            configKey:
              `${baseConfigKey}.entity` as DotNotationKeys<NavbarCardConfig>,
            includeDomains: ['media_player'],
            inputType: 'entity',
            label: 'Media player entity',
          })}
          ${this.makeTemplateEditor({
            configKey:
              `${baseConfigKey}.show` as DotNotationKeys<NavbarCardConfig>,
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
            label: 'Show',
          })}
          ${this.makeTemplatable({
            configKey:
              `${baseConfigKey}.icon` as DotNotationKeys<NavbarCardConfig>,
            inputType: 'icon',
            label: 'Icon',
            templateHelper: STRING_JS_TEMPLATE_HELPER,
          })}
          ${this.makeTemplatable({
            configKey:
              `${baseConfigKey}.title` as DotNotationKeys<NavbarCardConfig>,
            inputType: 'string',
            label: 'Title',
            templateHelper: STRING_JS_TEMPLATE_HELPER,
          })}
          ${this.makeTemplatable({
            configKey:
              `${baseConfigKey}.subtitle` as DotNotationKeys<NavbarCardConfig>,
            inputType: 'string',
            label: 'Subtitle',
            templateHelper: STRING_JS_TEMPLATE_HELPER,
          })}
          ${this._renderActions(baseConfigKey)}
      `,
      deleteLabel: 'Delete player',
      dragData: { playerIndex },
      expandKey: baseConfigKey,
      headerIcon: html`<ha-icon
        icon=${
          (player.icon && !isTemplate(player.icon) ? player.icon : null) ??
          'mdi:speaker'
        }></ha-icon>`,
      headerSubtitle: entity || undefined,
      headerTitle:
        (entity && this.hass?.states?.[entity]?.attributes?.friendly_name) ||
        entity ||
        'No entity selected',
      onDelete: () => this.removeMediaPlayer(playerIndex),
      onDrop,
    });
  }

  /** Appearance section: desktop and mobile options, one device at a time */
  renderAppearanceSection() {
    const device = this._appearanceDevice;
    const labelVisibility =
      this._getValue(`${device}.show_labels`) ??
      DEFAULT_NAVBAR_CONFIG[device]?.show_labels;

    return html`
      <ha-expansion-panel outlined>
        ${this._renderSectionHeader({
          configKeys: ['desktop', 'mobile'],
          icon: 'mdi:palette-outline',
          subtitle: 'Position, labels and visibility',
          title: 'Appearance',
        })}
        <div class="editor-section">
          ${this._renderSegmented<'desktop' | 'mobile'>({
            onChange: value => {
              this._appearanceDevice = value;
            },
            options: [
              {
                badge: this._countOverrides('desktop'),
                icon: 'mdi:laptop',
                label: 'Desktop',
                value: 'desktop',
              },
              {
                badge: this._countOverrides('mobile'),
                icon: 'mdi:cellphone',
                label: 'Mobile',
                value: 'mobile',
              },
            ],
            value: device,
          })}
          ${this._renderGroup(
            'Layout',
            html`
              ${this.makeComboBox<NavbarDisplayMode>({
                configKey: `${device}.mode`,
                defaultValue: DEFAULT_NAVBAR_CONFIG[device]?.mode,
                items: [
                  { label: 'Floating', value: 'floating' },
                  { label: 'Docked', value: 'docked' },
                ],
                label: 'Style',
              })}
              ${
                device === 'desktop'
                  ? html`<div class="editor-row">
                      <div class="editor-row-item">
                        ${this.makeComboBox<DesktopPosition>({
                          configKey: 'desktop.position',
                          defaultValue: DEFAULT_NAVBAR_CONFIG.desktop?.position,
                          items: [
                            { label: 'Top', value: DesktopPosition.top },
                            { label: 'Bottom', value: DesktopPosition.bottom },
                            { label: 'Left', value: DesktopPosition.left },
                            { label: 'Right', value: DesktopPosition.right },
                          ],
                          label: 'Position',
                        })}
                      </div>
                      <div class="editor-row-item">
                        ${this.makeTextInput({
                          configKey: 'desktop.min_width',
                          helper: 'Desktop layout from this screen width.',
                          label: 'Min width',
                          placeholder:
                            DEFAULT_NAVBAR_CONFIG.desktop?.min_width?.toString(),
                          suffix: 'px',
                          type: 'number',
                        })}
                      </div>
                    </div>`
                  : html`<div class="switch-list">
                        ${this.makeSwitch({
                          configKey: 'mobile.safe_area',
                          defaultValue: DEFAULT_NAVBAR_CONFIG.mobile?.safe_area,
                          helper:
                            'Keeps the navbar clear of the notch and home bar.',
                          label: 'Respect the safe area',
                        })}
                        ${this.makeSwitch({
                          configKey: 'mobile.scrollable',
                          defaultValue:
                            DEFAULT_NAVBAR_CONFIG.mobile?.scrollable,
                          helper:
                            'Routes keep their width and the bar scrolls sideways.',
                          label: 'Scroll sideways',
                        })}
                      </div>
                      ${this.makeComboBox<NavbarAutohideMode | false>({
                        configKey: 'mobile.autohide',
                        defaultValue: DEFAULT_NAVBAR_CONFIG.mobile?.autohide,
                        helper:
                          'Gets the navbar out of the way of the content.',
                        items: [
                          { label: 'Off', value: false },
                          { label: 'Slide away on scroll', value: 'slide' },
                          { label: 'Minimize on scroll', value: 'minimize' },
                          { label: 'Arrow toggle', value: 'toggle' },
                        ],
                        label: 'Auto-hide',
                      })}`
              }
            `,
          )}
          ${this._renderGroup(
            'Labels',
            html`
              ${this.makeComboBox<LabelVisibilityConfig>({
                configKey: `${device}.show_labels`,
                defaultValue: DEFAULT_NAVBAR_CONFIG[device]?.show_labels,
                items: [
                  { label: 'Always', value: true },
                  { label: 'Never', value: false },
                  { label: 'In popups only', value: 'popup_only' },
                  { label: 'In routes only', value: 'routes_only' },
                ],
                label: 'Show labels',
              })}
              ${
                [true, 'popup_only'].includes(labelVisibility)
                  ? html`<div class="switch-list">
                      ${this.makeSwitch({
                        configKey: `${device}.show_popup_label_backgrounds`,
                        defaultValue:
                          DEFAULT_NAVBAR_CONFIG[device]
                            ?.show_popup_label_backgrounds,
                        label: 'Background behind popup labels',
                      })}
                    </div>`
                  : html``
              }
            `,
          )}
          ${this._renderGroup(
            'Visibility',
            this.makeTemplatable({
              configKey: `${device}.hidden`,
              inputType: 'switch',
              label:
                device === 'desktop' ? 'Hide on desktop' : 'Hide on mobile',
              templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
            }),
            { switches: true },
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  /** Segmented control, for a small set of exclusive options */
  private _renderSegmented<T extends string>(options: {
    value: T;
    options: { value: T; label: string; icon?: string; badge?: number }[];
    onChange: (value: T) => void;
  }) {
    return html`<div class="segmented" role="radiogroup">
      ${options.options.map(
        option => html`<button
          type="button"
          role="radio"
          aria-checked=${option.value === options.value}
          class="segmented-option ${option.value === options.value ? 'active' : ''}"
          @click=${() => options.onChange(option.value)}>
          ${option.icon ? html`<ha-icon icon=${option.icon}></ha-icon>` : html``}
          ${option.label}
          ${
            option.badge
              ? html`<span class="segmented-badge">${option.badge}</span>`
              : html``
          }
        </button>`,
      )}
    </div>`;
  }

  /** Routes section: one row per route, opened in its own view */
  renderRoutesSection() {
    return html`
      <ha-expansion-panel outlined expanded>
        ${this._renderSectionHeader({
          configKeys: [
            'routes',
            'layout.reflect_child_state',
            'layout.popup_style',
          ],
          icon: 'mdi:routes',
          title: 'Routes',
        })}
        <div class="editor-section">
          ${this._renderInheritableList({
            configKey: 'routes',
            customizeLabel: 'Customize routes for this card',
            editor: () => html`
              <div class="item-list">
                ${(this._config.routes ?? []).map((route, i) =>
                  this._renderItemRow(route, i),
                )}
              </div>
              ${this.makeButton({
                icon: 'mdi:plus',
                onClick: () => {
                  this.addRouteOrPopup();
                  this._openItem = {
                    routeIndex: this._config.routes.length - 1,
                  };
                },
                text: 'Add route',
              })}
            `,
            renderItem: (route: RouteItem) => ({
              icon:
                route.image != null
                  ? 'mdi:image'
                  : (processTemplate<string>(
                      this.hass,
                      undefined,
                      route.icon,
                    ) ?? 'mdi:help-circle-outline'),
              subtitle: this._itemSummary(route),
              title: this._itemLabel(route, 'Route'),
            }),
            resetLabel: 'Use template',
          })}
          <div class="switch-list">
            ${this.makeSwitch({
              configKey: 'layout.reflect_child_state',
              defaultValue: DEFAULT_NAVBAR_CONFIG.layout?.reflect_child_state,
              helper: 'When one of its popup items is selected.',
              label: 'Show routes as selected',
            })}
          </div>
          ${this.makeComboBox<PopupStyle>({
            configKey: 'layout.popup_style',
            defaultValue: DEFAULT_NAVBAR_CONFIG.layout?.popup_style,
            helper: 'How popup items are laid out when a popup opens.',
            items: [
              { label: 'Bubbles', value: 'bubbles' },
              { label: 'Panel', value: 'panel' },
            ],
            label: 'Popup style',
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  /** Short description of what a route or popup item does when tapped */
  private _itemSummary(item: RouteItem | PopupItem): string | undefined {
    switch (this._tapMode(item)) {
      case 'popup': {
        const popup = (item as RouteItem).popup;
        if (isTemplate(popup)) return 'Popup from a template';
        const count = Array.isArray(popup) ? popup.length : 0;
        return `Popup · ${plural(count, 'item')}`;
      }
      case 'action': {
        const action = item.tap_action?.action;
        return action ? `Action · ${action.replace(/[-_]/g, ' ')}` : 'Action';
      }
      default:
        return typeof item.url === 'string' ? item.url : undefined;
    }
  }

  /** Compact, draggable row of a route or popup item, opening its view */
  private _renderItemRow(
    item: RouteItem | PopupItem,
    routeIndex: number,
    popupIndex?: number,
  ) {
    const popupOf = popupIndex == null ? undefined : routeIndex;
    const index = popupIndex ?? routeIndex;
    const listLength =
      popupOf == null
        ? this._config.routes.length
        : (this._config.routes[popupOf].popup as PopupItem[]).length;
    const drop = this._dropTarget;
    const target = drop && drop.popupOf === popupOf ? drop.index : null;
    const open = () => {
      this._openItem = { popupIndex, routeIndex };
    };

    return html`<div
      class="item-row ${target === index ? 'drop-before' : ''} ${
        target === listLength && index === listLength - 1 ? 'drop-after' : ''
      }"
      role="button"
      tabindex="0"
      @click=${open}
      @keydown=${(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      @dragover=${(e: DragEvent) => {
        // Only reorder within the list the item comes from
        if (!this._draggedItem || this._draggedItem.popupOf !== popupOf) {
          return;
        }
        e.preventDefault();
        const next = dropIndex(e, index);
        if (this._dropTarget?.index !== next) {
          this._dropTarget = { index: next, popupOf };
        }
      }}
      @drop=${(e: DragEvent) => {
        e.preventDefault();
        this._moveDraggedItem();
      }}>
      <span
        class="drag-handle"
        title="Drag to reorder"
        draggable="true"
        @click=${(e: Event) => e.stopPropagation()}
        @dragstart=${(e: DragEvent) => {
          if (e.dataTransfer) {
            // Firefox only starts dragging with some data set
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
          }
          this._draggedItem = { index, popupOf };
        }}
        @dragend=${() => {
          this._draggedItem = undefined;
          this._dropTarget = null;
        }}>
        <ha-icon icon="mdi:drag"></ha-icon>
      </span>
      <span class="item-row-icon">${this._renderItemIcon(item)}</span>
      <span class="item-row-text">
        <span class="item-row-title"
          >${this._itemLabel(item, popupIndex == null ? 'Route' : 'Popup item')}</span
        >
        <span class="item-row-subtitle">${this._itemSummary(item) ?? ''}</span>
      </span>
      <ha-icon class="item-row-chevron" icon="mdi:chevron-right"></ha-icon>
    </div>`;
  }

  /** Move the dragged route or popup item to where the drop line is */
  private _moveDraggedItem() {
    const from = this._draggedItem;
    const target = this._dropTarget;
    this._draggedItem = undefined;
    this._dropTarget = null;
    if (!(from && target) || from.popupOf !== target.popupOf) return;

    const move = <T>(list: T[]) => {
      // Taking the item out first moves the following ones up by one
      const to = from.index < target.index ? target.index - 1 : target.index;
      const [moved] = list.splice(from.index, 1);
      list.splice(to, 0, moved);
      return list;
    };

    const routes = [...this._config.routes];
    if (target.popupOf == null) {
      this.updateConfig({ routes: move(routes) });
    } else {
      const route = routes[target.popupOf];
      routes[target.popupOf] = {
        ...route,
        popup: move([...(route.popup as PopupItem[])]),
      };
      this.updateConfig({ routes });
    }
  }

  /** What a route or popup item does when tapped */
  private _tapMode(
    item: RouteItem | PopupItem,
  ): 'navigate' | 'popup' | 'action' {
    const action = item.tap_action?.action;
    if (action === NavbarCustomActions.openPopup) return 'popup';
    return action ? 'action' : 'navigate';
  }

  /**
   * Change what a route or popup item does when tapped. Only the tap action
   * changes, so its URL and popup items are kept when switching back.
   */
  private _setTapMode(
    baseConfigKey: string,
    item: RouteItem | PopupItem,
    mode: 'navigate' | 'popup' | 'action',
  ) {
    const tapKey =
      `${baseConfigKey}.tap_action` as DotNotationKeys<NavbarCardConfig>;
    if (mode === 'navigate') {
      this.updateConfigByKey(tapKey, null);
    } else if (mode === 'popup') {
      this._config = genericSetProperty(
        this._config,
        `${baseConfigKey}.popup` as never,
        ((item as RouteItem).popup ?? []) as never,
      );
      this.updateConfigByKey(tapKey, {
        action: NavbarCustomActions.openPopup,
      } as never);
    } else {
      this.updateConfigByKey(tapKey, { action: 'none' } as never);
    }
  }

  /** View of a single route or popup item, replacing the main view */
  renderItemView() {
    const { routeIndex, popupIndex } = this._openItem ?? {};
    const route = routeIndex != null ? this._config.routes?.[routeIndex] : null;
    const item =
      popupIndex != null
        ? ((route?.popup as PopupItem[] | undefined)?.[popupIndex] ?? null)
        : route;
    if (routeIndex == null || !item) return html``;

    const isPopup = popupIndex != null;
    const baseConfigKey = isPopup
      ? `routes.${routeIndex}.popup.${popupIndex}`
      : `routes.${routeIndex}`;
    const key = (field: string) =>
      `${baseConfigKey}.${field}` as DotNotationKeys<NavbarCardConfig>;
    const mode = this._tapMode(item);
    const goBack = () => {
      this._openItem = isPopup ? { routeIndex } : null;
    };

    return html`
      <div class="item-view">
        <div class="item-view-header">
          <ha-icon-button .label=${'Back'} @click=${goBack}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </ha-icon-button>
          <span class="item-view-title">
            ${this._itemLabel(item, isPopup ? 'Popup item' : 'Route')}
            <span class="item-view-subtitle">
              ${
                isPopup
                  ? `Popup item of ${this._itemLabel(route as RouteItem, 'route')}`
                  : `Route ${routeIndex + 1}`
              }
            </span>
          </span>
          <ha-icon-button
            class="delete-btn"
            .label=${isPopup ? 'Delete popup item' : 'Delete route'}
            title=${isPopup ? 'Delete popup item' : 'Delete route'}
            @click=${() => {
              goBack();
              this.removeRouteOrPopup(routeIndex, popupIndex);
            }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>

        <div class="editor-section">
          <div class="editor-row">
            <div class="editor-row-item">
              ${this.makeTemplatable({
                configKey: key('icon'),
                inputType: 'icon',
                label: 'Icon',
                templateHelper: STRING_JS_TEMPLATE_HELPER,
              })}
            </div>
            <div class="editor-row-item">
              ${this.makeTemplatable({
                configKey: key('label'),
                inputType: 'string',
                label: 'Label',
                templateHelper: STRING_JS_TEMPLATE_HELPER,
              })}
            </div>
          </div>

          ${this._renderGroup(
            'When tapped',
            html`
              ${this._renderSegmented<'navigate' | 'popup' | 'action'>({
                onChange: value => this._setTapMode(baseConfigKey, item, value),
                options: [
                  {
                    icon: 'mdi:link-variant',
                    label: 'Navigate',
                    value: 'navigate',
                  },
                  ...(isPopup
                    ? []
                    : [
                        {
                          icon: 'mdi:menu',
                          label: 'Open popup',
                          value: 'popup' as const,
                        },
                      ]),
                  { icon: 'mdi:gesture-tap', label: 'Action', value: 'action' },
                ],
                value: mode,
              })}
              ${
                mode === 'navigate'
                  ? this.makeNavigationPicker({
                      configKey: key('url'),
                      label: 'Page',
                    })
                  : mode === 'popup'
                    ? this._renderPopupItems(route as RouteItem, routeIndex)
                    : this.makeActionSelector({
                        actionType: HAActions.tap_action,
                        configKey: key('tap_action'),
                        disabledActions: [NavbarCustomActions.openPopup],
                        inline: true,
                      })
              }
            `,
          )}

          <ha-expansion-panel outlined>
            ${this._renderSubsectionHeader(
              'mdi:star-circle-outline',
              'Badge',
              item.badge ? 'On' : 'Off',
            )}
            <div class="editor-section">
              ${this._renderGroup(
                null,
                this.makeTemplatable({
                  configKey: key('badge.show'),
                  helper: 'A small dot, count or icon on the route.',
                  inputType: 'switch',
                  label: 'Show a badge',
                  templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
                }),
                { switches: true },
              )}
              ${this._renderGroup(
                'Content',
                html`<div class="editor-row">
                  <div class="editor-row-item">
                    ${this.makeTemplatable({
                      configKey: key('badge.count'),
                      inputType: 'string',
                      label: 'Count or text',
                      templateHelper: STRING_JS_TEMPLATE_HELPER,
                    })}
                  </div>
                  <div class="editor-row-item">
                    ${this.makeTemplatable({
                      configKey: key('badge.icon'),
                      inputType: 'icon',
                      label: 'Icon',
                      templateHelper: STRING_JS_TEMPLATE_HELPER,
                    })}
                  </div>
                </div>`,
                { helper: 'Leave both empty for a plain dot.' },
              )}
              ${this._renderGroup(
                'Colors',
                html`
                  ${this.makeTemplatable({
                    configKey: key('badge.color'),
                    inputType: 'color',
                    label: 'Background',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                  })}
                  ${this.makeTemplatable({
                    configKey: key('badge.text_color'),
                    inputType: 'color',
                    label: 'Count or text',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                  })}
                  ${this.makeTemplatable({
                    configKey: key('badge.icon_color'),
                    inputType: 'color',
                    label: 'Icon',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                  })}
                `,
                {
                  helper:
                    'Optional. The badge is red by default, and its count, text and icon turn black or white to stay readable on any background.',
                },
              )}
            </div>
          </ha-expansion-panel>

          <ha-expansion-panel outlined>
            ${this._renderSubsectionHeader(
              'mdi:dots-horizontal',
              'More options',
              'Look, selected state, hold',
            )}
            <div class="editor-section">
              ${this._renderGroup(
                'Look',
                html`
                  ${this.makeTemplatable({
                    configKey: key('icon_color'),
                    inputType: 'color',
                    label: 'Icon color',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                  })}
                  ${this.makeTemplatable({
                    configKey: key('image'),
                    inputType: 'string',
                    label: 'Image',
                    placeholder: '/local/image.png',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                    textHelper: 'Shown instead of the icon.',
                  })}
                `,
              )}
              ${this._renderGroup(
                'When selected',
                html`
                  ${
                    mode === 'navigate'
                      ? html``
                      : this.makeNavigationPicker({
                          configKey: key('url'),
                          helper: 'Selected while on this page.',
                          label: 'Page',
                        })
                  }
                  <div class="editor-row">
                    <div class="editor-row-item">
                      ${this.makeTemplatable({
                        configKey: key('icon_selected'),
                        inputType: 'icon',
                        label: 'Icon',
                        templateHelper: STRING_JS_TEMPLATE_HELPER,
                      })}
                    </div>
                    <div class="editor-row-item">
                      ${this.makeTemplatable({
                        configKey: key('image_selected'),
                        inputType: 'string',
                        label: 'Image',
                        placeholder: '/local/image.png',
                        templateHelper: STRING_JS_TEMPLATE_HELPER,
                      })}
                    </div>
                  </div>
                  ${this.makeTemplatable({
                    configKey: key('selected_color'),
                    inputType: 'color',
                    label: 'Color',
                    templateHelper: STRING_JS_TEMPLATE_HELPER,
                  })}
                  ${
                    isPopup
                      ? html``
                      : html`<div class="switch-list">
                          ${this.makeTemplatable({
                            configKey: key('selected'),
                            helper: 'Instead of following the current page.',
                            inputType: 'switch',
                            label: 'Always selected',
                            templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
                          })}
                        </div>`
                  }
                `,
                { helper: 'While on its page, or when always selected.' },
              )}
              ${this._renderGroup(
                'Visibility',
                this.makeTemplatable({
                  configKey: key('hidden'),
                  inputType: 'switch',
                  label: 'Hide',
                  templateHelper: BOOLEAN_JS_TEMPLATE_HELPER,
                }),
                { switches: true },
              )}
              ${this._renderGroup(
                'Other gestures',
                this._renderActions(baseConfigKey, [
                  HAActions.hold_action,
                  HAActions.double_tap_action,
                ]),
              )}
            </div>
          </ha-expansion-panel>
        </div>
      </div>
    `;
  }

  /** Popup items of a route, or its popup JavaScript template */
  private _renderPopupItems(route: RouteItem, routeIndex: number) {
    const popupKey =
      `routes.${routeIndex}.popup` as DotNotationKeys<NavbarCardConfig>;
    const usesTemplate = isTemplate(route.popup);
    const toggleLabel = usesTemplate
      ? 'Use the visual editor'
      : 'Use a JavaScript template';

    return html`<div class="popup-items">
      <div class="popup-items-header">
        <span class="editor-label">Popup items</span>
        <ha-icon-button
          class="templatable-field-toggle ${usesTemplate ? 'active' : ''}"
          .label=${toggleLabel}
          title=${toggleLabel}
          @click=${() => {
            if (usesTemplate) {
              let parsed: PopupItem[] = [];
              try {
                parsed = JSON.parse(
                  cleanTemplate(route.popup?.toString()) ?? '[]',
                );
              } catch (_e) {
                parsed = [];
              }
              this.updateConfigByKey(popupKey, parsed as never);
            } else {
              this.updateConfigByKey(
                popupKey,
                wrapTemplate(
                  JSON.stringify(route.popup ?? [], null, 2),
                ) as never,
              );
            }
          }}>
          <ha-icon
            icon=${usesTemplate ? 'mdi:form-textbox' : 'mdi:code-braces'}></ha-icon>
        </ha-icon-button>
      </div>
      ${
        usesTemplate
          ? this.makeTemplateEditor({
              configKey: popupKey,
              helper: GENERIC_JS_TEMPLATE_HELPER,
              label: 'Popup',
            })
          : html`<div class="item-list">
                ${((route.popup as PopupItem[] | undefined) ?? []).map(
                  (popupItem, index) =>
                    this._renderItemRow(popupItem, routeIndex, index),
                )}
              </div>
              ${this.makeButton({
                icon: 'mdi:plus',
                onClick: () => {
                  this.addRouteOrPopup(routeIndex);
                  const popup = this._config.routes[routeIndex].popup;
                  this._openItem = {
                    popupIndex: (popup as PopupItem[]).length - 1,
                    routeIndex,
                  };
                },
                text: 'Add popup item',
              })}`
      }
    </div>`;
  }

  /** Header of a panel nested in a section, with a short summary */
  private _renderSubsectionHeader(
    icon: string,
    title: string,
    summary: string,
  ) {
    return html`<h5 slot="header">
      <ha-icon icon=${icon}></ha-icon>
      <span class="expansion-panel-title">${title}</span>
      <span class="expansion-panel-summary">${summary}</span>
    </h5>`;
  }

  makeActionSelector(options: {
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    actionType: HAActions;
    disabledActions?: (NavbarCustomActions | 'hass_action')[];
    /** Render the fields only, without the collapsible panel */
    inline?: boolean;
  }) {
    const ACTIONS = (
      [
        { label: 'Home Assistant action', value: 'hass_action' },
        { label: 'Open popup', value: NavbarCustomActions.openPopup },
        { label: 'Navigate back', value: NavbarCustomActions.navigateBack },
        { label: 'Toggle sidebar', value: NavbarCustomActions.toggleMenu },
        { label: 'Open quick bar', value: NavbarCustomActions.quickbar },
        {
          label: 'Edit dashboard',
          value: NavbarCustomActions.openEditMode,
        },
        { label: 'Log out', value: NavbarCustomActions.logout },
        {
          label: 'Run JavaScript',
          value: NavbarCustomActions.customJSAction,
        },
        {
          label: 'Show notifications',
          value: NavbarCustomActions.showNotifications,
        },
      ] as {
        label: string;
        value: NavbarCustomActions | 'hass_action';
      }[]
    ).filter(action => !options.disabledActions?.includes(action.value));

    const raw = this._getValue(options.configKey) as ExtendedActionConfig;

    const selected: 'hass_action' | NavbarCustomActions = this.isCustomAction(
      raw?.action,
    )
      ? (raw?.action as NavbarCustomActions)
      : 'hass_action';

    const body = html`
          ${renderDropdown<'hass_action' | NavbarCustomActions>(
            selected,
            newSel => {
              if (!newSel || newSel === selected) return;
              // Home Assistant actions start with action: "none"
              this.updateConfigByKey(options.configKey, {
                action: newSel === 'hass_action' ? 'none' : newSel,
              } as never);
            },
            {
              configKey: options.configKey,
              disabled: options.disabled,
              items: ACTIONS,
              label: 'Action type',
            },
          )}

          ${
            selected === NavbarCustomActions.quickbar
              ? html`
                ${this._renderSegmented<QuickbarMode>({
                  onChange: mode => {
                    this.updateConfigByKey(options.configKey, {
                      action: NavbarCustomActions.quickbar,
                      ...(mode === 'search' ? {} : { mode }),
                    } as never);
                  },
                  options: QUICKBAR_MODES,
                  value: (raw as QuickbarActionConfig)?.mode ?? 'search',
                })}
              `
              : html``
          }
          ${
            selected === NavbarCustomActions.customJSAction
              ? this.makeTemplateEditor({
                  configKey: `${options.configKey}.code` as any,
                  helper: GENERIC_JS_TEMPLATE_HELPER,
                  label: 'Code',
                })
              : html``
          }
          ${
            selected === 'hass_action'
              ? html`
                <ha-form
                  .hass=${this.hass}
                  .data=${typeof raw === 'object' ? { action: raw } : {}}
                  .schema=${[
                    {
                      label: ACTION_INFO[options.actionType].label,
                      name: 'action',
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
              : html``
          }
          ${
            selected === 'hass_action' &&
            ACTIONS_WITH_CUSTOM_ENTITY.includes(raw?.action)
              ? this.makeEntityPicker({
                  configKey: `${options.configKey}.entity` as any,
                  disabled: options.disabled,
                  label: '',
                })
              : html``
          }
`;

    if (options.inline) return html`<div class="action-inline">${body}</div>`;

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${this._expandedItemKey === options.configKey}>
        <h5 slot="header" style="display: flex; flex-direction: row">
          <div class="expansion-panel-title">
            <ha-icon
              icon=${ACTION_INFO[options.actionType].icon}></ha-icon>
            ${ACTION_INFO[options.actionType].label}
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
        <div class="editor-section">${body}</div>
      </ha-expansion-panel>
    `;
  }

  /**********************************************************************/
  /* Native methods */
  /**********************************************************************/
  protected render() {
    return html`
    ${conditionallyRender(
      !this._loadingComponents,
      () => html`
      <div class="navbar-editor">
        ${
          this._openItem
            ? this.renderItemView()
            : html`
              ${this.isTemplateEditor ? html`` : this.renderTemplateEditor()}
              ${this.renderRoutesSection()}
              ${this.renderAppearanceSection()}
              ${this.renderMediaPlayerEditor()}
              ${this.renderAdvancedSection()}
            `
        }
      </div>
      ${this._renderFieldMenu()} ${this._renderTemplateDialog()}
    `,
    )}`;
  }

  static styles = getEditorStyles();
}
