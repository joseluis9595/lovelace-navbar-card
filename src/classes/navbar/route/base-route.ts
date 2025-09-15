import { NavbarCardConfig, RouteItemBase } from '@/config';
import { NavbarCard } from '@/navbar-card';
import { processTemplate } from '@/utils';
import { HomeAssistant } from 'custom-card-helpers';

export class BaseRoute {
  constructor(
    protected _navbarCard: NavbarCard,
    protected readonly _data: RouteItemBase,

    // Cache for computed properties
    protected _cachedIsHidden?: boolean,
    protected _cachedIsActive?: boolean,
    protected _cachedProcessedLabel?: string | null,
  ) {}

  get url() {
    return this._data.url;
  }
  get icon() {
    return this._data.icon;
  }
  get image() {
    return this._data.image;
  }
  get icon_selected() {
    return this._data.icon_selected;
  }
  get image_selected() {
    return this._data.image_selected;
  }
  get label() {
    return this._data.label;
  }
  get badge() {
    return this._data.badge;
  }
  get hidden() {
    return this._data.hidden;
  }
  get selected() {
    return this._data.selected;
  }
  get tap_action() {
    return this._data.tap_action;
  }
  get hold_action() {
    return this._data.hold_action;
  }
  get double_tap_action() {
    return this._data.double_tap_action;
  }

  get isHidden(): boolean {
    return (this._cachedIsHidden ??= processTemplate<boolean>(
      this._hass,
      this._navbarCard,
      this.hidden,
    ));
  }

  get isActive(): boolean {
    return (this._cachedIsActive ??=
      this.selected != null
        ? processTemplate<boolean>(this._hass, this._navbarCard, this.selected)
        : window.location.pathname === this.url);
  }

  get processedLabel(): string | null {
    return (this._cachedProcessedLabel ??= this._shouldShowLabels(false)
      ? (processTemplate<string>(this._hass, this._navbarCard, this.label) ??
        ' ')
      : null);
  }

  /**
   * Generic handler for tap, hold, and double tap actions.
   */
  protected _executeAction = (
    target: HTMLElement,
    route: RouteItemBase,
    action:
      | RouteItemBase['tap_action']
      | RouteItemBase['hold_action']
      | RouteItemBase['double_tap_action'],
    actionType: 'tap' | 'hold' | 'double_tap',
    isPopupItem = false,
  ) => {
    // Force reset ripple status to prevent UI bugs
    forceResetRipple(target);

    // Close popup for any action unless it's opening a new popup
    if (action?.action !== NavbarCustomActions.openPopup && isPopupItem) {
      this._closePopup();
    }

    // Handle different action types
    switch (action?.action) {
      case NavbarCustomActions.openPopup:
        if (!isPopupItem) {
          const popupItems = route.popup ?? route.submenu;
          if (!popupItems) {
            console.error(
              `[navbar-card] No popup items found for route: ${route.label}`,
            );
          } else {
            if (this._shouldTriggerHaptic(actionType)) {
              hapticFeedback();
            }
            this._openPopup(route, target);
          }
        }
        break;

      case NavbarCustomActions.toggleMenu:
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        fireDOMEvent(this, 'hass-toggle-menu', {
          bubbles: true,
          composed: true,
        });
        break;

      case NavbarCustomActions.quickbar:
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        fireDOMEvent<'KeyboardEvent'>(
          this,
          'keydown',
          {
            bubbles: true,
            composed: true,
            key: this._chooseKeyForQuickbar(action),
          },
          undefined,
          KeyboardEvent,
        );
        break;

      case NavbarCustomActions.showNotifications:
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        fireDOMEvent(this, 'hass-show-notifications', {
          bubbles: true,
          composed: true,
        });
        break;

      case NavbarCustomActions.navigateBack:
        if (this._shouldTriggerHaptic(actionType, true)) {
          hapticFeedback();
        }
        window.history.back();
        break;

      case NavbarCustomActions.openEditMode:
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        forceOpenEditMode();
        break;

      case NavbarCustomActions.customJSAction:
        if (this._shouldTriggerHaptic(actionType)) {
          hapticFeedback();
        }
        processTemplate<string>(this._hass, this, action.code);
        break;

      default:
        if (action != null) {
          if (this._shouldTriggerHaptic(actionType)) {
            hapticFeedback();
          }
          setTimeout(() => {
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
          }, 10);
        } else if (actionType === 'tap' && route.url) {
          // Handle default navigation for tap action if no specific action is defined
          if (this._shouldTriggerHaptic(actionType, true)) {
            hapticFeedback();
          }
          navigate(this, route.url);
        }
        break;
    }
  };

    private _chooseKeyForQuickbar = (action: QuickbarActionConfig) => {
      switch (action.mode) {
        case 'devices':
          return 'd';
        case 'entities':
          return 'e';
        case 'commands':
        default:
          return 'c';
      }
    };

    /**
   * Label visibility evaluator
   */
  private _shouldShowLabels = (isSubmenu: boolean): boolean => {
    const config = this.isDesktop
      ? this._config?.desktop?.show_labels
      : this._config?.mobile?.show_labels;

    if (typeof config === 'boolean') return config;

    return (
      (config === 'popup_only' && isSubmenu) ||
      (config === 'routes_only' && !isSubmenu)
    );
  };
}
