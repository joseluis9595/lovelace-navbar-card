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
type ShowNotificationsActionConfig = {
  action: 'show-notifications';
};
export type QuickbarActionConfig = {
  action: 'quickbar';
  mode?: 'commands' | 'devices' | 'entities';
};
type OpenEditModeActionConfig = {
  action: 'open-edit-mode';
};

// Extend ActionConfig to include our custom popup action
export type ExtendedActionConfig =
  | ActionConfig
  | PopupActionConfig
  | NavigateBackActionConfig
  | ShowNotificationsActionConfig
  | QuickbarActionConfig
  | OpenEditModeActionConfig;

type JSTemplate = string;
type JSTemplatable<T> = JSTemplate | T;

// Base properties shared by all route items
type RouteItemBase = {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
  icon?: JSTemplatable<string>;
  image?: JSTemplatable<string>;
  icon_selected?: JSTemplatable<string>;
  image_selected?: JSTemplatable<string>;
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
export type LabelVisibilityConfig = boolean | 'popup_only' | 'routes_only';

// Haptic configuration
export type HapticConfig = {
  url?: boolean;
  tap_action?: boolean;
  hold_action?: boolean;
  double_tap_action?: boolean;
};

export type AutoPaddingConfig = {
  enabled: boolean;
  desktop_px?: number;
  mobile_px?: number;
};

// Main card configuration
export type NavbarCardConfig = {
  routes: RouteItem[];
  template?: string;
  layout?: {
    auto_padding?: AutoPaddingConfig;
  };
  desktop?: {
    show_labels?: LabelVisibilityConfig;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: JSTemplatable<boolean>;
  };
  mobile?: {
    mode?: 'floating' | 'docked';
    show_labels?: LabelVisibilityConfig;
    hidden?: JSTemplatable<boolean>;
  };
  styles?: string;
  haptic?: boolean | HapticConfig;
};

export const DEFAULT_NAVBAR_CONFIG: NavbarCardConfig = {
  routes: [],
  template: undefined,
  layout: {
    auto_padding: {
      enabled: true,
      desktop_px: 100,
      mobile_px: 80,
    },
  },
  desktop: {
    show_labels: false,
    min_width: 768,
    position: DesktopPosition.bottom,
  },
  mobile: {
    show_labels: false,
    mode: 'docked',
  },
};
