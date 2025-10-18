import { html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { BaseRoute } from '@/components/navbar';
import { isTemplate, processTemplate } from '@/utils';
import { Color } from '@/components/color';

export class Icon {
  constructor(
    private _navbarCard: NavbarCard,
    private readonly _route: BaseRoute,
  ) {}

  public destroy(): void {
    // @ts-expect-error: This is a workaround to break the circular reference
    this._navbarCard = null;
    // @ts-expect-error: This is a workaround to break the circular reference
    this._route = null;
  }

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
      if (isTemplate(rawValue)) {
        return null;
      }
      return new Color(rawValue).rgbaString();
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
          style="--icon-primary-color: ${resolvedIconColor ?? 'inherit'}"
          icon="${isSelected && resolvedIconSelected
            ? resolvedIconSelected
            : resolvedIcon}"></ha-icon>`;
  }
}
