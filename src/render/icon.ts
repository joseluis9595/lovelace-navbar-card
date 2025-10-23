import { PopupItem, RouteItem } from '../config';
import { html, TemplateResult } from 'lit';
import { processTemplate } from '../utils';
import { NavbarCard } from '../navbar-card';

export const renderIcon = (
  context: NavbarCard,
  route: RouteItem | PopupItem,
  isActive: boolean,
): TemplateResult => {
  const icon = processTemplate<string>(context.hass, context, route.icon);
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
        icon="${isActive && iconSelected ? iconSelected : icon}"></ha-icon>`;
};
