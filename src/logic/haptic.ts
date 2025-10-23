import { NavbarCard } from '../navbar-card';
import { hapticFeedback } from '../utils';

const shouldTriggerHaptic = (
  context: NavbarCard,
  actionType: 'tap' | 'hold' | 'double_tap',
  isNavigation = false,
): boolean => {
  const hapticConfig = context.config?.haptic;

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
    hapticFeedback();
  }
};
