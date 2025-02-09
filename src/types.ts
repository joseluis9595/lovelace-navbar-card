import { ActionConfig } from 'custom-card-helpers';

export enum DesktopPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

export type RouteItem = {
  url: string;
  icon: string;
  icon_selected?: string;
  label?: string;
  badge?: {
    template?: string;
    color?: string;
  };
  tap_action?: ActionConfig;
};

export type NavbarCardConfig = {
  routes: RouteItem[];
  template?: string;
  desktop?: {
    show_labels?: boolean;
    min_width?: number;
    position?: DesktopPosition;
    hidden?: boolean;
  };
  mobile?: {
    show_labels?: boolean;
    hidden?: boolean;
  };
  styles?: string;
};
