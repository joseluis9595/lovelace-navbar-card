import { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

// Define the popup action specific to this card
export interface PopupActionConfig {
  action: 'open-popup';
}

// Extend ActionConfig to include our custom popup action
export type ExtendedActionConfig = ActionConfig | PopupActionConfig;

type JSTemplate = string;
type TemplatableBoolean = JSTemplate | boolean;
type TemplatableString = JSTemplate | boolean;

// Base properties shared by all route items
interface RouteItemBase {
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
export type PopupItem = RouteItemBase & {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
};

// Main route item type
export type RouteItem = RouteItemBase & {
  url?: string;
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
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
