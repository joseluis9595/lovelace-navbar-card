import { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

type JSTemplate = string;

export type RouteItem = {
  url: string;
  icon: string;
  icon_selected?: string;
  label?: string | JSTemplate;
  badge?: {
    template?: string; // TODO deprecate
    color?: string;
    show?: boolean | JSTemplate;
  };
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  submenu?: PopupItem[];
  hidden?: boolean | JSTemplate;
  selected?: boolean | JSTemplate;
};

export type PopupItem = Omit<RouteItem, 'submenu' | 'icon_selected'>;

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
