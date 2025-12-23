import {
  Directive,
  directive,
  type ElementPart,
  type PartInfo,
  PartType,
} from 'lit/directive.js';

import type { PopupItem, Route } from '@/components/navbar';
import { executeAction } from '@/lib/action-handler';
import type { NavbarCard } from '@/navbar-card';
import type { ExtendedActionConfig } from '@/types';

interface EventDetectionConfig {
  context: NavbarCard;
  route?: Route;
  popupItem?: PopupItem;
  tap?: ExtendedActionConfig;
  hold?: ExtendedActionConfig;
  doubleTap?: ExtendedActionConfig;
}

/**
 * Interface for elements that support tap, hold, and double-tap actions
 */
export interface ActionableElement {
  tap_action?: ExtendedActionConfig;
  hold_action?: ExtendedActionConfig;
  double_tap_action?: ExtendedActionConfig;
}

// Event configuration
const LONG_PRESS_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;

class EventDetectionDirective extends Directive {
  private lastTapTime = 0;
  private holdTimeout?: number;
  private holdTriggered = false;
  private clickTimeout?: number;
  private abortController?: AbortController;
  private boundHandlers: Partial<
    Record<
      'tap' | 'hold' | 'doubleTap',
      (ev: Event, target?: HTMLElement) => void
    >
  > = {};

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `eventDetection` directive can only be used on elements.',
      );
    }
  }

  render(_config: EventDetectionConfig) {
    return;
  }

  update(part: ElementPart, [config]: [EventDetectionConfig]) {
    const element = part.element as HTMLElement;

    // Clean up previous listeners
    this.abortController?.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // Nothing to bind? bail early
    if (!(config.tap || config.hold || config.doubleTap)) return;

    // --- Set up bound handlers ---
    this.boundHandlers.tap = config.tap
      ? (ev: Event, target?: HTMLElement) =>
          executeAction({
            action: config.tap,
            actionType: 'tap',
            context: config.context,
            data: { popupItem: config.popupItem, route: config.route },
            target: target ?? (ev.currentTarget as HTMLElement),
          })
      : undefined;

    this.boundHandlers.hold = config.hold
      ? (ev: Event, target?: HTMLElement) =>
          executeAction({
            action: config.hold,
            actionType: 'hold',
            context: config.context,
            data: { popupItem: config.popupItem, route: config.route },
            target: target ?? (ev.currentTarget as HTMLElement),
          })
      : undefined;

    this.boundHandlers.doubleTap = config.doubleTap
      ? (ev: Event, target?: HTMLElement) =>
          executeAction({
            action: config.doubleTap,
            actionType: 'double_tap',
            context: config.context,
            data: { popupItem: config.popupItem, route: config.route },
            target: target ?? (ev.currentTarget as HTMLElement),
          })
      : undefined;

    // --- Long press ---
    if (this.boundHandlers.hold) {
      const startHold = (ev: Event) => {
        // Store the target element for the event
        const targetElement = ev.currentTarget as HTMLElement;
        this.holdTriggered = false;
        clearTimeout(this.holdTimeout);
        this.holdTimeout = window.setTimeout(() => {
          this.holdTriggered = true;
          this.boundHandlers.hold?.(ev, targetElement);
        }, LONG_PRESS_DELAY);
      };
      const cancelHold = () => {
        if (this.holdTimeout) {
          clearTimeout(this.holdTimeout);
          this.holdTimeout = undefined;
        }
      };

      element.addEventListener('pointerdown', startHold, { signal });
      element.addEventListener('pointerup', cancelHold, { signal });
      element.addEventListener('pointercancel', cancelHold, { signal });
      element.addEventListener('pointerleave', cancelHold, { signal });
    }

    // --- Tap / Double Tap ---
    if (this.boundHandlers.tap || this.boundHandlers.doubleTap) {
      element.addEventListener(
        'click',
        (ev: MouseEvent) => this.handleClick(ev, DOUBLE_TAP_DELAY),
        { signal },
      );
    }
  }

  private handleClick(ev: Event, doubleTapDelay: number) {
    if (this.holdTriggered) return; // skip if hold already triggered

    // Store the target element for the event
    const targetElement = ev.currentTarget as HTMLElement;

    // Calculate the time difference between the current and last tap
    const now = Date.now();
    const delta = now - this.lastTapTime;
    this.lastTapTime = now;

    const hasDoubleTap = !!this.boundHandlers.doubleTap;
    const hasTap = !!this.boundHandlers.tap;

    if (hasDoubleTap && delta < doubleTapDelay) {
      clearTimeout(this.clickTimeout);
      this.lastTapTime = 0;
      this.boundHandlers.doubleTap?.(ev, targetElement);
      return;
    }

    if (hasTap) {
      if (hasDoubleTap) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = window.setTimeout(() => {
          this.boundHandlers.tap?.(ev, targetElement);
        }, doubleTapDelay);
      } else {
        this.boundHandlers.tap?.(ev, targetElement);
      }
    }
  }

  disconnected() {
    this.abortController?.abort();
  }
}

export const eventDetection = directive(EventDetectionDirective);
