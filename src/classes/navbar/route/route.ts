import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { NavbarCard } from '@/navbar-card';
import { NavbarCardConfig, PopupItem, RouteItem } from '@/config';
import { processTemplate } from '@/utils';
import { Popup } from './popup/popup';
import { BaseRoute } from './base-route';

export class Route extends BaseRoute {
  constructor(
    _navbarCard: NavbarCard,
    private readonly _routeData: RouteItem,

    // Cache for computed properties
    private _cachedPopup?: Popup,
  ) {
    super(_hass, _config, _navbarCard, _routeData);
    this._validateRoute();
  }

  get popup(): Popup {
    return (this._cachedPopup ??= new Popup(
      this._hass,
      this._config,
      this._navbarCard,
      processTemplate<PopupItem[]>(
        this._hass,
        this._navbarCard,
        this._routeData.popup,
      ) ??
        this._routeData.popup ??
        this._routeData.submenu ??
        [],
    ));
  }

  get isSelfOrChildActive(): boolean {
    // TODO: Add configuration option to control this behavior
    if (this.isActive) return true;
    if (this.popup && this.popup.popupItems.some((item) => item.isActive))
      return true;
    return false;
  }

  public render(): TemplateResult | null {
    if (this.isHidden) return null;

    return html`
      <div
        class="route ${this.isSelfOrChildActive ? 'active' : ''}"
        @mouseenter=${(e: PointerEvent) => this._handleMouseEnter(e, this)}
        @mousemove=${(e: PointerEvent) => this._handleMouseMove(e, this)}
        @mouseleave=${(e: PointerEvent) => this._handleMouseLeave(e, this)}
        @pointerdown=${(e: PointerEvent) => this._handlePointerDown(e, this)}
        @pointermove=${(e: PointerEvent) => this._handlePointerMove(e, this)}
        @pointerup=${(e: PointerEvent) => this._handlePointerUp(e, this)}
        @pointercancel=${(e: PointerEvent) => this._handlePointerMove(e, this)}>
        <div class="button ${this.isSelfOrChildActive ? 'active' : ''}">
          ${this._getRouteIcon(this, this.isSelfOrChildActive)}
          <ha-ripple></ha-ripple>
        </div>
        ${this.label
          ? html`<div class="label ${this.isSelfOrChildActive ? 'active' : ''}">
              ${this.label}
            </div>`
          : html``}
        ${this._renderBadge(this, this.isSelfOrChildActive)}
      </div>
    `;
  }

  private _validateRoute(): void {
    if (!this.icon && !this.image) {
      throw new Error(
        'Each route must have either an "icon" or "image" property configured',
      );
    }

    if (
      !this.popup &&
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
