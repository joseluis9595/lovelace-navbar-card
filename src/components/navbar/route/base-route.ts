import { navigate } from 'custom-card-helpers';
import { NavbarCard } from '@/navbar-card';
import { Icon, Badge, Route, PopupItem } from '@/components/navbar';
import {
  NavbarCustomActions,
  QuickbarActionConfig,
  RouteItemBase,
} from '@/types';
import {
  fireDOMEvent,
  forceOpenEditMode,
  forceResetRipple,
  hapticFeedback,
  processTemplate,
} from '@/utils';
import { ActionableElement } from '@/components/action-events';

export class BaseRoute implements ActionableElement {
  private _iconInstance?: Icon;
  private _badgeInstance?: Badge;

  constructor(
    protected _navbarCard: NavbarCard,
    public readonly data: RouteItemBase,
  ) {}

  public destroy(): void {
    this._iconInstance?.destroy?.();
    this._badgeInstance?.destroy?.();
    this._iconInstance = undefined;
    this._badgeInstance = undefined;
    // @ts-expect-error: This is a workaround to break the circular reference
    this._navbarCard = null;
  }

  get url() {
    return this.data.url;
  }

  get icon() {
    return (this._iconInstance ??= new Icon(this._navbarCard, this));
  }

  get badge() {
    return (this._badgeInstance ??= new Badge(this._navbarCard, this));
  }

  get label(): string | null {
    if (!this._shouldShowLabels()) return null;
    return (
      processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this.data.label,
      ) ?? ' '
    );
  }

  get hidden() {
    return processTemplate<boolean>(
      this._navbarCard._hass,
      this._navbarCard,
      this.data.hidden,
    );
  }

  get selected() {
    return this.data.selected != null
      ? processTemplate<boolean>(
          this._navbarCard._hass,
          this._navbarCard,
          this.data.selected,
        )
      : window.location.pathname === this.url;
  }

  get selected_color() {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this.data.selected_color,
    );
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
    element: ActionableElement,
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
    if (action?.action !== NavbarCustomActions.openPopup) {
      if (element instanceof Route) {
        element.popup.close();
      } else if (element instanceof PopupItem) {
        element.closeParentPopup();
      }
    }

    // Quick patch to prevent event propagation. For unknown reasons, the event
    // propagation is not properly prevented, and when clicking a route or popup
    // and navigating to a new page, the event is triggered again, causing a new
    // click event in the destination page.
    setTimeout(() => {
      switch (action?.action) {
        case NavbarCustomActions.openPopup:
          if (element instanceof Route) {
            if (element.popup.items.length === 0) {
              console.error(
                `[navbar-card] No popup items found for route: ${element.label}`,
              );
            } else {
              triggerHaptic();
              element.popup.open(target);
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

        case NavbarCustomActions.logout:
          triggerHaptic();
          this._navbarCard._hass.auth.revoke();
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
            fireDOMEvent(
              this._navbarCard,
              'hass-action',
              { bubbles: true, composed: true },
              {
                action: actionType,
                config: { [`${actionType}_action`]: action },
              },
            );
          } else if (actionType === 'tap' && (element as Route).url) {
            triggerHaptic(true);
            navigate(this, (element as Route).url!);
          }
          break;
      }
    }, 10);
  };

  protected _shouldShowLabels = (): boolean => {
    const config = this._navbarCard.isDesktop
      ? this._navbarCard.config?.desktop?.show_labels
      : this._navbarCard.config?.mobile?.show_labels;

    if (typeof config === 'boolean') return config;

    return (
      (config === 'popup_only' && this instanceof PopupItem) ||
      (config === 'routes_only' && !(this instanceof PopupItem))
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
