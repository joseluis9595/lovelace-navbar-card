import { ActionConfig } from 'custom-card-helpers';

export type RippleElement = Element & {
  hovered?: boolean;
  pressed?: boolean;
};

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
type JSTemplatable<T> = JSTemplate | T;

// Base properties shared by all route items
type RouteItemBase = {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
  icon?: string;
  image?: string;
  icon_selected?: string;
  image_selected?: string;
  label?: JSTemplatable<string>;
  badge?: {
    template?: string; // TODO deprecate
    color?: JSTemplatable<string>;
    show?: JSTemplatable<boolean>;
    count?: JSTemplatable<number>;
    textColor?: JSTemplatable<string>;
  };
  hidden?: JSTemplatable<boolean>;
  selected?: JSTemplatable<boolean>;
};

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

// Haptic configuration
export type HapticConfig = {
  url?: boolean;
  tap_action?: boolean;
  hold_action?: boolean;
  double_tap_action?: boolean;
};

// Main card configuration
export type NavbarCardConfig = {
  routes: RouteItem[];
  template?: string;
  desktop?: {
    show_labels?: LabelVisibilityConfig;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: JSTemplatable<boolean>;
  };
  mobile?: {
    show_labels?: LabelVisibilityConfig;
    hidden?: JSTemplatable<boolean>;
  };
  styles?: string;
  haptic?: boolean | HapticConfig;
};
