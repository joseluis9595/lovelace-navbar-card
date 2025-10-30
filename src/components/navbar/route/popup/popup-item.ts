import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { NavbarCard } from '@/navbar-card';
import { BaseRoute, Popup } from '@/components/navbar';
import { PopupItem as PopupItemDef } from '@/types';
import { eventDetection } from '@/lib/event-detection';

export class PopupItem extends BaseRoute {
  constructor(
    _navbarCard: NavbarCard,
    private readonly _parentPopup: Popup,
    _data: PopupItemDef,

    private readonly _index: number,
  ) {
    super(_navbarCard, _data);
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
      class=${classMap({
        'popup-item': true,
        [popupDirectionClassName]: true,
        [labelPositionClassName]: true,
        popuplabelbackground: showLabelBackground,
        active: this.selected,
      })}
      style=${styleMap({
        '--index': this._index,
      })}
      ${eventDetection({
        context: this._navbarCard,
        popupItem: this,
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
          popuplabelbackground: showLabelBackground,
        })}>
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
