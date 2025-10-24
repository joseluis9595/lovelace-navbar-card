import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { PopupItem } from '../config';
import { NavbarCard } from '../navbar-card';
import { processTemplate } from '../utils';
import { renderBadge } from './badge';
import { renderIcon } from './icon';
import { eventDetection } from '../logic/event-detection';

export const renderPopupItem = (
  context: NavbarCard,
  popupItem: PopupItem,
  index: number,
  popupDirectionClassName: string,
  labelPositionClassName: string,
  showLabelBackground: boolean,
  showLabels: boolean,
): TemplateResult => {
  const isActive =
    popupItem.selected != null
      ? processTemplate<boolean>(context.hass, context, popupItem.selected)
      : window.location.pathname == popupItem.url;
  const isHidden = processTemplate<boolean>(
    context.hass,
    context,
    popupItem.hidden,
  );
  if (isHidden) {
    return html``;
  }

  const label = showLabels
    ? (processTemplate<string>(context.hass, context, popupItem.label) ?? ' ')
    : null;

  return html`<div
    class="${classMap({
      'popup-item': true,
      [popupDirectionClassName]: !!popupDirectionClassName,
      [labelPositionClassName]: !!labelPositionClassName,
      active: isActive,
      popuplabelbackground: showLabelBackground,
    })}"
    style="--index: ${index}"
    ${eventDetection({
      context,
      popupItem,
      tap: popupItem.tap_action ?? {
        action: 'navigate',
        navigation_path: popupItem.url ?? '',
      },
      hold: popupItem.hold_action,
      doubleTap: popupItem.double_tap_action,
    })}>
    <div
      class="${classMap({
        button: true,
        popuplabelbackground: showLabelBackground,
      })}">
      ${renderIcon(context, popupItem, isActive)}
      <md-ripple></md-ripple>
      ${renderBadge(context, popupItem, false)}
      ${showLabelBackground && label
        ? html`<div class="label">${label}</div>`
        : html``}
    </div>
    ${!showLabelBackground && label
      ? html`<div class="label">${label}</div>`
      : html``}
  </div>`;
};
