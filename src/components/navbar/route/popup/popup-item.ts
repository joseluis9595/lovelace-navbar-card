import { html, TemplateResult } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { BaseRoute, Popup } from '@/components/navbar';
import { ActionEvents } from '@/components/action-events';
import { PopupItem as PopupItemDef } from '@/types';
import { preventEventDefault } from '@/utils';

export class PopupItem extends BaseRoute {
  private readonly _events = new ActionEvents();

  constructor(
    _navbarCard: NavbarCard,
    private readonly _parentPopup: Popup,
    _data: PopupItemDef,

    private readonly _index: number,
  ) {
    super(_navbarCard, _data);
  }

  public destroy(): void {
    this._events.destroy();
    super.destroy();
  }

  public closeParentPopup(): void {
    this._parentPopup.close();
  }

  public render(
    popupDirectionClassName: string,
    labelPositionClassName: string,
  ): TemplateResult | null {
    if (this.hidden) return null;

    const showLabelBackground = this._shouldShowLabelBackground();
    return html`<div
      class="
        popup-item
        ${popupDirectionClassName}
        ${labelPositionClassName}
        ${showLabelBackground ? 'popuplabelbackground' : ''}
        ${this.selected ? 'active' : ''}
      "
      style="--index: ${this._index}; ${this.selected_color
        ? `--navbar-primary-color: ${this.selected_color}`
        : ''}"
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
      <div class="button ${showLabelBackground ? 'popuplabelbackground' : ''}">
        ${this.icon.render()}
        <md-ripple></md-ripple>
        ${this.badge.render()}
        ${showLabelBackground && this.label
          ? html`<div class="label">${this.label}</div>`
          : html``}
      </div>
      ${!showLabelBackground && this.label
        ? html`<div class="label">${this.label}</div>`
        : html``}
    </div>`;
  }
}
