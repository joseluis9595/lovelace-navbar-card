import { html, TemplateResult } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { Popup, BaseRoute } from '@/components/navbar';
import { PopupItem, RouteItem } from '@/types';
import { preventEventDefault, processTemplate } from '@/utils';
import { ActionEvents } from '@/components/action-events';

export class Route extends BaseRoute {
  private readonly _events = new ActionEvents();
  private _popupInstance?: Popup;

  constructor(
    _navbarCard: NavbarCard,
    private readonly _routeData: RouteItem,
  ) {
    super(_navbarCard, _routeData);
    this._validateRoute();
  }

  public destroy(): void {
    this._events.destroy?.();

    if (this._popupInstance) {
      this._popupInstance.destroy?.();
      this._popupInstance = undefined;
    }

    // @ts-expect-error: This is a workaround to break the circular reference
    this._navbarCard = undefined;

    super.destroy?.();
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
        class="route ${isActive ? 'active' : ''}"
        @click=${preventEventDefault}
        @mouseenter=${(e: MouseEvent) => this._events.handleMouseEnter(e, this)}
        @mousemove=${(e: MouseEvent) => this._events.handleMouseMove(e, this)}
        @mouseleave=${(e: MouseEvent) => this._events.handleMouseLeave(e, this)}
        @pointerdown=${(e: PointerEvent) =>
          this._events.handlePointerDown(e, this)}
        @pointermove=${(e: PointerEvent) =>
          this._events.handlePointerMove(e, this)}
        @pointerup=${(e: PointerEvent) => this._events.handlePointerUp(e, this)}
        @pointercancel=${(e: PointerEvent) =>
          this._events.handlePointerMove(e, this)}>
        <div
          class="button ${isActive ? 'active' : ''}"
          style=${this.selected_color
            ? `--navbar-primary-color: ${this.selected_color}`
            : ''}>
          ${this.icon.render()}
          <ha-ripple></ha-ripple>
          ${this.badge.render()}
        </div>
        ${this.label
          ? html`<div class="label ${isActive ? 'active' : ''}">
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
