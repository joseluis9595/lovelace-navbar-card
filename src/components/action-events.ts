import { ExtendedActionConfig } from '@/types';
import { RippleElement } from '@/types';

const DOUBLE_TAP_DELAY = 250;
const HOLD_ACTION_DELAY = 500;

/**
 * Interface for elements that support tap, hold, and double-tap actions
 */
export interface ActionableElement {
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
  executeAction: (
    target: HTMLElement,
    element: ActionableElement,
    action: ExtendedActionConfig | undefined,
    actionType: 'tap' | 'hold' | 'double_tap',
  ) => void;
}

/**
 * Generic event handler for elements with tap, hold, and double-tap actions
 */
export class ActionEvents {
  private holdTimeoutId: number | null = null;
  private holdTriggered = false;
  private pointerStartX = 0;
  private pointerStartY = 0;

  private lastTapTime = 0;
  private lastTapTarget: EventTarget | null = null;

  private tapTimeoutId: number | null = null;

  public handleMouseEnter = (e: MouseEvent, _element: ActionableElement) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseMove = (e: MouseEvent, _element: ActionableElement) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = true;
  };

  public handleMouseLeave = (e: MouseEvent, _element: ActionableElement) => {
    const ripple = (e.currentTarget as HTMLElement).querySelector(
      'ha-ripple',
    ) as RippleElement;
    if (ripple) ripple.hovered = false;
  };

  public handlePointerDown = (e: PointerEvent, element: ActionableElement) => {
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    if (element.hold_action) {
      this.holdTriggered = false;
      this.holdTimeoutId = window.setTimeout(() => {
        this.holdTriggered = true;
      }, HOLD_ACTION_DELAY);
    }
  };

  public handlePointerMove = (e: PointerEvent, _element: ActionableElement) => {
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

  public handlePointerUp = (e: PointerEvent, element: ActionableElement) => {
    if (this.holdTimeoutId !== null) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }

    const currentTarget = e.currentTarget as HTMLElement;

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastTapTime;
    const isDoubleTap =
      timeDiff < DOUBLE_TAP_DELAY && e.target === this.lastTapTarget;

    if (isDoubleTap && element.double_tap_action) {
      if (this.tapTimeoutId !== null) {
        clearTimeout(this.tapTimeoutId);
        this.tapTimeoutId = null;
      }
      this.handleDoubleTapAction(currentTarget, element);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else if (this.holdTriggered && element.hold_action) {
      this.handleHoldAction(currentTarget, element);
      this.lastTapTime = 0;
      this.lastTapTarget = null;
    } else {
      this.lastTapTime = currentTime;
      this.lastTapTarget = e.target;

      this.handleTapAction(currentTarget, element);
    }

    this.holdTriggered = false;
  };

  public handleHoldAction = (
    target: HTMLElement,
    element: ActionableElement,
  ) => {
    element.executeAction(target, element, element.hold_action, 'hold');
  };

  public handleDoubleTapAction = (
    target: HTMLElement,
    element: ActionableElement,
  ) => {
    element.executeAction(
      target,
      element,
      element.double_tap_action,
      'double_tap',
    );
  };

  public handleTapAction = (
    target: HTMLElement,
    element: ActionableElement,
  ) => {
    if (element.double_tap_action) {
      this.tapTimeoutId = window.setTimeout(() => {
        element.executeAction(target, element, element.tap_action, 'tap');
      }, DOUBLE_TAP_DELAY);
    } else {
      element.executeAction(target, element, element.tap_action, 'tap');
    }
  };
}
