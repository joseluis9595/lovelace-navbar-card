import { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

export enum NavbarCustomActions {
  openPopup = 'open-popup',
  navigateBack = 'navigate-back',
  showNotifications = 'show-notifications',
  quickbar = 'quickbar',
  openEditMode = 'open-edit-mode',
  toggleMenu = 'toggle-menu',
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

// Auto padding configuration
export type AutoPaddingConfig = {
  enabled: boolean;
  desktop_px?: number;
  mobile_px?: number;
  media_player_px?: number;
};

// Media player configuration
type MediaPlayerConfig = {
  entity: JSTemplatable<string>;
  show?: JSTemplatable<boolean>;
  album_cover_background?: boolean;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
};

// Mobile mode configuration
export type MobileMode = 'floating' | 'docked';

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
    show_labels?: LabelVisibilityConfig;
    show_popup_label_backgrounds?: boolean;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: JSTemplatable<boolean>;
  };
  mobile?: {
    mode?: MobileMode;
    show_labels?: LabelVisibilityConfig;
    show_popup_label_backgrounds?: boolean;
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
      media_player_px: 100,
    },
    reflect_child_state: false,
  },
  desktop: {
    show_labels: false,
    show_popup_label_backgrounds: false,
    min_width: 768,
    position: DesktopPosition.bottom,
  },
  mobile: {
    show_labels: false,
    show_popup_label_backgrounds: false,
    mode: 'docked',
  },
};

export const STUB_CONFIG: NavbarCardConfig = {
  routes: [
    { url: window.location.pathname, icon: 'mdi:home', label: 'Home' },
    {
      url: `${window.location.pathname}/devices`,
      icon: 'mdi:devices',
      label: 'Devices',
      hold_action: {
        action: 'navigate',
        navigation_path: '/config/devices/dashboard',
      },
    },
    {
      url: '/config/automation/dashboard',
      icon: 'mdi:creation',
      label: 'Automations',
    },
    { url: '/config/dashboard', icon: 'mdi:cog', label: 'Settings' },
    {
      icon: 'mdi:dots-horizontal',
      label: 'More',
      tap_action: {
        action: NavbarCustomActions.openPopup,
      },
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
            service: 'homeassistant.restart',
            service_data: {},
            confirmation: {
              text: 'Are you sure you want to restart Home Assistant?',
            },
          },
        },
      ],
    },
  ],
};
