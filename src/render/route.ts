import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { RouteItem } from '../config';
import { NavbarCard } from '../navbar-card';
import { processTemplate } from '../utils';
import { renderIcon } from './icon';
import { renderBadge } from './badge';
import { shouldShowLabels } from '../logic/labels';
import { eventDetection } from '../logic/event-detection';

/**
 * Render route item
 */
export const renderRoute = (
  context: NavbarCard,
  route: RouteItem,
): TemplateResult => {
  const isHidden = processTemplate<boolean>(
    context.hass,
    context,
    route.hidden,
  );
  if (isHidden) {
    return html``;
  }

  const isSelectedProp =
    route.selected != null
      ? processTemplate<boolean>(context.hass, context, route.selected)
      : window.location.pathname == route.url;

  const selectedColor = processTemplate<string>(
    context.hass,
    context,
    route.selected_color,
  );

  const isSelfOrChildSelected =
    context.config?.layout?.reflect_child_state && !isSelectedProp
      ? // TODO this is a problem. if popupItem.selected is a string template, this will return true
        (route.popup?.some(popupItem => popupItem.selected) ?? false)
      : isSelectedProp;

  // Cache label processing
  const label = shouldShowLabels(context, false)
    ? (processTemplate<string>(context.hass, this, route.label) ?? null)
    : null;

  return html`
    <div
      class="${classMap({
        route: true,
        active: isSelfOrChildSelected,
      })}"
      ${eventDetection({
        context,
        route,
        tap: route.tap_action ?? {
          action: 'navigate',
          navigation_path: route.url ?? '',
        },
        hold: route.hold_action,
        doubleTap: route.double_tap_action,
      })}>
      <div
        class="${classMap({
          button: true,
          active: isSelfOrChildSelected,
        })}"
        style=${styleMap({
          '--navbar-primary-color': selectedColor,
        })}>
        ${renderIcon(context, route, isSelfOrChildSelected)}
        ${renderBadge(context, route, isSelfOrChildSelected)}
        <ha-ripple></ha-ripple>
      </div>

      ${label
        ? html`<div
            class="${classMap({
              label: true,
              active: isSelfOrChildSelected,
            })}">
            ${label}
          </div>`
        : html``}
    </div>
  `;
};
