import { navigate } from 'custom-card-helpers';
import {
  NavbarCustomActions,
  QuickbarActionConfig,
  RouteItemBase,
} from '@/config';
import { NavbarCard } from '@/navbar-card';
import {
  NavbarIcon,
  NavbarBadge,
  NavbarRoute,
  NavbarPopupItem,
} from '@components';
import {
  fireDOMEvent,
  forceOpenEditMode,
  forceResetRipple,
  hapticFeedback,
  processTemplate,
} from '@/utils';

export class BaseRoute {
  constructor(
    protected _navbarCard: NavbarCard,
    public readonly data: RouteItemBase,

    private _iconInstance?: NavbarIcon.Icon,
    private _badgeInstance?: NavbarBadge.Badge,
    private _cachedLabel?: string | null,
    private _cachedHidden?: boolean,
    private _cachedSelected?: boolean
  ) {}

  get url() {
    return this.data.url;
  }
  get icon() {
    return this._iconInstance ??= new NavbarIcon.Icon(this._navbarCard, this);
  }
  get badge() {
    return this._badgeInstance ??= new NavbarBadge.Badge(this._navbarCard, this);
  }

  get label(): string | null {
    if (!this._shouldShowLabels(false)) return null;
    return this._cachedLabel ??=
        processTemplate<string>(this._navbarCard._hass, this._navbarCard, this.data.label)
        ?? ' ';
  }

  get hidden() {
    return this._cachedHidden ??= !!processTemplate<boolean>(
        this._navbarCard._hass,
        this._navbarCard,
        this.data.hidden,
      );
  }
  get selected() {
    return this._cachedSelected ??= this.data.selected != null
        ? !!processTemplate<boolean>(
            this._navbarCard._hass,
            this._navbarCard,
            this.data.selected,
          )
        : window.location.pathname === this.url;;
  }
  get tap_action() {
    return this.data.tap_action;
  }
  get hold_action() {
    return this.data.hold_action;
  }
  get double_tap_action() {
    return this.data.double_tap_action;
  }

  /**
   * Generic handler for tap, hold, and double tap actions.
   */
  public executeAction = (
    target: HTMLElement,
    route: NavbarRoute.Route | NavbarPopupItem.PopupItem,
    action:
      | RouteItemBase['tap_action']
      | RouteItemBase['hold_action']
      | RouteItemBase['double_tap_action'],
    actionType: 'tap' | 'hold' | 'double_tap',
  ) => {
    // Force reset ripple status to prevent UI bugs
    forceResetRipple(target);

    const triggerHaptic = (strong?: boolean) => {
      if (this._shouldTriggerHaptic(actionType, strong)) {
        hapticFeedback();
      }
    };

    // Close popup for any action unless it's opening a new popup
    if (
      action?.action !== NavbarCustomActions.openPopup &&
      route instanceof NavbarRoute.Route
    ) {
      route.popup.close();
    }

    switch (action?.action) {
      case NavbarCustomActions.openPopup:
        if (route instanceof NavbarRoute.Route) {
          if (route.popup.items.length === 0) {
            console.error(
              `[navbar-card] No popup items found for route: ${route.label}`,
            );
          } else {
            triggerHaptic();
            route.popup.open(target);
          }
        }
        break;

      case NavbarCustomActions.toggleMenu:
        triggerHaptic();
        fireDOMEvent(this._navbarCard, 'hass-toggle-menu', {
          bubbles: true,
          composed: true,
        });
        break;

      case NavbarCustomActions.quickbar:
        triggerHaptic();
        fireDOMEvent<'KeyboardEvent'>(
          this._navbarCard,
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
        triggerHaptic();
        fireDOMEvent(this._navbarCard, 'hass-show-notifications', {
          bubbles: true,
          composed: true,
        });
        break;

      case NavbarCustomActions.navigateBack:
        triggerHaptic(true);
        window.history.back();
        break;

      case NavbarCustomActions.openEditMode:
        triggerHaptic();
        forceOpenEditMode();
        break;

      case NavbarCustomActions.customJSAction:
        triggerHaptic();
        processTemplate<string>(
          this._navbarCard._hass,
          this._navbarCard,
          action.code,
        );
        break;

      default:
        if (action != null) {
          triggerHaptic();
          // Slight delay before dispatching to prevent event conflicts
          setTimeout(() => {
            fireDOMEvent(
              this._navbarCard,
              'hass-action',
              { bubbles: true, composed: true },
              {
                action: actionType,
                config: { [`${actionType}_action`]: action },
              },
            );
          }, 10);
        } else if (actionType === 'tap' && route.url) {
          triggerHaptic(true);
          navigate(this, route.url);
        }
        break;
    }
  };

  protected _shouldShowLabels = (isSubmenu: boolean): boolean => {
    const config = this._navbarCard.isDesktop
      ? this._navbarCard.config?.desktop?.show_labels
      : this._navbarCard.config?.mobile?.show_labels;

    if (typeof config === 'boolean') return config;

    return (
      (config === 'popup_only' && isSubmenu) ||
      (config === 'routes_only' && !isSubmenu)
    );
  };

  protected _shouldShowLabelBackground = (): boolean => {
    const enabled = this._navbarCard.isDesktop
      ? this._navbarCard.config?.desktop?.show_popup_label_backgrounds
      : this._navbarCard.config?.mobile?.show_popup_label_backgrounds;
    return !!enabled;
  };

  private _shouldTriggerHaptic(
    actionType: 'tap' | 'hold' | 'double_tap',
    isNavigation = false,
  ): boolean {
    const hapticConfig = this._navbarCard.config?.haptic;

    // If haptic is a boolean, use it as a global setting
    if (typeof hapticConfig === 'boolean') {
      return hapticConfig;
    }

    // If no haptic config is provided, return default values
    if (!hapticConfig) {
      return !isNavigation;
    }

    // Check navigation first
    if (isNavigation) {
      return hapticConfig.url ?? false;
    }

    // Check specific action types
    switch (actionType) {
      case 'tap':
        return hapticConfig.tap_action ?? false;
      case 'hold':
        return hapticConfig.hold_action ?? false;
      case 'double_tap':
        return hapticConfig.double_tap_action ?? false;
      default:
        return false;
    }
  }

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
}
