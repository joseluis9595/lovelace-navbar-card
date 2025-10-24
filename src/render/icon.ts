import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { PopupItem, RouteItem } from '../config';
import { isTemplate, processTemplate } from '../utils';
import { NavbarCard } from '../navbar-card';
import { Color } from '../color';

const getIconColor = (
  context: NavbarCard,
  route: RouteItem | PopupItem,
): string | null => {
  try {
    const rawValue = processTemplate<string>(
      context.hass,
      context,
      route.icon_color,
    );
    // If the template was not properly processed, return null
    if (isTemplate(rawValue)) {
      return null;
    }
    return new Color(rawValue).rgbaString();
  } catch (_err) {
    return null;
  }
};

export const renderIcon = (
  context: NavbarCard,
  route: RouteItem | PopupItem,
  isActive: boolean,
): TemplateResult => {
  const icon = processTemplate<string>(context.hass, context, route.icon);
  const iconColor = getIconColor(context, route);
  const image = processTemplate<string>(context.hass, context, route.image);
  const iconSelected = processTemplate<string>(
    context.hass,
    context,
    route.icon_selected,
  );
  const imageSelected = processTemplate<string>(
    context.hass,
    context,
    route.image_selected,
  );

  return image
    ? html`<img
        class="${classMap({
          image: true,
          active: isActive,
        })}"
        src="${isActive && imageSelected ? imageSelected : image}"
        alt="${ifDefined(route.label)}" />`
    : html`<ha-icon
        class="${classMap({
          icon: true,
          active: isActive,
        })}"
        style=${styleMap({
          '--icon-primary-color': iconColor ?? 'inherit',
        })}
        icon="${isActive && iconSelected ? iconSelected : icon}"></ha-icon>`;
};
