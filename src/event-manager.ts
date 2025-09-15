import { NavbarPopupItem, NavbarRoute } from "./components";
import { RippleElement } from "./types";

const DOUBLE_TAP_DELAY = 250;
const HOLD_ACTION_DELAY = 500;

export class EventManager {
  // hold_action state variables
  private holdTimeoutId: number | null = null;
  private holdTriggered: boolean = false;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;

  // double_tap_action state variables
  private lastTapTime: number = 0;
  private lastTapTarget: EventTarget | null = null;

  // tap_action state variables
  private tapTimeoutId: number | null = null;

  public handleMouseEnter = (e: MouseEvent, _route: NavbarRoute.Route | NavbarPopupItem.PopupItem,) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseMove = (e: MouseEvent, _route: NavbarRoute.Route | NavbarPopupItem.PopupItem,) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseLeave = (e: MouseEvent, _route: NavbarRoute.Route | NavbarPopupItem.PopupItem,) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = false;
  };

  public handlePointerDown = (e: PointerEvent, route: NavbarRoute.Route | NavbarPopupItem.PopupItem,) => {
    // Store the starting position for movement detection
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    if (route.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        // if (this._shouldTriggerHaptic('hold')) {
        //   hapticFeedback();
        // }
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };

  public handlePointerMove = (e: PointerEvent, _route: NavbarRoute.Route | NavbarPopupItem.PopupItem,) => {
    if (!this.holdTimeoutId) {
      return;
    }

    // Calculate movement distance to prevent accidental hold triggers
    const moveX = Math.abs(e.clientX - this.pointerStartX);
    const moveY = Math.abs(e.clientY - this.pointerStartY);

    // If moved more than 10px in any direction, cancel the hold action
    if (moveX > 10 || moveY > 10) {
      if (this.holdTimeoutId !== null) {
        clearTimeout(this.holdTimeoutId);
        this.holdTimeoutId = null;
      }
    }
  };

  public handlePointerUp = (
    e: PointerEvent,
    route: NavbarRoute.Route | NavbarPopupItem.PopupItem,
  ) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }

    // Capture current target from the original event
    const currentTarget = e.currentTarget as HTMLElement;

    // Check for double tap
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap =
      timeDiff < DOUBLE_TAP_DELAY && e.target === this.lastTapTarget;

    if (isDoubleTap && route.double_tap_action) {
      // Clear pending tap action if double tap is detected
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

  public handleHoldAction = (
    target: HTMLElement,
    route: NavbarRoute.Route | NavbarPopupItem.PopupItem,
  ) => {
    route.executeAction(target, route, route.hold_action, 'hold');
  };

  public handleDoubleTapAction = (
    target: HTMLElement,
    route: NavbarRoute.Route | NavbarPopupItem.PopupItem,
  ) => {
    route.executeAction(
      target,
      route,
      route.double_tap_action,
      'double_tap',
    );
  };

  public handleTapAction = (
    target: HTMLElement,
    route: NavbarRoute.Route | NavbarPopupItem.PopupItem,
  ) => {
    // Set timeout for tap action to allow for potential double tap
    if (route.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        // this._handleTapAction(currentTarget, route, false);
        route.executeAction(
          target,
          route,
          route.tap_action,
          'tap'
        );
      }, DOUBLE_TAP_DELAY);
    } else {
      // this._handleTapAction(currentTarget, route, false);
      route.executeAction(target, route, route.tap_action, 'tap');
    }
  };
}
