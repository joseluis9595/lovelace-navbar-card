import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { Color } from '@/components';
import type { BaseRoute } from '@/components/navbar';
import type { NavbarCard } from '@/navbar-card';
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
      return (
        processTemplate<boolean>(
          this._navbarCard._hass,
          this._navbarCard,
          badge.show,
        ) ?? false
      );
    }

    if (badge.template) {
      // ⚠️ Deprecated: prefer using `badge.show`
      return processBadgeTemplate(this._navbarCard._hass, badge.template);
    }

    return false;
  }

  get count(): string | number | null {
    return (
      processTemplate<string | number>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.badge?.count,
      ) ?? null
    );
  }

  get icon(): string | null {
    const icon = processTemplate<string>(
      this._navbarCard._hass,
      this._navbarCard,
      this._route.data.badge?.icon,
    );

    return typeof icon === 'string' && icon.trim() !== '' ? icon.trim() : null;
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
        this._route.data.badge?.text_color ?? this._route.data.badge?.textColor,
      ) ?? null
    );
  }

  get iconColor(): string | null {
    return (
      processTemplate<string>(
        this._navbarCard._hass,
        this._navbarCard,
        this._route.data.badge?.icon_color,
      ) ?? null
    );
  }

  public render() {
    if (!this.show) return nothing;

    const icon = this.icon;
    const count = this.count;
    const backgroundColor = this.backgroundColor;
    const hasIcon = icon != null;
    const hasCounter = !hasIcon && count != null;
    const configuredForegroundColor = hasIcon
      ? (this.iconColor ?? this.textColor)
      : this.textColor;
    const foregroundColor =
      configuredForegroundColor ??
      Color.from(backgroundColor).contrastingColor().hex();

    return html`
      <div
        class=${classMap({
          active: this._route.selected,
          badge: true,
          'with-counter': hasCounter,
          'with-icon': hasIcon,
        })}
        style=${styleMap({
          backgroundColor,
          color: foregroundColor,
        })}>
        ${
          hasIcon
            ? html`<ha-icon class="badge-icon" .icon=${icon}></ha-icon>`
            : (count ?? nothing)
        }
      </div>
    `;
  }
}
