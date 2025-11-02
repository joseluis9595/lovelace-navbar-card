import { CSSResult, html, TemplateResult } from 'lit';
import {
  NavbarCardConfig,
  AutoPaddingConfig,
  DEFAULT_NAVBAR_CONFIG,
} from '@/types/config';
import { RippleElement } from '@/types/types';

const DASHBOARD_PADDING_STYLE_ID = 'navbar-card-forced-padding-styles';
const DEFAULT_STYLES_ID = 'navbar-card-default-styles';
const USER_STYLES_ID = 'navbar-card-user-styles';

/**
 * Get a list of user defined navbar-card templates
 */
export const getNavbarTemplates = (): Record<
  string,
  NavbarCardConfig
> | null => {
  const lovelacePanel = document
    ?.querySelector('home-assistant')
    ?.shadowRoot?.querySelector('home-assistant-main')
    ?.shadowRoot?.querySelector(
      'ha-drawer partial-panel-resolver ha-panel-lovelace',
    );
  if (lovelacePanel) {
    // TODO add proper typing
    // @ts-expect-error lovelacePanel does not have "lovelace" property type
    return lovelacePanel.lovelace.config['navbar-templates'];
  }
  return null;
};

/**
 * Forcefully reset the ripple effect on a Material Design ripple element.
 *
 * @param target - The HTMLElement containing the md-ripple element
 */
export const forceResetRipple = (target: HTMLElement) => {
  const rippleElements = target?.querySelectorAll('ha-ripple');

  rippleElements?.forEach((ripple: RippleElement) => {
    setTimeout(() => {
      ripple.hovered = false;
      ripple.pressed = false;
    }, 10);
  });
};

/**
 * Find the hui-root element in the DOM.
 *
 * @returns The hui-root element or null if not found.
 */
const findHuiRoot = () => {
  return window.document
    .querySelector('home-assistant')
    ?.shadowRoot?.querySelector('home-assistant-main')
    ?.shadowRoot?.querySelector('ha-panel-lovelace')
    ?.shadowRoot?.querySelector('hui-root');
};

/**
 * Forcefully open the edit mode of the Lovelace panel.
 */
export const forceOpenEditMode = () => {
  const huiRoot = findHuiRoot();
  if (!huiRoot?.shadowRoot) return;
  // @ts-expect-error lovelace does not have "lovelace" property type
  huiRoot.lovelace.setEditMode(true);
};

/**
 * Remove the dashboard padding styles from the hui-root element.
 */
export const removeDashboardPadding = () => {
  const huiRoot = findHuiRoot();
  if (!huiRoot?.shadowRoot) return;
  const styleEl = huiRoot.shadowRoot.querySelector<HTMLStyleElement>(
    `#${DASHBOARD_PADDING_STYLE_ID}`,
  );
  if (styleEl) {
    styleEl.remove();
  }
};

/**
 * Manually inject styles into the hui-root element to force dashboard padding.
 * This prevents overlaps with other cards in the dashboard.
 */
export const forceDashboardPadding = (options?: {
  desktop: NavbarCardConfig['desktop'];
  mobile: NavbarCardConfig['mobile'];
  auto_padding?: AutoPaddingConfig;
  show_media_player: boolean;
}) => {
  const autoPaddingEnabled =
    options?.auto_padding?.enabled ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled;

  // Find hui-root element
  const huiRoot = findHuiRoot();
  if (!huiRoot?.shadowRoot) {
    console.warn(
      '[navbar-card] Could not find hui-root. Custom padding styles will not be applied.',
    );
    return;
  }

  // Find existing style element
  let styleEl = huiRoot.shadowRoot.querySelector<HTMLStyleElement>(
    `#${DASHBOARD_PADDING_STYLE_ID}`,
  );

  // Remove styles if auto padding is disabled
  if (!autoPaddingEnabled) {
    if (styleEl) {
      styleEl.remove();
    }
    return;
  }

  // Initialize variables
  const desktopMinWidth = options?.desktop?.min_width ?? 768;
  const mobileMaxWidth = desktopMinWidth - 1;
  let cssText = '';

  // Desktop padding
  const desktopPaddingPx =
    options?.auto_padding?.desktop_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.desktop_px ??
    0;

  if (
    ['left', 'right'].includes(options?.desktop?.position ?? '') &&
    desktopPaddingPx > 0
  ) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
       :not(.edit-mode) > #view {
            padding-${options?.desktop?.position}: ${desktopPaddingPx}px !important;
          }
      }
    `;
  } else if (
    (options?.desktop?.position === 'bottom' ||
      options?.desktop?.position === 'top') &&
    desktopPaddingPx > 0
  ) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
        :not(.edit-mode) > hui-view:${options?.desktop?.position === 'top' ? 'before' : 'after'} {
          content: "";
          display: block;
          height: ${desktopPaddingPx}px;  
          width: 100%;
          background-color: transparent; 
        }
      }
    `;
  }

  // Mobile padding
  let mobilePaddingPx =
    options?.auto_padding?.mobile_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.mobile_px ??
    0;
  // Add media player padding if enabled
  if (options?.show_media_player) {
    mobilePaddingPx +=
      options?.auto_padding?.media_player_px ??
      DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.media_player_px ??
      0;
  }
  // Add padding to the DOM
  if (mobilePaddingPx > 0) {
    cssText += `
      @media (max-width: ${mobileMaxWidth}px) {
        :not(.edit-mode) > hui-view:after {
          content: "";
          display: block;
          height: ${mobilePaddingPx}px;
          width: 100%;
          background-color: transparent;
          }
        }
      `;
  }

  // Append styles to hui-root
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DASHBOARD_PADDING_STYLE_ID;
    styleEl.textContent = cssText;
    huiRoot.shadowRoot.appendChild(styleEl);
  } else {
    styleEl.textContent = cssText;
  }
};

type EventConstructorMap = {
  Event: [Event, EventInit];
  KeyboardEvent: [KeyboardEvent, KeyboardEventInit];
  MouseEvent: [MouseEvent, MouseEventInit];
  TouchEvent: [TouchEvent, TouchEventInit];
};

/**
 * Fire a DOM event on a node.
 *
 * @param node - The node to fire the event on.
 * @param type - The type of event to fire.
 * @param options - The options for the event.
 * @param detailOverride - The detail to override the event with.
 * @param EventConstructor - The constructor for the event.
 */
export function fireDOMEvent<T extends keyof EventConstructorMap = 'Event'>(
  node: HTMLElement | Window,
  type: string,
  data?: {
    options?: EventConstructorMap[T][1];
    detailOverride?: unknown;
  },
  EventConstructor?: new (
    type: string,
    options?: EventConstructorMap[T][1],
  ) => EventConstructorMap[T][0],
): EventConstructorMap[T][0] {
  const { options, detailOverride } = data ?? {};
  const constructor = EventConstructor || Event;
  const event = new constructor(type, options) as EventConstructorMap[T][0];

  if (detailOverride !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event as any).detail = detailOverride;
  }

  node.dispatchEvent(event);
  return event;
}

/**
 * Create a style element and append it to the shadow root of a given HTMLElement.
 *
 * @param root - The root element to append the style element to.
 * @param id - The id of the style element.
 * @param styles - The styles to append to the style element.
 */
const createStyleElement = (
  root: HTMLElement,
  id: string,
  styles: CSSResult,
) => {
  const rootEl = root.shadowRoot;
  let styleEl = rootEl?.querySelector<HTMLStyleElement>(`#${id}`);
  if (styleEl) {
    styleEl.remove();
  }
  styleEl = document.createElement('style');
  styleEl.id = id;
  styleEl.textContent = styles.cssText;
  rootEl?.appendChild(styleEl);
};

/**
 * Inject styles into the shadow root of a given HTMLElement.
 *
 * @param root - The root element to inject the styles into.
 * @param styles - The styles to inject.
 */
export const injectStyles = (
  root: HTMLElement,
  defaultStyles: CSSResult,
  userStyles: CSSResult,
) => {
  createStyleElement(root, DEFAULT_STYLES_ID, defaultStyles);
  createStyleElement(root, USER_STYLES_ID, userStyles);
};

/**
 * Prevent the default action of an event and stop the propagation of the event.
 *
 * @param e - The event to prevent the default action of.
 */
export const preventEventDefault = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Conditionally render a content based on a condition.
 *
 * @param condition - The condition to render the content based on.
 * @param renderContent - The content to render if the condition is true.
 * @returns The rendered content or a loader if the condition is false.
 */
export const conditionallyRender = (
  condition: boolean,
  renderContent: () => TemplateResult,
) => {
  if (condition) {
    return renderContent();
  }
  return html`<div class="loader-container">
    <span class="loader"></span>
  </div>`;
};
