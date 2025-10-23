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
import { hapticFeedback, processTemplate } from '../utils';
import { NavbarCard } from '../navbar-card';
import { shouldTriggerHaptic } from './haptic';

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
          if (shouldTriggerHaptic(context, actionType)) {
            hapticFeedback();
          }
          context.openPopup(route, target);
        }
      }
      break;

    case NavbarCustomActions.toggleMenu:
      if (shouldTriggerHaptic(context, actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(context, 'hass-toggle-menu', {
        bubbles: true,
        composed: true,
      });
      break;

    case NavbarCustomActions.quickbar:
      if (shouldTriggerHaptic(context, actionType)) {
        hapticFeedback();
      }
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
      if (shouldTriggerHaptic(context, actionType)) {
        hapticFeedback();
      }
      fireDOMEvent(context, 'hass-show-notifications', {
        bubbles: true,
        composed: true,
      });
      break;

    case NavbarCustomActions.navigateBack:
      if (shouldTriggerHaptic(context, actionType, true)) {
        hapticFeedback();
      }
      window.history.back();
      break;

    case NavbarCustomActions.openEditMode:
      if (shouldTriggerHaptic(context, actionType)) {
        hapticFeedback();
      }
      forceOpenEditMode();
      break;

    case NavbarCustomActions.customJSAction:
      if (shouldTriggerHaptic(context, actionType)) {
        hapticFeedback();
      }
      processTemplate<string>(context.hass, context, action.code);
      break;

    default:
      if (action != null) {
        if (shouldTriggerHaptic(context, actionType)) {
          hapticFeedback();
        }
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
        if (shouldTriggerHaptic(context, actionType, true)) {
          hapticFeedback();
        }
        navigate(context, route.url);
      }
      break;
  }
};
