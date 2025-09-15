import { html, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { NavbarCard } from '@/navbar-card';
import { NavbarCardConfig, PopupItem as PopupItemDef } from '@/config';
import { BaseRoute } from '../base-route';

export class PopupItem extends BaseRoute {
  constructor(
    _navbarCard: NavbarCard,
    _data: PopupItemDef,

    private readonly index: number,
  ) {
    super(_navbarCard, _data);
  }

  public render(): TemplateResult | null {
    if (this.isHidden) return null;

    const showLabelBackground = this._shouldShowLabelBackground();
    return html`<div
      class="
              popup-item 
              ${popupDirectionClassName}
              ${labelPositionClassName}
              ${this.isActive ? 'active' : ''}
              "
      style="--index: ${this.index}"
      @click=${(e: MouseEvent) =>
        this._handlePointerUp(e as PointerEvent, this, true)}>
      <div class="button ${showLabelBackground ? 'popuplabelbackground' : ''}">
        ${this._getRouteIcon(this, this.isActive)}
        <md-ripple></md-ripple>
        ${this._renderBadge(this, false)}
        ${showLabelBackground && this.processedLabel
          ? html`<div class="label">${this.processedLabel}</div>`
          : html``}
      </div>
      ${!showLabelBackground && this.processedLabel
        ? html`<div class="label">${this.processedLabel}</div>`
        : html``}
    </div>`;
  }
}
