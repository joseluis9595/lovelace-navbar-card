import type { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

export enum WidgetPosition {
  topLeft = 'top-left',
  topCenter = 'top-center',
  topRight = 'top-right',
  bottomLeft = 'bottom-left',
  bottomCenter = 'bottom-center',
  bottomRight = 'bottom-right',
}

export enum NavbarCustomActions {
  openPopup = 'open-popup',
  navigateBack = 'navigate-back',
  showNotifications = 'show-notifications',
  quickbar = 'quickbar',
  openEditMode = 'open-edit-mode',
  toggleMenu = 'toggle-menu',
  logout = 'logout',
  customJSAction = 'custom-js-action',
}

// Custom navbar-card actions
type PopupActionConfig = {
  action: NavbarCustomActions.openPopup;
};
type ToggleMenuActionConfig = {
  action: NavbarCustomActions.toggleMenu;
};
type NavigateBackActionConfig = {
  action: NavbarCustomActions.navigateBack;
};
type ShowNotificationsActionConfig = {
  action: NavbarCustomActions.showNotifications;
};
export type QuickbarActionConfig = {
  action: NavbarCustomActions.quickbar;
  mode?: 'commands' | 'devices' | 'entities';
};
type OpenEditModeActionConfig = {
  action: NavbarCustomActions.openEditMode;
};
type LogoutActionConfig = {
  action: NavbarCustomActions.logout;
};
type CustomJSActionConfig = {
  action: NavbarCustomActions.customJSAction;
  code: JSTemplate;
};

// Extend ActionConfig to include our custom popup action
export type ExtendedActionConfig =
  | ActionConfig
  | ToggleMenuActionConfig
  | PopupActionConfig
  | NavigateBackActionConfig
  | ShowNotificationsActionConfig
  | QuickbarActionConfig
  | OpenEditModeActionConfig
  | LogoutActionConfig
  | CustomJSActionConfig;

type JSTemplate = string;
type JSTemplatable<T> = JSTemplate | T;

// Base properties shared by all route items
export type RouteItemBase = {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
  icon?: JSTemplatable<string>;
  icon_color?: JSTemplatable<string>;
  icon_selected?: JSTemplatable<string>;
  image?: JSTemplatable<string>;
  image_selected?: JSTemplatable<string>;
  label?: JSTemplatable<string>;
  badge?: {
    template?: string; // TODO deprecate
    color?: JSTemplatable<string>;
    show?: JSTemplatable<boolean>;
    count?: JSTemplatable<number>;
    textColor?: JSTemplatable<string>; // TODO deprecate
    text_color?: JSTemplatable<string>;
  };
  hidden?: JSTemplatable<boolean>;
  selected?: JSTemplatable<boolean>;
  selected_color?: JSTemplatable<string>;
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

// Auto padding configuration
export type AutoPaddingConfig = {
  enabled: boolean;
  desktop_px?: number;
  mobile_px?: number;
  media_player_px?: number;
};

// Media player configuration
type MediaPlayerConfig = {
  entity?: JSTemplatable<string>;
  show?: JSTemplatable<boolean>;
  album_cover_background?: boolean;
  desktop_position?: WidgetPosition;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
};

// Display mode configuration
export type NavbarDisplayMode = 'floating' | 'docked';

// Main card configuration
export type NavbarCardConfig = {
  routes: RouteItem[];
  media_player?: MediaPlayerConfig;
  template?: string;
  layout?: {
    auto_padding?: AutoPaddingConfig;
    reflect_child_state?: boolean;
  };
  desktop?: {
    mode?: NavbarDisplayMode;
    show_labels?: LabelVisibilityConfig;
    show_popup_label_backgrounds?: boolean;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: JSTemplatable<boolean>;
  };
  mobile?: {
    mode?: NavbarDisplayMode;
    show_labels?: LabelVisibilityConfig;
    show_popup_label_backgrounds?: boolean;
    hidden?: JSTemplatable<boolean>;
  };
  styles?: string;
  haptic?: boolean | HapticConfig;
};

export const DEFAULT_NAVBAR_CONFIG = {
  desktop: {
    min_width: 768,
    mode: 'floating',
    position: DesktopPosition.bottom,
    show_labels: false,
    show_popup_label_backgrounds: false,
  },
  haptic: {
    double_tap_action: true,
    hold_action: true,
    tap_action: false,
    url: false,
  },
  layout: {
    auto_padding: {
      desktop_px: 100,
      enabled: true,
      media_player_px: 100,
      mobile_px: 80,
    },
    reflect_child_state: false,
  },
  media_player: {
    album_cover_background: false,
    desktop_position: WidgetPosition.bottomCenter,
  },
  mobile: {
    mode: 'docked',
    show_labels: false,
    show_popup_label_backgrounds: false,
  },
  routes: [],
  template: undefined,
} as const satisfies NavbarCardConfig;

export const STUB_CONFIG: NavbarCardConfig = {
  routes: [
    { icon: 'mdi:home', label: 'Home', url: window.location.pathname },
    {
      hold_action: {
        action: 'navigate',
        navigation_path: '/config/devices/dashboard',
      },
      icon: 'mdi:devices',
      label: 'Devices',
      url: `${window.location.pathname}/devices`,
    },
    {
      icon: 'mdi:creation',
      label: 'Automations',
      url: '/config/automation/dashboard',
    },
    { icon: 'mdi:cog', label: 'Settings', url: '/config/dashboard' },
    {
      icon: 'mdi:dots-horizontal',
      label: 'More',
      popup: [
        { icon: 'mdi:cog', url: '/config/dashboard' },
        {
          icon: 'mdi:hammer',
          url: '/developer-tools/yaml',
        },
        {
          icon: 'mdi:power',
          tap_action: {
            action: 'call-service',
            confirmation: {
              text: 'Are you sure you want to restart Home Assistant?',
            },
            service: 'homeassistant.restart',
            service_data: {},
          },
        },
      ],
      tap_action: {
        action: NavbarCustomActions.openPopup,
      },
    },
  ],
};
