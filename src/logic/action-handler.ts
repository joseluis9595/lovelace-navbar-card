import { navigate } from 'custom-card-helpers';
import {
  NavbarCustomActions,
  QuickbarActionConfig,
  RouteItem,
} from '../config';
import {
  fireDOMEvent,
  forceOpenEditMode,
  forceResetRipple,
} from '../dom-utils';
import { processTemplate } from '../utils';
import { NavbarCard } from '../navbar-card';
import { triggerHaptic } from './haptic';

const chooseKeyForQuickbar = (action: QuickbarActionConfig) => {
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
 * Generic handler for tap, hold, and double tap actions.
 */
export const executeAction = (
  context: NavbarCard,
  target: HTMLElement,
  route: RouteItem,
  action:
    | RouteItem['tap_action']
    | RouteItem['hold_action']
    | RouteItem['double_tap_action'],
  actionType: 'tap' | 'hold' | 'double_tap',
  isPopupItem = false,
) => {
  // Force reset ripple status to prevent UI bugs
  forceResetRipple(target);

  // Close popup for any action unless it's opening a new popup
  if (action?.action !== NavbarCustomActions.openPopup && isPopupItem) {
    context.closePopup();
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
          triggerHaptic(context, actionType);
          context.openPopup(route, target);
        }
      }
      break;

    case NavbarCustomActions.toggleMenu:
      triggerHaptic(context, actionType);
      fireDOMEvent(context, 'hass-toggle-menu', {
        bubbles: true,
        composed: true,
      });
      break;

    case NavbarCustomActions.quickbar:
      triggerHaptic(context, actionType);
      fireDOMEvent<'KeyboardEvent'>(
        context,
        'keydown',
        {
          bubbles: true,
          composed: true,
          key: chooseKeyForQuickbar(action),
        },
        undefined,
        KeyboardEvent,
      );
      break;

    case NavbarCustomActions.showNotifications:
      triggerHaptic(context, actionType);
      fireDOMEvent(context, 'hass-show-notifications', {
        bubbles: true,
        composed: true,
      });
      break;

    case NavbarCustomActions.navigateBack:
      triggerHaptic(context, actionType, true);
      window.history.back();
      break;

    case NavbarCustomActions.openEditMode:
      triggerHaptic(context, actionType);
      forceOpenEditMode();
      break;

    case NavbarCustomActions.customJSAction:
      triggerHaptic(context, actionType);
      processTemplate<string>(context.hass, context, action.code);
      break;

    case NavbarCustomActions.logout:
      triggerHaptic(context, actionType);
      context.hass.auth.revoke();
      break;

    default:
      if (action != null) {
        triggerHaptic(context, actionType);
        setTimeout(() => {
          fireDOMEvent(
            context,
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
        triggerHaptic(context, actionType, true);
        navigate(context, route.url);
      }
      break;
  }
};
