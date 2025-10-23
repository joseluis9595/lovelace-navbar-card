import { html, TemplateResult } from 'lit';
import { PopupItem, RouteItem } from '../config';
import { NavbarCard } from '../navbar-card';
import { processBadgeTemplate, processTemplate } from '../utils';
import { Color } from '../color';

export const renderBadge = (
  context: NavbarCard,
  route: RouteItem | PopupItem,
  isRouteActive: boolean,
): TemplateResult => {
  // Early return if no badge configuration
  if (!route.badge) {
    return html``;
  }

  // Cache template evaluations
  let showBadge = false;
  if (route.badge.show !== undefined) {
    showBadge = processTemplate<boolean>(
      context.hass,
      context,
      route.badge.show,
    );
  } else if (route.badge.template) {
    // TODO deprecate this
    showBadge = processBadgeTemplate(context.hass, route.badge.template);
  }

  if (!showBadge) {
    return html``;
  }

  const count =
    processTemplate<number | null>(context.hass, context, route.badge.count) ??
    null;
  const hasCount = count != null;

  const backgroundColor =
    processTemplate<string>(context.hass, context, route.badge.color) ?? 'red';
  const textColor = processTemplate<string>(
    context.hass,
    context,
    route.badge.text_color ?? route.badge.textColor, // TODO deprecate the camelCase property
  );

  // Only create Color object if textColor is not provided, using cached version
  const contrastingColor =
    textColor ?? Color.from(backgroundColor).contrastingColor().hex();

  return html`<div
    class="badge ${isRouteActive ? 'active' : ''} ${hasCount
      ? 'with-counter'
      : ''}"
    style="background-color: ${backgroundColor}; color: ${contrastingColor}">
    ${count}
  </div>`;
};
