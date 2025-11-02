import { navigate } from 'custom-card-helpers';
import { NavbarCustomActions, QuickbarActionConfig, RouteItem } from '@/types';
import {
  fireDOMEvent,
  forceOpenEditMode,
  forceResetRipple,
  processTemplate,
  triggerHaptic,
} from '@/utils';
import { NavbarCard } from '@/navbar-card';
import { PopupItem, Route } from '@/components/navbar';

/**
 * List of HA actions where we manually append `entity` field
 */
export const ACTIONS_WITH_CUSTOM_ENTITY = ['more-info', 'toggle'];

/**
 * Choose the key needed for the KeyboardEvent to open the native HA quickbar.
 */
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
export const executeAction = (params: {
  context: NavbarCard;
  target: HTMLElement;
  action:
    | RouteItem['tap_action']
    | RouteItem['hold_action']
    | RouteItem['double_tap_action'];
  actionType: 'tap' | 'hold' | 'double_tap';
  data: {
    route?: Route;
    popupItem?: PopupItem;
  };
}) => {
  const { context, target, action, actionType, data } = params;
  const { route, popupItem } = data;

  // Force reset ripple status to prevent UI bugs
  forceResetRipple(target);

  // Close popup for any action unless it's opening a new popup
  if (action?.action !== NavbarCustomActions.openPopup) {
    if (route != null) {
      route.popup.close();
    } else if (popupItem != null) {
      popupItem.closeParentPopup();
    }
  }

  // Handle different action types
  switch (action?.action) {
    case NavbarCustomActions.openPopup: {
      if (!route) return;
      const popupItems = route.popup.items;
      if (!popupItems) {
        console.error(
          `[navbar-card] No popup items found for route: ${route.label}`,
        );
      } else {
        triggerHaptic(context, actionType);
        route.popup.open(target);
      }
      break;
    }

    case NavbarCustomActions.toggleMenu:
      triggerHaptic(context, actionType);
      fireDOMEvent(context, 'hass-toggle-menu', {
        options: {
          bubbles: true,
          composed: true,
        },
      });
      break;

    case NavbarCustomActions.quickbar:
      triggerHaptic(context, actionType);
      fireDOMEvent<'KeyboardEvent'>(
        context,
        'keydown',
        {
          options: {
            bubbles: true,
            composed: true,
            key: chooseKeyForQuickbar(action),
          },
        },
        KeyboardEvent,
      );
      break;

    case NavbarCustomActions.showNotifications:
      triggerHaptic(context, actionType);
      fireDOMEvent(context, 'hass-show-notifications', {
        options: {
          bubbles: true,
          composed: true,
        },
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
      processTemplate<string>(context._hass, context, action.code, {
        disableEmptyReturnCheck: true,
      });
      break;

    case NavbarCustomActions.logout:
      triggerHaptic(context, actionType);
      context._hass.auth.revoke();
      break;

    default:
      if (action != null) {
        triggerHaptic(context, actionType);

        // For `more-info` and `toggle` actions, extract the entity id manually configured
        const extractedEntity = ACTIONS_WITH_CUSTOM_ENTITY.includes(
          action.action,
        )
          ? // @ts-expect-error: `entity` and `entity_id` are not defined in the generic ActionConfig
            (action.entity ?? action.entity_id)
          : undefined;

        setTimeout(() => {
          fireDOMEvent(context, 'hass-action', {
            options: { bubbles: true, composed: true },
            detailOverride: {
              action: actionType,
              config: {
                [`${actionType}_action`]: action,
                entity: extractedEntity,
              },
            },
          });
        }, 10);
      } else if (actionType === 'tap' && (route?.url || popupItem?.url)) {
        // Handle default navigation for tap action if no specific action is defined
        triggerHaptic(context, actionType, true);
        navigate(context, route?.url ?? popupItem?.url ?? '');
      }
      break;
  }
};
