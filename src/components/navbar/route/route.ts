import { html, TemplateResult } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { PopupItem, RouteItem } from '@/config';
import { processTemplate } from '@/utils';
import { Popup } from './popup/popup';
import { BaseRoute } from './base-route';

export class Route extends BaseRoute {
  constructor(
    _navbarCard: NavbarCard,
    private readonly _routeData: RouteItem,

    private _popupInstance?: Popup,
  ) {
    super(_navbarCard, _routeData);
    this._validateRoute();
  }

  get popup(): Popup {
    return this._popupInstance ??= new Popup(
      this._navbarCard,
      processTemplate<PopupItem[]>(
        this._navbarCard._hass,
        this._navbarCard,
        this._routeData.popup,
      ) ??
        this._routeData.popup ??
        this._routeData.submenu ??
        [],
    );
  }

  get isSelfOrChildActive(): boolean {
    // If the route is not active, check if any of its children are active (if configured to do so)
    if (this._navbarCard.config?.reflect_child_state && !this.selected) {
      return this.popup.items.some(item => item.selected);
    }

    return this.selected;
  }

  public render(): TemplateResult | null {
    if (this.hidden) return null;

    const isActive = this.isSelfOrChildActive;

    return html`
      <div
        class="route ${isActive ? 'active' : ''}"
        @mouseenter=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handleMouseEnter(e, this)}
        @mousemove=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handleMouseMove(e, this)}
        @mouseleave=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handleMouseLeave(e, this)}
        @pointerdown=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handlePointerDown(e, this)}
        @pointermove=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handlePointerMove(e, this)}
        @pointerup=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handlePointerUp(e, this)}
        @pointercancel=${(e: PointerEvent) =>
          this._navbarCard.eventManager.handlePointerMove(e, this)}>
        <div class="button ${isActive ? 'active' : ''}">
          ${this.icon.render()}
          <ha-ripple></ha-ripple>
        </div>
        ${this.label
          ? html`<div class="label ${isActive ? 'active' : ''}">
              ${this.label}
            </div>`
          : html``}
        ${this.badge.render()}
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
