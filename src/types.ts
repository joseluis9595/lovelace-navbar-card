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

// Base properties shared by all route items
interface RouteItemBase {
  icon?: string;
  image?: string;
  icon_selected?: string;
  image_selected?: string;
  label?: string | JSTemplate;
  badge?: {
    template?: string; // TODO deprecate
    color?: string;
    show?: boolean | JSTemplate;
  };
  hidden?: boolean | JSTemplate;
  selected?: boolean | JSTemplate;
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

export type NavbarCardConfig = {
  routes: RouteItem[];
  template?: string;
  desktop?: {
    show_labels?: boolean;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: boolean | JSTemplate;
  };
  mobile?: {
    show_labels?: boolean;
    hidden?: boolean | JSTemplate;
  };
  styles?: string;
};
