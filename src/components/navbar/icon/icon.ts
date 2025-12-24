import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import { isColor } from '@/components/color';
import type { BaseRoute } from '@/components/navbar';
import type { NavbarCard } from '@/navbar-card';
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

  get iconColor(): string | null {
    try {
      const rawValue = processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.icon_color,
      );
      // If the template was not properly processed, return null
      if (!isColor(rawValue)) return null;
      return rawValue;
    } catch (_err) {
      return null;
    }
  }

  public render() {
    const isSelected = this._route.selected;
    const resolvedImage = this.image;
    const resolvedImageSelected = this.imageSelected;
    const resolvedIcon = this.icon;
    const resolvedIconSelected = this.iconSelected;
    const resolvedIconColor = this.iconColor;

    // If neither image nor icon resolve to a value, render nothing
    if (!(resolvedImage || resolvedIcon)) {
      return html``;
    }

    return resolvedImage
      ? html` <img
          class=${classMap({
            active: isSelected,
            image: true,
          })}
          src="${
            isSelected && resolvedImageSelected
              ? resolvedImageSelected
              : resolvedImage
          }"
          alt="${this._route.label || ''}" />`
      : html` <ha-icon
          class=${classMap({
            active: isSelected,
            icon: true,
          })}
          style="--icon-primary-color: ${resolvedIconColor ?? 'inherit'}"
          icon="${
            isSelected && resolvedIconSelected
              ? resolvedIconSelected
              : resolvedIcon
          }"></ha-icon>`;
  }
}
