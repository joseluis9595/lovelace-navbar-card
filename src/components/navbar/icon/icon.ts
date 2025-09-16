import { html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { BaseRoute } from '@components/navbar';
import { processTemplate } from '@utils';

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
    const isSelected = this._route.selected;
    const resolvedImage = this.image;
    const resolvedImageSelected = this.imageSelected;
    const resolvedIcon = this.icon;
    const resolvedIconSelected = this.iconSelected;

    // If neither image nor icon resolve to a value, render nothing
    if (!resolvedImage && !resolvedIcon) {
      return html``;
    }

    return resolvedImage
      ? html` <img
          class="image ${isSelected ? 'active' : ''}"
          src="${isSelected && resolvedImageSelected
            ? resolvedImageSelected
            : resolvedImage}"
          alt="${this._route.label || ''}" />`
      : html` <ha-icon
          class="icon ${isSelected ? 'active' : ''}"
          icon="${isSelected && resolvedIconSelected
            ? resolvedIconSelected
            : resolvedIcon}"></ha-icon>`;
  }
}
