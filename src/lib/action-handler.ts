import { navigate } from 'custom-card-helpers';

import type { PopupItem, Route } from '@/components/navbar';
import type { NavbarCard } from '@/navbar-card';
import {
  NavbarCustomActions,
  type QuickbarActionConfig,
  type RouteItem,
} from '@/types';
import {
  fireDOMEvent,
  forceOpenEditMode,
  forceResetRipple,
  matchesCurrentNavigationPath,
  processTemplate,
  scrollToTop,
  triggerHaptic,
} from '@/utils';

/**
 * List of HA actions where we manually append `entity` field
 */
export const ACTIONS_WITH_CUSTOM_ENTITY = ['more-info', 'toggle'];

/**
 * Maps navbar-card's `mode` config onto Home Assistant's quickbar section names.
 */
const QUICKBAR_MODES = {
  commands: 'command',
  devices: 'device',
  entities: 'entity',
} as const;

/**
 * Opens Home Assistant's quickbar by simulating the keyboard shortcut.
 * Uses Ctrl/Cmd + K for the standard quickbar, or mode-specific keys if specified.
 *
 * This is a fallback for HA < 2026.6. Newer frontends no longer observe synthetic
 * `keydown` events dispatched at `document` (see `openQuickbar`), so this path only
 * runs when the modern entry point below is unavailable.
 */
const openQuickbarViaKeyboard = (action: QuickbarActionConfig) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  let key: string;

  if (action.mode) {
    switch (action.mode) {
      case 'devices':
        key = 'd';
        break;
      case 'entities':
        key = 'e';
        break;
      case 'commands':
      default:
        key = 'c';
        break;
    }
  } else {
    // Standard quickbar shortcut: Ctrl/Cmd + K
    key = 'k';
  }

  const eventInit: KeyboardEventInit = {
    bubbles: true,
    cancelable: true,
    key,
  };

  // Set platform-specific modifier key, only for the standard quickbar
  if (!action.mode) {
    if (isMac) {
      eventInit.metaKey = true;
    } else {
      eventInit.ctrlKey = true;
    }
  }

  const event = new KeyboardEvent('keydown', eventInit);

  document.dispatchEvent(event);
};

/**
 * Opens Home Assistant's quickbar.
 *
 * HA 2026.6 reworked keyboard-shortcut capture (a tinykeys-based `ShortcutManager`)
 * and no longer reacts to synthesized `keydown` events dispatched at `document`, so
 * the previous "simulate the shortcut" approach silently stopped working
 * (https://github.com/joseluis9595/lovelace-navbar-card/issues/312).
 *
 * We instead call the frontend's own quickbar entry point (`_showQuickBar`) on the
 * `<home-assistant>` root. That fires the same `show-dialog` event the shortcut
 * handlers use and — importantly — loads the `ha-quick-bar` dialog through HA's own
 * importer, so it also works on a cold session. When that entry point is missing
 * (older HA), we fall back to the legacy synthetic-key dispatch.
 */
const openQuickbar = (action: QuickbarActionConfig) => {
  const haRoot = document.querySelector('home-assistant') as
    | (HTMLElement & {
        _showQuickBar?: (e: Event, mode?: string) => void;
      })
    | null;

  if (haRoot && typeof haRoot._showQuickBar === 'function') {
    // `_showQuickBar(e, mode)` runs `_canShowQuickBar(e)`, which reads
    // `e.composedPath()[0].tagName`, then checks `e.defaultPrevented` and calls
    // `e.preventDefault()`. Provide a minimal event that satisfies those checks,
    // with a `composedPath` that resolves to a non-input element so the "don't
    // hijack typing" guard passes.
    const syntheticEvent = {
      composedPath: () => [document.body],
      defaultPrevented: false,
      preventDefault: () => undefined,
    } as unknown as Event;
    const mode = action.mode ? QUICKBAR_MODES[action.mode] : undefined;
    haRoot._showQuickBar(syntheticEvent, mode);
    return;
  }

  openQuickbarViaKeyboard(action);
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
      openQuickbar(action);
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

        if (
          action.action === 'navigate' &&
          matchesCurrentNavigationPath(action.navigation_path)
        ) {
          scrollToTop();
          return;
        }

        // For `more-info` and `toggle` actions, extract the entity id manually configured
        const extractedEntity = ACTIONS_WITH_CUSTOM_ENTITY.includes(
          action.action,
        )
          ? // @ts-expect-error: `entity` and `entity_id` are not defined in the generic ActionConfig
            (action.entity ?? action.entity_id)
          : undefined;

        setTimeout(() => {
          fireDOMEvent(context, 'hass-action', {
            detailOverride: {
              action: actionType,
              config: {
                [`${actionType}_action`]: action,
                entity: extractedEntity,
              },
            },
            options: { bubbles: true, composed: true },
          });
        }, 10);
      } else if (actionType === 'tap' && (route?.url || popupItem?.url)) {
        // Handle default navigation for tap action if no specific action is defined
        triggerHaptic(context, actionType, true);
        const destinationUrl = route?.url ?? popupItem?.url ?? '';
        if (matchesCurrentNavigationPath(destinationUrl)) {
          scrollToTop();
          return;
        }
        navigate(context, destinationUrl);
      }
      break;
  }
};
