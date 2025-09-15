import { html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { Color } from '@components';
import { BaseRoute } from '@components/navbar';
import { processBadgeTemplate, processTemplate } from '@/utils';

export class Badge {
  constructor(
    private _navbarCard: NavbarCard,
    private readonly _route: BaseRoute,
  ) {}

  get show(): boolean {
    const badge = this._route.data.badge;
    if (!badge) return false;

    if (badge.show) {
      return processTemplate<boolean>(
        this._navbarCard._hass,
        this._navbarCard,
        badge.show,
      );
    }

    if (badge.template) {
      // ⚠️ Deprecated: prefer using `badge.show`
      return processBadgeTemplate(this._navbarCard._hass, badge.template);
    }

    return false;
  }

  get count(): number | null {
    return (
      processTemplate<number | null>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.badge?.count,
      ) ?? null
    );
  }

  get backgroundColor(): string {
    return (
      processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.badge?.color,
      ) ?? 'red'
    );
  }

  get textColor(): string | null {
    return (
      processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.badge?.textColor,
      ) ?? null
    );
  }

  /** Computed contrasting text color (used if no explicit textColor) */
  get contrastingColor(): string {
    return (
      this.textColor ??
      Color.from(this.backgroundColor).contrastingColor().hex()
    );
  }

  public render() {
    if (!this._route.badge || !this.show) return html``;

    const hasCounter = this.count != null;

    return html`
      <div
        class="badge ${this._route.selected ? 'active' : ''} ${hasCounter
          ? 'with-counter'
          : ''}"
        style="background-color:${this.backgroundColor}; color:${this
          .contrastingColor}">
        ${this.count ?? ''}
      </div>
    `;
  }
}
