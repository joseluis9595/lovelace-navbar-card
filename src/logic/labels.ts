import { NavbarCard } from '../navbar-card';

/**
 * Check if labels should be shown for a given route or popup item
 */
export const shouldShowLabels = (
  context: NavbarCard,
  isSubmenu: boolean,
): boolean => {
  const config = context.isDesktop
    ? context.config?.desktop?.show_labels
    : context.config?.mobile?.show_labels;

  if (typeof config === 'boolean') return config;

  return (
    (config === 'popup_only' && isSubmenu) ||
    (config === 'routes_only' && !isSubmenu)
  );
};

/**
 * Check if label backgrounds should be shown for a given popup item
 */
export const shouldShowLabelBackground = (context: NavbarCard): boolean => {
  const enabled = context.isDesktop
    ? context.config?.desktop?.show_popup_label_backgrounds
    : context.config?.mobile?.show_popup_label_backgrounds;
  return !!enabled;
};
