import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { BaseRoute, type Popup } from '@/components/navbar';
import { eventDetection } from '@/lib/event-detection';
import type { NavbarCard } from '@/navbar-card';
import type { PopupItem as PopupItemDef } from '@/types';

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
        active: this.selected,
        popuplabelbackground: showLabelBackground,
      })}
      style=${styleMap({
        '--index': this._index,
      })}
      ${eventDetection({
        context: this._navbarCard,
        doubleTap: this.double_tap_action,
        hold: this.hold_action,
        popupItem: this,
        tap: this.tap_action ?? {
          action: 'navigate',
          navigation_path: this.url ?? '',
        },
      })}>
      <div
        class=${classMap({
          button: true,
          popuplabelbackground: showLabelBackground,
        })}>
        ${this.icon.render()}
        <md-ripple></md-ripple>
        ${this.badge.render()}
        ${
          showLabelBackground && this.label
            ? html`<div class="label">${this.label}</div>`
            : html``
        }
      </div>
      ${
        !showLabelBackground && this.label
          ? html`<div class="label">${this.label}</div>`
          : html``
      }
    </div>`;
  }
}
