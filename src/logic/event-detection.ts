import { Directive, directive, PartInfo, PartType } from 'lit/directive.js';
import { ExtendedActionConfig, PopupItem, RouteItem } from '../config';
import { executeAction } from './action-handler';
import { NavbarCard } from '../navbar-card';

interface EventDetectionConfig {
  context: NavbarCard;
  route?: RouteItem;
  popupItem?: PopupItem;
  tap?: ExtendedActionConfig;
  hold?: ExtendedActionConfig;
  doubleTap?: ExtendedActionConfig;
}

const LONG_PRESS_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;

class EventDetectionDirective extends Directive {
  private lastTapTime = 0;
  private holdTimeout?: number;
  private holdTriggered = false;
  private clickTimeout?: number;
  private abortController?: AbortController;
  private boundHandlers: Partial<
    Record<'tap' | 'hold' | 'doubleTap', (ev: Event) => void>
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(part: any, [config]: [EventDetectionConfig]) {
    const element = part.element as HTMLElement;

    // Clean up previous listeners
    this.abortController?.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // Nothing to bind? bail early
    if (!config.tap && !config.hold && !config.doubleTap) return;

    // --- Set up bound handlers ---
    this.boundHandlers.tap = config.tap
      ? (ev: Event) =>
          executeAction({
            context: config.context,
            target: ev.currentTarget as HTMLElement,
            action: config.tap,
            actionType: 'tap',
            route: config.route,
            popupItem: config.popupItem,
          })
      : undefined;

    this.boundHandlers.hold = config.hold
      ? (ev: Event) =>
          executeAction({
            context: config.context,
            target: ev.currentTarget as HTMLElement,
            action: config.hold,
            actionType: 'hold',
            route: config.route,
            popupItem: config.popupItem,
          })
      : undefined;

    this.boundHandlers.doubleTap = config.doubleTap
      ? (ev: Event) =>
          executeAction({
            context: config.context,
            target: ev.currentTarget as HTMLElement,
            action: config.doubleTap,
            actionType: 'double_tap',
            route: config.route,
            popupItem: config.popupItem,
          })
      : undefined;

    // --- Long press ---
    if (this.boundHandlers.hold) {
      const startHold = (ev: Event) => {
        this.holdTriggered = false;
        clearTimeout(this.holdTimeout);
        this.holdTimeout = window.setTimeout(() => {
          this.holdTriggered = true;
          this.boundHandlers.hold?.(ev);
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

    const now = Date.now();
    const delta = now - this.lastTapTime;
    this.lastTapTime = now;

    const hasDoubleTap = !!this.boundHandlers.doubleTap;
    const hasTap = !!this.boundHandlers.tap;

    if (hasDoubleTap && delta < doubleTapDelay) {
      clearTimeout(this.clickTimeout);
      this.lastTapTime = 0;
      this.boundHandlers.doubleTap?.(ev);
      return;
    }

    if (hasTap) {
      if (hasDoubleTap) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = window.setTimeout(() => {
          this.boundHandlers.tap?.(ev);
        }, doubleTapDelay);
      } else {
        this.boundHandlers.tap?.(ev);
      }
    }
  }

  disconnected() {
    this.abortController?.abort();
  }
}

export const eventDetection = directive(EventDetectionDirective);
