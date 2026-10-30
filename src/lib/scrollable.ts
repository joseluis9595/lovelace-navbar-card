import type { ReactiveController } from 'lit';

import type { NavbarCard } from '@/navbar-card';

/** How long to keep waiting for the bar to be laid out (40 x 50ms = 2s). */
const MAX_CENTER_ATTEMPTS = 40;
const CENTER_RETRY_MS = 50;

/** Scroll position (px) within which an edge counts as reached. */
const EDGE_TOLERANCE = 2;

/**
 * Horizontally scrolling mobile navbar (`mobile.scrollable`).
 *
 * Each dashboard view renders its own navbar-card, so navigating creates (or
 * re-attaches) a card scrolled back to its first route. This controller
 * centres the selected route once per URL and per attach, retrying until the
 * bar has been laid out, so the user always sees where they are. It never
 * re-centres on state updates, so a manual swipe is not undone.
 *
 * It also marks which ends of the bar still have hidden routes
 * (`data-fade-start` / `data-fade-end`), which the styles turn into a fade.
 */
export class ScrollableController implements ReactiveController {
  private _centeredFor: string | null = null;
  private _centering = false;

  constructor(private readonly _host: NavbarCard) {
    _host.addController(this);
  }

  get enabled(): boolean {
    return (
      !!this._host.config?.mobile?.scrollable &&
      this._host.isDesktop === false &&
      !this._host.isInEditMode
    );
  }

  hostConnected(): void {
    // A re-attached (cached) view has lost its scroll position.
    this._centeredFor = null;
  }

  hostUpdated(): void {
    if (!this.enabled) return;
    if (this._centering || this._centeredFor === window.location.pathname) {
      return;
    }
    this._centering = true;
    requestAnimationFrame(() => this._center());
  }

  /** Scroll listener for the bar: refreshes the edge fades. */
  onScroll = (event: Event): void => {
    this.updateEdges(event.currentTarget as HTMLElement);
  };

  /** Mark which ends of the bar have routes scrolled out of view. */
  updateEdges(bar: HTMLElement): void {
    const max = bar.scrollWidth - bar.clientWidth;
    // scrollLeft is negative in RTL; its magnitude works for both directions
    const position = Math.abs(bar.scrollLeft);
    bar.toggleAttribute('data-fade-start', position > EDGE_TOLERANCE);
    bar.toggleAttribute('data-fade-end', position < max - EDGE_TOLERANCE);
  }

  /** Scroll `bar` so `route` sits in its middle (as far as the ends allow). */
  static centerRoute(bar: HTMLElement, route: HTMLElement): void {
    const barRect = bar.getBoundingClientRect();
    const routeRect = route.getBoundingClientRect();
    bar.scrollTo({
      behavior: 'instant',
      left:
        bar.scrollLeft +
        (routeRect.left + routeRect.width / 2) -
        (barRect.left + barRect.width / 2),
    });
  }

  private _center(attempt = 0): void {
    const bar =
      this._host.shadowRoot?.querySelector<HTMLElement>('.navbar-card');
    const active = bar?.querySelector<HTMLElement>('.route.active');

    if (!bar || bar.clientWidth === 0) {
      if (attempt < MAX_CENTER_ATTEMPTS) {
        setTimeout(() => this._center(attempt + 1), CENTER_RETRY_MS);
      } else {
        this._centering = false;
      }
      return;
    }

    this._centering = false;
    this._centeredFor = window.location.pathname;
    if (active && bar.scrollWidth > bar.clientWidth) {
      ScrollableController.centerRoute(bar, active);
    }
    this.updateEdges(bar);
  }
}
