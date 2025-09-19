import { html, TemplateResult } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { BaseRoute } from '@/components/navbar';
import { ActionEvents } from '@/components/action-events';
import { PopupItem as PopupItemDef } from '@/types';

export class PopupItem extends BaseRoute {
  private readonly _events = new ActionEvents();

  constructor(
    _navbarCard: NavbarCard,
    _data: PopupItemDef,

    private readonly _index: number,
  ) {
    super(_navbarCard, _data);
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
        ${this.selected ? 'active' : ''}
      "
      style="--index: ${this._index}"
      @pointerup=${(e: MouseEvent) => this._events.handlePointerUp(e as unknown as PointerEvent, this)}
      @pointerdown=${(e: MouseEvent) => this._events.handlePointerDown(e as unknown as PointerEvent, this)}>
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
