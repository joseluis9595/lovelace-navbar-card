import type { ReactiveController } from 'lit';

import { ScrollableController } from '@/lib/scrollable';
import type { NavbarCard } from '@/navbar-card';
import type { NavbarAutohideMode } from '@/types';

/** Steady downward scroll (px) before the bar hides; avoids flicker. */
const HIDE_AFTER_PX = 24;
/** Upward scroll (px) that brings the bar back. */
const SHOW_AFTER_PX = 12;
/** Near the top of the page the bar is always shown. */
const TOP_ZONE_PX = 80;
/** Distance from the end of the page that counts as the end. */
const BOTTOM_ZONE_PX = 24;
/** Space kept around the selected route when minimized. */
const PILL_PADDING_PX = 4;
/** How long a tap that expands the bar keeps its follow-up events. */
const SWALLOW_TAP_MS = 600;

export const COLLAPSED_STORAGE_KEY = 'navbar-card-collapsed';

const readCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeCollapsed = (collapsed: boolean): void => {
  try {
    if (collapsed) window.localStorage.setItem(COLLAPSED_STORAGE_KEY, '1');
    else window.localStorage.removeItem(COLLAPSED_STORAGE_KEY);
  } catch {
    // Storage blocked (private mode, kiosk browsers): keep it per page
  }
};

/**
 * Lets the mobile navbar get out of the way of the content
 * (`mobile.autohide`).
 *
 * - `slide`: Material "hide on scroll". The bar slides off while scrolling
 *   down and returns on scroll up and at either end of the page.
 * - `minimize`: iOS "minimize on scroll". The bar shrinks to a pill holding
 *   only the selected route, centred; tapping the pill expands it.
 * - `toggle`: no scroll tracking. An arrow tab joined to the top of the bar
 *   folds it away and back; the choice is remembered on the device.
 *
 * The bar is always shown while a popup is open and after navigating.
 */
export class AutohideController implements ReactiveController {
  /** Scrolled away (`slide` / `minimize`). */
  away = false;
  /** Folded away by the user (`toggle`). */
  collapsed = readCollapsed();
  /** Pill geometry for `minimize`, measured as the bar minimizes. */
  pill: { clip: string; shift: string } | null = null;

  private _lastY = 0;
  private _travel = 0;
  private _frameRequested = false;
  private _swallowing = false;
  private _swallowTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly _host: NavbarCard) {
    _host.addController(this);
  }

  /** Active mode, or null when auto-hide does not apply. */
  get mode(): NavbarAutohideMode | null {
    const mode = this._host.config?.mobile?.autohide;
    if (!mode || this._host.isDesktop !== false || this._host.isInEditMode) {
      return null;
    }
    return mode;
  }

  /** Whether the bar should currently be hidden or minimized. */
  get isAway(): boolean {
    const mode = this.mode;
    if (!mode || this._host.focusedPopup) return false;
    return mode === 'toggle' ? this.collapsed : this.away;
  }

  hostConnected(): void {
    this._lastY = window.scrollY;
    this._travel = 0;
    this.away = false;
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('location-changed', this._onNavigate);
    window.addEventListener('popstate', this._onNavigate);
  }

  hostDisconnected(): void {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('location-changed', this._onNavigate);
    window.removeEventListener('popstate', this._onNavigate);
    clearTimeout(this._swallowTimer);
  }

  /** Flip the `toggle` mode bar and remember the choice. */
  toggleCollapsed = (event?: Event): void => {
    event?.stopPropagation();
    this.collapsed = !this.collapsed;
    writeCollapsed(this.collapsed);
    this._host.requestUpdate();
  };

  /**
   * Capture-phase pointer handler for the bar: while it is scrolled away, a
   * tap only brings it back, without triggering the route underneath.
   */
  interceptTap = {
    capture: true,
    handleEvent: (event: Event): void => {
      const scrolledAway =
        this.isAway && (this.mode === 'slide' || this.mode === 'minimize');

      if (event.type === 'pointerdown' && scrolledAway) {
        this._swallowing = true;
        clearTimeout(this._swallowTimer);
        this._swallowTimer = setTimeout(() => {
          this._swallowing = false;
        }, SWALLOW_TAP_MS);
        this._setAway(false);
      }

      if (this._swallowing) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
  };

  /**
   * Where to clip the bar to a pill around the selected route, and how far
   * to shift that pill to the middle. Scrollable bars are re-centred first,
   * since the user may have swiped the selected route out of view.
   */
  private _measurePill(): { clip: string; shift: string } | null {
    const bar =
      this._host.shadowRoot?.querySelector<HTMLElement>('.navbar-card');
    const active = bar?.querySelector<HTMLElement>('.route.active');
    if (!(bar && active)) return null;

    if (bar.scrollWidth > bar.clientWidth) {
      ScrollableController.centerRoute(bar, active);
    }

    const barRect = bar.getBoundingClientRect();
    const routeRect = active.getBoundingClientRect();
    const inset = (value: number) =>
      `${Math.max(0, value - PILL_PADDING_PX)}px`;
    const clip = [
      inset(routeRect.top - barRect.top),
      inset(barRect.right - routeRect.right),
      inset(barRect.bottom - routeRect.bottom),
      inset(routeRect.left - barRect.left),
    ].join(' ');
    const shift =
      barRect.left + barRect.width / 2 - (routeRect.left + routeRect.width / 2);
    return { clip, shift: `${shift}px` };
  }

  private _setAway(away: boolean): void {
    if (away === this.away) return;
    // Measure while the bar is still fully laid out
    if (away && this.mode === 'minimize') this.pill = this._measurePill();
    this.away = away;
    this._host.requestUpdate();
  }

  private _onScroll = (): void => {
    if (this._frameRequested) return;
    this._frameRequested = true;
    requestAnimationFrame(this._handleScroll);
  };

  private _handleScroll = (): void => {
    this._frameRequested = false;
    const mode = this.mode;
    const y = window.scrollY;
    const delta = y - this._lastY;
    this._lastY = y;
    if (delta === 0 || (mode !== 'slide' && mode !== 'minimize')) return;

    if (Math.sign(delta) !== Math.sign(this._travel)) this._travel = 0;
    this._travel += delta;

    const atTop = y < TOP_ZONE_PX;
    const atBottom =
      y + window.innerHeight >=
      document.documentElement.scrollHeight - BOTTOM_ZONE_PX;

    // Slide returns at the end of the page (nothing left to read); a pill
    // stays, since it still shows where the user is.
    if (atTop || (atBottom && mode === 'slide')) this._setAway(false);
    else if (this._travel > HIDE_AFTER_PX) this._setAway(true);
    else if (this._travel < -SHOW_AFTER_PX) this._setAway(false);
  };

  private _onNavigate = (): void => {
    this._lastY = window.scrollY;
    this._travel = 0;
    this._setAway(false);
  };
}
