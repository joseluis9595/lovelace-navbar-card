import { html, TemplateResult } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { PopupItem as PopupItemDef } from '@/config';
import { BaseRoute } from '@components/navbar';

export class PopupItem extends BaseRoute {
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
      @click=${(e: MouseEvent) => this._navbarCard.eventManager.handlePointerUp(e as PointerEvent, this)}>
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
