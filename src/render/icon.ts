import { PopupItem, RouteItem } from '../config';
import { html, TemplateResult } from 'lit';
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
        class="image ${isActive ? 'active' : ''}"
        src="${isActive && imageSelected ? imageSelected : image}"
        alt="${route.label || ''}" />`
    : html`<ha-icon
        class="icon ${isActive ? 'active' : ''}"
        style="--icon-primary-color: ${iconColor ?? 'inherit'}"
        icon="${isActive && iconSelected ? iconSelected : icon}"></ha-icon>`;
};
