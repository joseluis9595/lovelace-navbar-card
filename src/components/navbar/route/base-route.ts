import { Badge, Icon, PopupItem } from '@/components/navbar';
import type { ActionableElement } from '@/lib/event-detection';
import type { NavbarCard } from '@/navbar-card';
import type { RouteItemBase } from '@/types';
import { processTemplate } from '@/utils';

export class BaseRoute implements ActionableElement {
  private _iconInstance?: Icon;
  private _badgeInstance?: Badge;

  constructor(
    protected _navbarCard: NavbarCard,
    public readonly data: RouteItemBase,
  ) {}

  get url() {
    return this.data.url;
  }

  get icon() {
    return (this._iconInstance ??= new Icon(this._navbarCard, this));
  }

  get badge() {
    return (this._badgeInstance ??= new Badge(this._navbarCard, this));
  }

  get selected_color(): string | null {
    return processTemplate<string | null>(
      this._navbarCard._hass,
      this._navbarCard,
      this.data.selected_color,
      { returnNullIfInvalid: true },
    );
  }

  get label(): string | null {
    if (!this._shouldShowLabels()) return null;
    return (
      processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this.data.label,
      ) ?? ' '
    );
  }

  get hidden() {
    return processTemplate<boolean>(
      this._navbarCard._hass,
      this._navbarCard,
      this.data.hidden,
    );
  }

  get selected() {
    return this.data.selected != null
      ? processTemplate<boolean>(
          this._navbarCard._hass,
          this._navbarCard,
          this.data.selected,
        )
      : window.location.pathname === this.url;
  }

  get tap_action() {
    return this.data.tap_action;
  }

  get hold_action() {
    return this.data.hold_action;
  }

  get double_tap_action() {
    return this.data.double_tap_action;
  }

  protected _shouldShowLabels = (): boolean => {
    const config = this._navbarCard.isDesktop
      ? this._navbarCard.config?.desktop?.show_labels
      : this._navbarCard.config?.mobile?.show_labels;

    if (typeof config === 'boolean') return config;

    return (
      (config === 'popup_only' && this instanceof PopupItem) ||
      (config === 'routes_only' && !(this instanceof PopupItem))
    );
  };

  protected _shouldShowLabelBackground = (): boolean => {
    const enabled = this._navbarCard.isDesktop
      ? this._navbarCard.config?.desktop?.show_popup_label_backgrounds
      : this._navbarCard.config?.mobile?.show_popup_label_backgrounds;
    return !!enabled;
  };
}
