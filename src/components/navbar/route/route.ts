import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { NavbarCard } from '@/navbar-card';
import { Popup, BaseRoute } from '@/components/navbar';
import { PopupItem, RouteItem } from '@/types';
import { processTemplate } from '@/utils';
import { eventDetection } from '@/lib/event-detection';

export class Route extends BaseRoute {
  private _popupInstance?: Popup;

  constructor(
    _navbarCard: NavbarCard,
    private readonly _routeData: RouteItem,
  ) {
    super(_navbarCard, _routeData);
    this._validateRoute();
  }

  get popup(): Popup {
    return (this._popupInstance ??= new Popup(
      this._navbarCard,
      processTemplate<PopupItem[]>(
        this._navbarCard._hass,
        this._navbarCard,
        this._routeData.popup,
      ) ??
        this._routeData.popup ??
        this._routeData.submenu ??
        [],
    ));
  }

  get isSelfOrChildActive(): boolean {
    // If the route is not active, check if any of its children are active (if configured to do so)
    if (
      this._navbarCard.config?.layout?.reflect_child_state &&
      !this.selected
    ) {
      return this.popup.items.some(item => item.selected);
    }

    return this.selected;
  }

  public render(): TemplateResult | null {
    if (this.hidden) return null;

    const isActive = this.isSelfOrChildActive;

    return html`
      <div
        class=${classMap({
          route: true,
          active: isActive,
        })}
        style=${styleMap({
          '--navbar-primary-color': this.selected_color ?? null,
        })}
        ${eventDetection({
          context: this._navbarCard,
          route: this,
          tap: this.tap_action ?? {
            action: 'navigate',
            navigation_path: this.url ?? '',
          },
          hold: this.hold_action,
          doubleTap: this.double_tap_action,
        })}>
        <div
          class=${classMap({
            button: true,
            active: isActive,
          })}
          style=${styleMap({
            '--navbar-primary-color': this.selected_color ?? null,
          })}>
          ${this.icon.render()}
          <ha-ripple></ha-ripple>
          ${this.badge.render()}
        </div>
        ${this.label
          ? html`<div
              class=${classMap({
                label: true,
                active: isActive,
              })}>
              ${this.label}
            </div>`
          : html``}
      </div>
    `;
  }

  private _validateRoute(): void {
    if (!this.data.icon && !this.data.image) {
      throw new Error(
        'Each route must have either an "icon" or "image" property configured',
      );
    }

    if (
      !this._routeData.popup &&
      !this.tap_action &&
      !this.hold_action &&
      !this.url &&
      !this.double_tap_action
    ) {
      throw new Error(
        'Each route must have at least one actionable property (url, popup, tap_action, hold_action, double_tap_action)',
      );
    }

    if (this.tap_action && !this.tap_action.action) {
      throw new Error('"tap_action" must have an "action" property');
    }
    if (this.hold_action && !this.hold_action.action) {
      throw new Error('"hold_action" must have an "action" property');
    }
    if (this.double_tap_action && !this.double_tap_action.action) {
      throw new Error('"double_tap_action" must have an "action" property');
    }
  }
}
