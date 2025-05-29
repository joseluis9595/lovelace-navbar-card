import { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

// Custom navbar-card actions
type PopupActionConfig = {
  action: 'open-popup';
};
type NavigateBackActionConfig = {
  action: 'navigate-back';
};

// Extend ActionConfig to include our custom popup action
export type ExtendedActionConfig =
  | ActionConfig
  | PopupActionConfig
  | NavigateBackActionConfig;

type JSTemplate = string;
type TemplatableBoolean = JSTemplate | boolean;
type TemplatableString = JSTemplate | boolean;

// Base properties shared by all route items
interface RouteItemBase {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
  icon?: string;
  image?: string;
  icon_selected?: string;
  image_selected?: string;
  label?: TemplatableString;
  badge?: {
    template?: string; // TODO deprecate
    color?: string;
    show?: TemplatableBoolean;
  };
  hidden?: TemplatableBoolean;
  selected?: TemplatableBoolean;
}

// Type for popup menu items (don't include popup property to avoid circular references)
export type PopupItem = RouteItemBase;
// Main route item type
export type RouteItem = RouteItemBase & {
  popup?: PopupItem[];
  // Alias for backward compatibility
  submenu?: PopupItem[];
};

// Labels visibility granular configuration
type LabelVisibilityConfig = boolean | 'popup_only' | 'routes_only';

// Main card configuration
export type NavbarCardConfig = {
  routes: RouteItem[];
  template?: string;
  desktop?: {
    show_labels?: LabelVisibilityConfig;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: TemplatableBoolean;
  };
  mobile?: {
    show_labels?: LabelVisibilityConfig;
    hidden?: TemplatableBoolean;
  };
  styles?: string;
};
