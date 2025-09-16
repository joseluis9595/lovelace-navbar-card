// src/components/navbar/route/events.ts
import { PopupItem, Route } from '@components/navbar';
import { RippleElement } from '@types';

const DOUBLE_TAP_DELAY = 250;
const HOLD_ACTION_DELAY = 500;

export class RouteEvents {
  private holdTimeoutId: number | null = null;
  private holdTriggered = false;
  private pointerStartX = 0;
  private pointerStartY = 0;

  private lastTapTime = 0;
  private lastTapTarget: EventTarget | null = null;

  private tapTimeoutId: number | null = null;

  public handleMouseEnter = (e: MouseEvent, _route: Route | PopupItem) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseMove = (e: MouseEvent, _route: Route | PopupItem) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseLeave = (e: MouseEvent, _route: Route | PopupItem) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = false;
  };

  public handlePointerDown = (e: PointerEvent, route: Route | PopupItem) => {
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    if (route.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };

  public handlePointerMove = (e: PointerEvent, _route: Route | PopupItem) => {
    if (!this.holdTimeoutId) return;

    const moveX = Math.abs(e.clientX - this.pointerStartX);
    const moveY = Math.abs(e.clientY - this.pointerStartY);

    if (moveX > 10 || moveY > 10) {
      if (this.holdTimeoutId !== null) {
        clearTimeout(this.holdTimeoutId);
        this.holdTimeoutId = null;
      }
    }
  };

  public handlePointerUp = (e: PointerEvent, route: Route | PopupItem) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }

    const currentTarget = e.currentTarget as HTMLElement;

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap =
      timeDiff < DOUBLE_TAP_DELAY && e.target === this.lastTapTarget;

    if (isDoubleTap && route.double_tap_action) {
      if (this.tapTimeoutId !== null) {
        clearTimeout(this.tapTimeoutId);
        this.tapTimeoutId = null;
      }
      this.handleDoubleTapAction(currentTarget, route);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else if (this.holdTriggered && route.hold_action) {
      this.handleHoldAction(currentTarget, route);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else {
      this.lastTapTime = currentTime;
      this.lastTapTarget = e.target;

      this.handleTapAction(currentTarget, route);
    }

    this.holdTriggered = false;
  };

  public handleHoldAction = (target: HTMLElement, route: Route | PopupItem) => {
    route.executeAction(target, route, route.hold_action, 'hold');
  };

  public handleDoubleTapAction = (
    target: HTMLElement,
    route: Route | PopupItem,
  ) => {
    route.executeAction(target, route, route.double_tap_action, 'double_tap');
  };

  public handleTapAction = (target: HTMLElement, route: Route | PopupItem) => {
    if (route.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        route.executeAction(target, route, route.tap_action, 'tap');
      }, DOUBLE_TAP_DELAY);
    } else {
      route.executeAction(target, route, route.tap_action, 'tap');
    }
  };
}