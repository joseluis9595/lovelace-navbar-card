import {
  css,
  CSSResult,
  html,
  LitElement,
  TemplateResult,
  unsafeCSS,
} from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant, navigate } from 'custom-card-helpers';
import {
  DesktopPosition,
  NavbarCardConfig,
  PopupItem,
  RouteItem,
} from './types';
import {
  fireDOMEvent,
  hapticFeedback,
  mapStringToEnum,
  processBadgeTemplate,
  processTemplate,
} from './utils';
import { getNavbarTemplates } from './dom-utils';
import { getDefaultStyles } from './styles';

declare global {
  interface Window {
    customCards: Array<object>;
  }
}

// Register navbar-card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen.',
});

const PROPS_TO_FORCE_UPDATE = [
  // TODO JLAQ replace this with proper keys instead of hardcoded strings
  '_config',
  '_isDesktop',
  '_inEditDashboardMode',
  '_inEditCardMode',
  '_inPreviewMode',
  '_location',
  '_popup',
];

const DEFAULT_DESKTOP_POSITION = DesktopPosition.bottom;
const DOUBLE_TAP_DELAY = 250;
const HOLD_ACTION_DELAY = 500;

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state() private hass!: HomeAssistant;
  @state() private _config?: NavbarCardConfig;
  @state() private _isDesktop?: boolean;
  @state() private _inEditDashboardMode?: boolean;
  @state() private _inEditCardMode?: boolean;
  @state() private _inPreviewMode?: boolean;
  @state() private _lastRender?: number;
  @state() private _location?: string;
  @state() private _popup?: TemplateResult | null;

  // hold_action state variables
  private holdTimeoutId: number | null = null;
  private holdTriggered: boolean = false;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;

  // double_tap_action state variables
  private lastTapTime: number = 0;
  private lastTapTarget: EventTarget | null = null;

  // tap_action state variables
  private tapTimeoutId: number | null = null;

  /**********************************************************************/
  /* Lit native callbacks */
  /**********************************************************************/

  connectedCallback(): void {
    super.connectedCallback();

    // Initialize location
    this._location = window.location.pathname;

    // Initialize screen size listener
    window.addEventListener('resize', this._checkDesktop);
    this._checkDesktop();

    const homeAssistantRoot = document.querySelector('body > home-assistant');

    // Check if Home Assistant dashboard is in edit mode
    this._inEditDashboardMode =
      this.parentElement?.closest('hui-card-edit-mode') != null;

    // Check if card is in edit mode
    this._inEditCardMode =
      homeAssistantRoot?.shadowRoot
        ?.querySelector('hui-dialog-edit-card')
        ?.shadowRoot?.querySelector('ha-dialog') != null;

    // Check if the card is in preview mode (new cards list)
    this._inPreviewMode =
      this.parentElement?.closest('.card > .preview') != null;

    // Manually append styles to the card to prevent unnecessary style re-rendering
    const style = document.createElement('style');
    style.textContent = this.generateCustomStyles().cssText;
    this.shadowRoot?.appendChild(style);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._checkDesktop);

    // Force popup closure without animation to prevent memory leaks
    this._popup = null;
  }

  setConfig(config) {
    // Check for template configuration
    if (config?.template) {
      // Get templates from the DOM
      const templates = getNavbarTemplates();

      // If no templates are found, but the card is configured to use a template, warn and use the default configuration.
      if (!templates) {
        console.warn(
          '[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' +
            '\n\n' +
            'https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n',
        );
      } else {
        // Merge template configuration with the card configuration, giving priority to the card
        const templateConfig = templates[config.template];
        if (templateConfig) {
          config = {
            ...templateConfig,
            ...config,
          };
        }
      }
    }

    // Check for valid configuration
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }
    config.routes.forEach(route => {
      if (route.icon == null && route.image == null) {
        throw new Error(
          'Each route must have either an "icon" or "image" property configured',
        );
      }
      if (
        route.popup == null &&
        route.submenu == null &&
        route.tap_action == null &&
        route.hold_action == null &&
        route.url == null &&
        route.double_tap_action == null
      ) {
        throw new Error(
          'Each route must have either "url", "popup", "tap_action", "hold_action" or "double_tap_action" property configured',
        );
      }
      // Validate specific action types if defined
      if (route.tap_action && route.tap_action.action == null) {
        throw new Error('"tap_action" must have an "action" property');
      }
      if (route.hold_action && route.hold_action.action == null) {
        throw new Error('"hold_action" must have an "action" property');
      }
      if (route.double_tap_action && route.double_tap_action.action == null) {
        throw new Error('"double_tap_action" must have an "action" property');
      }
    });

    // Store configuration
    this._config = config;
  }

  /**
   * Manually control whether to re-render or not the card
   */
  shouldUpdate(changedProperties: Map<string, unknown>) {
    for (const propName of changedProperties.keys()) {
      if (PROPS_TO_FORCE_UPDATE.includes(propName)) {
        return true;
      }
      if (
        propName === 'hass'
        // && new Date().getTime() - (this._lastRender ?? 0) > 1000
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Stub configuration to be properly displayed in the "new card"
   * dialog in home assistant
   */
  static getStubConfig(): NavbarCardConfig {
    return {
      routes: [
        { url: window.location.pathname, icon: 'mdi:home', label: 'Home' },
        {
          url: `${window.location.pathname}/devices`,
          icon: 'mdi:devices',
          label: 'Devices',
          hold_action: {
            action: 'navigate',
            navigation_path: '/config/devices/dashboard',
          },
        },
        {
          url: '/config/automation/dashboard',
          icon: 'mdi:creation',
          label: 'Automations',
        },
        { url: '/config/dashboard', icon: 'mdi:cog', label: 'Settings' },
        {
          icon: 'mdi:dots-horizontal',
          label: 'More',
          tap_action: {
            action: 'open-popup',
          },
          popup: [
            { icon: 'mdi:cog', url: '/config/dashboard' },
            {
              icon: 'mdi:hammer',
              url: '/developer-tools/yaml',
            },
            {
              icon: 'mdi:power',
              tap_action: {
                action: 'call-service',
                service: 'homeassistant.restart',
                service_data: {},
                confirmation: {
                  text: 'Are you sure you want to restart Home Assistant?',
                },
              },
            },
          ],
        },
      ],
    };
  }

  /**********************************************************************/
  /* Subcomponents */
  /**********************************************************************/
  private _getRouteIcon(route: RouteItem | PopupItem, isActive: boolean) {
    return route.image
      ? html`<img
          class="image ${isActive ? 'active' : ''}"
          src="${isActive && route.image_selected
            ? route.image_selected
            : route.image}"
          alt="${route.label || ''}" />`
      : html`<ha-icon
          class="icon ${isActive ? 'active' : ''}"
          icon="${isActive && route.icon_selected
            ? route.icon_selected
            : route.icon}"></ha-icon>`;
  }

  /**********************************************************************/
  /* Navbar callbacks */
  /**********************************************************************/

  /**
   * Label visibility evaluator
   */
  private _shouldShowLabels = (isSubmenu: boolean): boolean => {
    const config = this._isDesktop
      ? this._config?.desktop?.show_labels
      : this._config?.mobile?.show_labels;

    if (typeof config === 'boolean') return config;

    return (
      (config === 'popup_only' && isSubmenu) ||
      (config === 'routes_only' && !isSubmenu)
    );
  };

  /**
   * Check if we are on a desktop device
   */
  private _checkDesktop = () => {
    this._isDesktop =
      (window.innerWidth ?? 0) >= (this._config?.desktop?.min_width ?? 768);
  };

  /**
   * Render route item
   */
  private _renderRoute = (route: RouteItem) => {
    const isActive =
      route.selected != null
        ? processTemplate(this.hass, route.selected)
        : this._location == route.url;

    let showBadge = false;
    if (route.badge?.show) {
      showBadge = processTemplate(this.hass, route.badge?.show);
    } else if (route.badge?.template) {
      // TODO deprecate this
      showBadge = processBadgeTemplate(this.hass, route.badge?.template);
    }

    if (processTemplate(this.hass, route.hidden)) {
      return null;
    }

    return html`
      <div
        class="route ${isActive ? 'active' : ''}"
        @pointerdown=${(e: PointerEvent) => this._handlePointerDown(e, route)}
        @pointermove=${(e: PointerEvent) => this._handlePointerMove(e, route)}
        @pointerup=${(e: PointerEvent) => this._handlePointerUp(e, route)}
        @pointercancel=${(e: PointerEvent) =>
          this._handlePointerMove(e, route)}>
        ${showBadge
          ? html`<div
              class="badge ${isActive ? 'active' : ''}"
              style="background-color: ${route.badge?.color || 'red'};"></div>`
          : html``}

        <div class="button ${isActive ? 'active' : ''}">
          ${this._getRouteIcon(route, isActive)}
          <ha-ripple></ha-ripple>
        </div>
        ${this._shouldShowLabels(false)
          ? html`<div class="label ${isActive ? 'active' : ''}">
              ${processTemplate(this.hass, route.label) ?? ' '}
            </div>`
          : html``}
      </div>
    `;
  };

  /**
   * Handle gracefully closing the popup.
   */
  private _closePopup = () => {
    const popup = this.shadowRoot?.querySelector('.navbar-popup');
    const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');

    if (popup && backdrop) {
      popup.classList.remove('visible');
      backdrop.classList.remove('visible');

      // Wait for transitions to complete before removing
      setTimeout(() => {
        this._popup = null;
      }, 200);
    } else {
      this._popup = null;
    }
    // Remove Escape key listener when popup is closed
    window.removeEventListener('keydown', this._handleClosePopupListener);
  };

  /**
   * Get the styles for the popup based on its position relative to the anchor element.
   */
  private _getPopupStyles(
    anchorRect: DOMRect,
    position: 'top' | 'left' | 'bottom' | 'right' | 'mobile',
  ): {
    style: CSSResult;
    labelPositionClassName: string;
    popupDirectionClassName: string;
  } {
    const windowWidth = window.innerWidth;

    switch (position) {
      case 'top':
        return {
          style: css`
            top: ${anchorRect.top + anchorRect.height}px;
            left: ${anchorRect.x}px;
          `,
          labelPositionClassName: 'label-right',
          popupDirectionClassName: 'open-bottom',
        };
      case 'left':
        return {
          style: css`
            top: ${anchorRect.top}px;
            left: ${anchorRect.x + anchorRect.width}px;
          `,
          labelPositionClassName: 'label-bottom',
          popupDirectionClassName: 'open-right',
        };
      case 'right':
        return {
          style: css`
            top: ${anchorRect.top}px;
            right: ${windowWidth - anchorRect.x}px;
          `,
          labelPositionClassName: 'label-bottom',
          popupDirectionClassName: 'open-left',
        };
      case 'bottom':
      case 'mobile':
      default:
        if (anchorRect.x > windowWidth / 2) {
          return {
            style: css`
              top: ${anchorRect.top}px;
              right: ${windowWidth - anchorRect.x - anchorRect.width}px;
            `,
            labelPositionClassName: 'label-left',
            popupDirectionClassName: 'open-up',
          };
        } else {
          return {
            style: css`
              top: ${anchorRect.top}px;
              left: ${anchorRect.left}px;
            `,
            labelPositionClassName: 'label-right',
            popupDirectionClassName: 'open-up',
          };
        }
    }
  }

  /**
   * Open the popup menu for a given popupConfig and anchor element.
   */
  private _openPopup = (
    popupItems: RouteItem['popup'],
    target: HTMLElement,
  ) => {
    if (!popupItems || popupItems.length === 0) {
      console.warn('No popup items provided');
      return;
    }

    const anchorRect = target.getBoundingClientRect();

    const { style, labelPositionClassName, popupDirectionClassName } =
      this._getPopupStyles(
        anchorRect,
        !this._isDesktop
          ? 'mobile'
          : (this._config?.desktop?.position ?? DEFAULT_DESKTOP_POSITION),
      );

    this._popup = html`
      <div
        class="navbar-popup-backdrop"
        @click=${() => this._closePopup()}></div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this._isDesktop ? 'desktop' : ''}
        "
        style="${style}">
        ${popupItems
          .map((popupItem, index) => {
            let showBadge = false;
            if (popupItem.badge?.show) {
              showBadge = processTemplate(this.hass, popupItem.badge?.show);
            } else if (popupItem.badge?.template) {
              showBadge = processBadgeTemplate(
                this.hass,
                popupItem.badge?.template,
              );
            }

            if (processTemplate(this.hass, popupItem.hidden)) {
              return null;
            }

            return html`<div
              class="
              popup-item 
              ${popupDirectionClassName}
              ${labelPositionClassName}
            "
              style="--index: ${index}"
              @click=${(e: MouseEvent) =>
                this._handlePointerUp(e as PointerEvent, popupItem, true)}>
              ${showBadge
                ? html`<div
                    class="badge"
                    style="background-color: ${popupItem.badge?.color ||
                    'red'};"></div>`
                : html``}

              <div class="button">
                ${this._getRouteIcon(popupItem, false)}<ha-ripple></ha-ripple>
              </div>
              ${this._shouldShowLabels(true)
                ? html`<div class="label">
                    ${processTemplate(this.hass, popupItem.label) ?? ' '}
                  </div>`
                : html``}
            </div>`;
          })
          .filter(x => x != null)}
      </div>
    `;

    // Trigger animations after element is rendered
    requestAnimationFrame(() => {
      const popup = this.shadowRoot?.querySelector('.navbar-popup');
      const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');
      if (popup && backdrop) {
        popup.classList.add('visible');
        backdrop.classList.add('visible');
      }
    });
    // Add Escape key listener when popup is opened
    window.addEventListener('keydown', this._handleClosePopupListener);
  };

  /**********************************************************************/
  /* Pointer event listenrs */
  /**********************************************************************/
  private _handleClosePopupListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._popup) {
      e.preventDefault();
      this._closePopup();
    }
  };

  /**********************************************************************/
  /* Pointer event listenrs */
  /**********************************************************************/
  private _handlePointerDown = (e: PointerEvent, route: RouteItem) => {
    // Store the starting position for movement detection
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    if (route.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        hapticFeedback();
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };

  private _handlePointerMove = (e: PointerEvent, _route: RouteItem) => {
    if (!this.holdTimeoutId) {
      return;
    }

    // Calculate movement distance to prevent accidental hold triggers
    const moveX = Math.abs(e.clientX - this.pointerStartX);
    const moveY = Math.abs(e.clientY - this.pointerStartY);

    // If moved more than 10px in any direction, cancel the hold action
    if (moveX > 10 || moveY > 10) {
      if (this.holdTimeoutId !== null) {
        clearTimeout(this.holdTimeoutId);
        this.holdTimeoutId = null;
      }
    }
  };

  private _handlePointerUp = (
    e: PointerEvent,
    route: RouteItem,
    isPopup = false,
  ) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }

    // Capture current target from the original event
    const currentTarget = e.currentTarget as HTMLElement;

    // Check for double tap
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap =
      timeDiff < DOUBLE_TAP_DELAY && e.target === this.lastTapTarget;

    if (isDoubleTap && route.double_tap_action) {
      // Clear pending tap action if double tap is detected
      if (this.tapTimeoutId !== null) {
        clearTimeout(this.tapTimeoutId);
        this.tapTimeoutId = null;
      }
      this._handleDoubleTapAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else if (this.holdTriggered && route.hold_action) {
      this._handleHoldAction(currentTarget, route, isPopup);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else {
      this.lastTapTime = currentTime;
      this.lastTapTarget = e.target;

      this._handleTapAction(currentTarget, route, isPopup);
    }

    this.holdTriggered = false;
  };

  private _handleHoldAction = (
    target: HTMLElement,
    route: RouteItem,
    isPopupItem = false,
  ) => {
    this._executeAction(target, route, route.hold_action, 'hold', isPopupItem);
  };

  private _handleDoubleTapAction = (
    target: HTMLElement,
    route: RouteItem,
    isPopupItem = false,
  ) => {
    this._executeAction(
      target,
      route,
      route.double_tap_action,
      'double_tap',
      isPopupItem,
    );
  };

  private _handleTapAction = (
    target: HTMLElement,
    route: RouteItem,
    isPopupItem = false,
  ) => {
    // Set timeout for tap action to allow for potential double tap
    if (route.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        // this._handleTapAction(currentTarget, route, false);
        this._executeAction(
          target,
          route,
          route.tap_action,
          'tap',
          isPopupItem,
        );
      }, DOUBLE_TAP_DELAY);
    } else {
      // this._handleTapAction(currentTarget, route, false);
      this._executeAction(target, route, route.tap_action, 'tap', isPopupItem);
    }
  };

  /**
   * Generic handler for tap, hold, and double tap actions.
   */
  private _executeAction = (
    target: HTMLElement,
    route: RouteItem,
    action:
      | RouteItem['tap_action']
      | RouteItem['hold_action']
      | RouteItem['double_tap_action'],
    actionType: 'tap' | 'hold' | 'double_tap',
    isPopupItem = false,
  ) => {
    // Close popup for any action unless it's opening a new popup
    if (action?.action !== 'open-popup' && isPopupItem) {
      this._closePopup();
    }

    if (!isPopupItem && action?.action === 'open-popup') {
      const popupItems = route.popup ?? route.submenu;
      if (!popupItems) {
        console.error('No popup items found for route:', route);
      } else {
        if (actionType === 'tap') {
          hapticFeedback();
        }
        if (actionType === 'tap') {
          // Quick fix to prevent the popup from closing inmediately after
          // opening it on iOS devices.
          setTimeout(() => {
            this._openPopup(popupItems, target);
          }, 100);
        } else {
          this._openPopup(popupItems, target);
        }
      }
    } else if (action?.action === 'toggle-menu') {
      if (actionType === 'tap') {
        hapticFeedback();
      }
      fireDOMEvent(this, 'hass-toggle-menu', { bubbles: true, composed: true });
    } else if (action != null) {
      if (actionType === 'tap') {
        hapticFeedback();
      }
      fireDOMEvent(
        this,
        'hass-action',
        { bubbles: true, composed: true },
        {
          action: actionType,
          config: {
            [`${actionType}_action`]: action,
          },
        },
      );
    } else if (actionType === 'tap' && route.url) {
      // Handle default navigation for tap action if no specific action is defined
      navigate(this, route.url);
    }
  };

  /**********************************************************************/
  /* Render function */
  /**********************************************************************/

  protected render() {
    if (!this._config) {
      return html``;
    }

    const { routes, desktop, mobile } = this._config;
    const { position: desktopPosition, hidden: desktopHidden } = desktop ?? {};
    const { hidden: mobileHidden } = mobile ?? {};

    // Keep last render timestamp for debounced state updates
    this._lastRender = new Date().getTime();

    // Check visualization modes
    const isEditMode =
      this._inEditDashboardMode || this._inPreviewMode || this._inEditCardMode;

    // Choose css classnames
    const desktopPositionClassname =
      mapStringToEnum(DesktopPosition, desktopPosition as string) ??
      DEFAULT_DESKTOP_POSITION;
    const deviceModeClassName = this._isDesktop ? 'desktop' : 'mobile';
    const editModeClassname = isEditMode ? 'edit-mode' : '';

    // Handle hidden props
    if (
      !isEditMode &&
      ((this._isDesktop && !!processTemplate(this.hass, desktopHidden)) ||
        (!this._isDesktop && !!processTemplate(this.hass, mobileHidden)))
    ) {
      return html``;
    }

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname}">
        ${routes?.map(this._renderRoute).filter(x => x != null)}
      </ha-card>
      ${this._popup}
    `;
  }

  /**********************************************************************/
  /* Styles */
  /**********************************************************************/

  /**
   * Dynamically apply user-provided styles
   */
  private generateCustomStyles(): CSSResult {
    const userStyles = this._config?.styles
      ? unsafeCSS(this._config.styles)
      : css``;

    // Combine default styles and user styles
    return css`
      ${getDefaultStyles()}
      ${userStyles}
    `;
  }
}

console.info(
  `%c navbar-card %c ${version} `,
  // Card name styles
  'background-color: #555;\
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 10px 0 0 10px;',
  // Card version styles
  'background-color: #00abd1; \
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 0 10px 10px 0;',
);
