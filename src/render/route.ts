import { html, TemplateResult } from 'lit';
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
  // Cache template evaluations to avoid redundant processing
  const isActive =
    route.selected != null
      ? processTemplate<boolean>(context.hass, context, route.selected)
      : window.location.pathname == route.url;

  const selectedColor = processTemplate<string>(
    context.hass,
    context,
    route.selected_color,
  );

  const isHidden = processTemplate<boolean>(
    context.hass,
    context,
    route.hidden,
  );
  if (isHidden) {
    return html``;
  }

  // Cache label processing
  const label = shouldShowLabels(context, false)
    ? (processTemplate<string>(context.hass, this, route.label) ?? null)
    : null;

  return html`
    <div
      class="route ${isActive ? 'active' : ''}"
      ${eventDetection({
        context,
        route,
        // TODO review if this fallback tap_action should be handled inside the eventDetection directive
        tap: route.tap_action ?? {
          action: 'navigate',
          navigation_path: route.url ?? '',
        },
        hold: route.hold_action,
        doubleTap: route.double_tap_action,
      })}>
      <div
        class="button ${isActive ? 'active' : ''}"
        style=${selectedColor
          ? `--navbar-primary-color: ${selectedColor}`
          : ''}>
        ${renderIcon(context, route, isActive)}
        <ha-ripple></ha-ripple>
      </div>

      ${label
        ? html`<div class="label ${isActive ? 'active' : ''}">${label}</div>`
        : html``}
      ${renderBadge(context, route, isActive)}
    </div>
  `;
};
