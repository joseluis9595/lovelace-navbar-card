import type { NavbarCard } from '@/navbar-card';
import { DEFAULT_NAVBAR_CONFIG } from '@/types';
import { fireDOMEvent } from '@/utils';

const shouldTriggerHaptic = (
  context: NavbarCard,
  actionType: 'tap' | 'hold' | 'double_tap',
  isNavigation = false,
): boolean => {
  const hapticConfig = context.config?.haptic ?? DEFAULT_NAVBAR_CONFIG.haptic;

  // If haptic is a boolean, use it as a global setting
  if (typeof hapticConfig === 'boolean') {
    return hapticConfig;
  }

  // Check navigation first
  if (isNavigation) {
    return hapticConfig.url ?? DEFAULT_NAVBAR_CONFIG.haptic.url;
  }

  // Check specific action types
  switch (actionType) {
    case 'tap':
      return hapticConfig.tap_action ?? DEFAULT_NAVBAR_CONFIG.haptic.tap_action;
    case 'hold':
      return (
        hapticConfig.hold_action ?? DEFAULT_NAVBAR_CONFIG.haptic.hold_action
      );
    case 'double_tap':
      return (
        hapticConfig.double_tap_action ??
        DEFAULT_NAVBAR_CONFIG.haptic.double_tap_action
      );
    default:
      return false;
  }
};

/**
 * Trigger haptic feedback if the action type is configured to trigger haptic feedback.
 */
export const triggerHaptic = (
  context: NavbarCard,
  actionType: 'tap' | 'hold' | 'double_tap',
  isNavigation = false,
) => {
  if (shouldTriggerHaptic(context, actionType, isNavigation)) {
    fireDOMEvent(window, 'haptic', { detailOverride: 'selection' });
  }
};
