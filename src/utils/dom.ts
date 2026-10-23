import { type CSSResult, html, type TemplateResult } from 'lit';

import type { NavbarCardConfig } from '@/types/config';
import type { RippleElement } from '@/types/types';

const DEFAULT_STYLES_ID = 'navbar-card-default-styles';
const USER_STYLES_ID = 'navbar-card-user-styles';

/**
 * Get a list of user defined navbar-card templates
 */
export const getNavbarTemplates = (): Record<
  string,
  NavbarCardConfig
> | null => {
  const lovelace = getLovelace();
  return lovelace?.config['navbar-templates'] ?? null;
};

/**
 * Lovelace object of the current dashboard: its config, and how to save it.
 */
export const getLovelace = ():
  | {
      config: Record<string, unknown> & {
        'navbar-templates'?: Record<string, NavbarCardConfig>;
      };
      saveConfig: (config: Record<string, unknown>) => Promise<void>;
    }
  | undefined => {
  const lovelacePanel = document
    ?.querySelector('home-assistant')
    ?.shadowRoot?.querySelector('home-assistant-main')
    ?.shadowRoot?.querySelector(
      'ha-drawer partial-panel-resolver ha-panel-lovelace',
    );
  // @ts-expect-error lovelacePanel does not have "lovelace" property type
  return lovelacePanel?.lovelace;
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
export const findHuiRoot = () => {
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
  const eventConstructor = EventConstructor || Event;
  const event = new eventConstructor(
    type,
    options,
  ) as EventConstructorMap[T][0];

  if (detailOverride !== undefined) {
    (event as { detail: unknown }).detail = detailOverride;
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
  const styleEl = document.createElement('style');
  styleEl.id = id;
  styleEl.textContent = styles.cssText;
  const existing = rootEl?.querySelector<HTMLStyleElement>(`#${id}`);
  // Replace in place: appended after Lit's content, it would be cleared on render
  if (existing) existing.replaceWith(styleEl);
  else rootEl?.appendChild(styleEl);
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
 * Scroll window to the top-left corner.
 */
export const scrollToTop = () => {
  window.scrollTo({
    behavior: 'smooth',
    left: 0,
    top: 0,
  });
};

/**
 * Checks if the current pathname matches the configured URL.
 * Supports both absolute URLs (starting with "/") and relative URLs.
 */
export const matchesCurrentNavigationPath = (
  url: string | undefined,
): boolean => {
  const pathname = window.location.pathname;
  if (!url) return false;

  if (url.startsWith('/')) {
    return pathname === url;
  }

  const normalizedPathname = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  return normalizedPathname.endsWith(`/${normalizedUrl}`);
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

/**
 * Check if a given HA component is supported.
 *
 * @param component - The name of the component to check for.
 * @returns True if the component is supported, false otherwise.
 */
export const supportsHAComponent = (component: string) => {
  return customElements?.get(component) != null;
};
