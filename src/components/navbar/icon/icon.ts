import { html } from 'lit';
import { BaseRoute } from '@components';
import { NavbarCard } from '@/navbar-card';
import { processTemplate } from '@/utils';

export class Icon {
  constructor(
    private _navbarCard: NavbarCard,
    private readonly _route: BaseRoute,
  ) {}

  get icon(): string {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._route.data.icon,
    );
  }

  get image(): string {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._route.data.image,
    );
  }

  /** ha-icon variant for selected state */
  get iconSelected(): string {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._route.data.icon_selected,
    );
  }

  /** Image variant for selected state */
  get imageSelected(): string {
    return processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._route.data.image_selected,
    );
  }

  public render() {
    return this.image
      ? html` <img
          class="image ${this._route.selected ? 'active' : ''}"
          src="${this._route.selected && this.imageSelected
            ? this.imageSelected
            : this.image}"
          alt="${this._route.label || ''}" />`
      : html` <ha-icon
          class="icon ${this._route.selected ? 'active' : ''}"
          icon="${this._route.selected && this.iconSelected
            ? this.iconSelected
            : this.icon}"></ha-icon>`;
  }
}
