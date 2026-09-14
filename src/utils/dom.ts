import { type CSSResult, html, type TemplateResult } from 'lit';

import {
  type AutoPaddingConfig,
  DEFAULT_NAVBAR_CONFIG,
  DesktopPosition,
  MobilePosition,
  type NavbarCardConfig,
  WidgetPosition,
} from '@/types/config';
import type { RippleElement } from '@/types/types';

const DASHBOARD_PADDING_STYLE_ID = 'navbar-card-forced-padding-styles';
const DEFAULT_STYLES_ID = 'navbar-card-default-styles';
const USER_STYLES_ID = 'navbar-card-user-styles';

/**
 * Most recent usable navbar measurement, shared across card instances.
 *
 * Every connected card writes the same padding style element, and a dashboard
 * can have several at once - Home Assistant keeps previous views mounted while
 * transitioning between them. Only the card that is actually on screen can
 * measure itself, so the others reuse its measurement instead of falling back
 * to the configured minimum and undoing it.
 */
let lastKnownEdgeReserve: NavbarEdgeReserve | null = null;

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
 * Space the rendered navbar occupies along each horizontal edge of the
 * dashboard view.
 *
 * Only the side matching the configured navbar position is ever used - the
 * other side is measured from the same rect and is meaningless on its own.
 */
export type NavbarEdgeReserve = {
  left?: number;
  right?: number;
};

/**
 * Find the dashboard view container that receives the forced padding.
 */
const findDashboardView = () =>
  findHuiRoot()?.shadowRoot?.querySelector<HTMLElement>('#view') ?? null;

/**
 * Measure how much horizontal space the rendered navbar actually takes up,
 * relative to the dashboard view container.
 *
 * Measuring beats a hand-maintained constant: the navbar's width depends on
 * icon size, labels, padding and user styles, none of which the configured
 * `auto_padding.*_px` values know about. Distances are taken from the view
 * container rather than the viewport so the sidebar offset and the floating
 * edge inset are both accounted for automatically.
 *
 * Exactly the navbar's footprint is reserved, with no gap added on top. The
 * view already spaces its cards away from its own content box, so shrinking
 * that box by the navbar's width leaves the same gap beside the navbar that
 * the dashboard uses between cards and at its other edges - adding a gap here
 * would double it.
 *
 * Only a navbar that is actually on screen is measured. Home Assistant keeps
 * previous views in the DOM while transitioning between them, and those
 * wrappers carry `will-change: transform` - which makes them the containing
 * block for the navbar's `position: fixed`, so a stale view's navbar reports a
 * rect far outside the viewport. Measuring one of those would reserve a wildly
 * wrong amount of space.
 *
 * @param navbar - The rendered `.navbar` container element.
 * @returns The reserve for each horizontal edge, or `null` when there is
 * nothing dependable to measure: no navbar rendered, no layout yet, or a
 * navbar belonging to a view that is not on screen.
 */
export const measureNavbarEdgeReserve = (
  navbar?: HTMLElement | null,
): NavbarEdgeReserve | null => {
  if (!navbar) return null;

  const navbarRect = navbar.getBoundingClientRect();
  // No layout yet - fall back to the configured values.
  if (navbarRect.width <= 0 || navbarRect.height <= 0) return null;

  const viewRect = findDashboardView()?.getBoundingClientRect();
  const viewLeft = viewRect?.left ?? 0;
  const viewRight = viewRect?.right ?? window.innerWidth;

  // Reject a navbar that does not overlap the view it would be padding.
  const overlap =
    Math.min(navbarRect.right, viewRight) - Math.max(navbarRect.left, viewLeft);
  if (overlap <= 0) return null;

  return {
    left: Math.max(0, Math.ceil(navbarRect.right - viewLeft)),
    right: Math.max(0, Math.ceil(viewRight - navbarRect.left)),
  };
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
  lastKnownEdgeReserve = null;
};

/**
 * Manually inject styles into the hui-root element to force dashboard padding.
 * This prevents overlaps with other cards in the dashboard.
 *
 * For the side-docked layouts (desktop `left`/`right` and the mobile landscape
 * `right` dock) the reserved space is driven by `measuredEdgeReserve` when it
 * is available, treating the configured `auto_padding.*_px` value as a minimum
 * rather than the source of truth. A navbar that renders wider than the
 * configured constant would otherwise have dashboard cards sitting underneath
 * its edge.
 */
export const forceDashboardPadding = (options?: {
  desktop: NavbarCardConfig['desktop'];
  mobile: NavbarCardConfig['mobile'];
  autoPadding?: AutoPaddingConfig;
  /**
   * Measured size of the rendered navbar, as returned by
   * {@link measureNavbarEdgeReserve}. Reflects the currently active layout
   * only, so it is applied exclusively to the mode the viewport is in.
   */
  measuredEdgeReserve?: NavbarEdgeReserve | null;
  widgetPositions: Record<string, WidgetPosition | null>;
}) => {
  const autoPaddingEnabled =
    options?.autoPadding?.enabled ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.enabled;

  // Find hui-root element
  const huiRoot = findHuiRoot();
  if (!huiRoot?.shadowRoot) {
    console.warn(
      '[navbar-card] Could not find hui-root. Custom padding styles will not be applied.',
    );
    return;
  }

  // Store padding values for each side
  const totalPaddings = {
    desktop: {
      [DesktopPosition.top]: 0,
      [DesktopPosition.bottom]: 0,
      [DesktopPosition.left]: 0,
      [DesktopPosition.right]: 0,
    },
    mobile: {
      bottom: 0,
      right: 0,
    },
  };

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
  const desktopPosition =
    options?.desktop?.position ?? DEFAULT_NAVBAR_CONFIG.desktop.position;
  const mobilePosition =
    options?.mobile?.position ?? DEFAULT_NAVBAR_CONFIG.mobile.position;
  const mobileMaxWidth = desktopMinWidth - 1;
  let cssText = '';

  // Desktop padding
  const desktopPaddingPx =
    options?.autoPadding?.desktop_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.desktop_px ??
    0;

  // Store desktop padding
  totalPaddings.desktop[desktopPosition] += desktopPaddingPx;

  // Mobile padding
  const mobilePaddingPx =
    options?.autoPadding?.mobile_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.mobile_px ??
    0;

  // The bottom padding always accounts for the portrait fallback layout;
  // the right padding additionally reserves space for the landscape layout
  // when the navbar is configured to dock to the right.
  totalPaddings.mobile.bottom += mobilePaddingPx;
  if (mobilePosition === MobilePosition.right) {
    totalPaddings.mobile.right += mobilePaddingPx;
  }

  // Media player padding
  const mediaPlayerPaddingPx =
    options?.autoPadding?.media_player_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.media_player_px ??
    0;
  const mediaPlayerPosition = options?.widgetPositions?.media_player ?? null;

  if (mediaPlayerPosition) {
    switch (mediaPlayerPosition) {
      case WidgetPosition.topLeft:
      case WidgetPosition.topCenter:
      case WidgetPosition.topRight:
        totalPaddings.desktop[DesktopPosition.top] += mediaPlayerPaddingPx;
        break;
      case WidgetPosition.bottomCenter:
      case WidgetPosition.bottomRight:
      case WidgetPosition.bottomLeft:
        totalPaddings.desktop[DesktopPosition.bottom] += mediaPlayerPaddingPx;
        break;
    }
    totalPaddings.mobile.bottom += mediaPlayerPaddingPx;
    if (mobilePosition === MobilePosition.right) {
      totalPaddings.mobile.right += mediaPlayerPaddingPx;
    }
  }

  // Raise the side-docked reserves to the navbar's real size. The measurement
  // only describes the layout currently on screen, so it is applied to the
  // matching mode only - a landscape mobile measurement must not leak into the
  // desktop media query, and vice versa. Sides explicitly zeroed by the user
  // are left alone so `*_px: 0` remains a way to opt out.
  const isDesktopViewport = window.innerWidth >= desktopMinWidth;
  if (options?.measuredEdgeReserve) {
    lastKnownEdgeReserve = options.measuredEdgeReserve;
  }
  const measuredEdgeReserve =
    options?.measuredEdgeReserve ?? lastKnownEdgeReserve;

  if (isDesktopViewport) {
    if (
      desktopPosition === DesktopPosition.left &&
      totalPaddings.desktop[DesktopPosition.left] > 0
    ) {
      totalPaddings.desktop[DesktopPosition.left] = Math.max(
        totalPaddings.desktop[DesktopPosition.left],
        measuredEdgeReserve?.left ?? 0,
      );
    }
    if (
      desktopPosition === DesktopPosition.right &&
      totalPaddings.desktop[DesktopPosition.right] > 0
    ) {
      totalPaddings.desktop[DesktopPosition.right] = Math.max(
        totalPaddings.desktop[DesktopPosition.right],
        measuredEdgeReserve?.right ?? 0,
      );
    }
  } else if (
    mobilePosition === MobilePosition.right &&
    totalPaddings.mobile.right > 0 &&
    window.matchMedia?.('(orientation: landscape)').matches
  ) {
    totalPaddings.mobile.right = Math.max(
      totalPaddings.mobile.right,
      measuredEdgeReserve?.right ?? 0,
    );
  }

  // Build CSS text
  if (totalPaddings.desktop[DesktopPosition.top] > 0) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
        :not(.edit-mode) > hui-view:before {
          content: "";
          display: block;
          height: ${totalPaddings.desktop[DesktopPosition.top]}px;
          width: 100%;
          background-color: transparent;
        }
      }
    `;
  }
  if (totalPaddings.desktop[DesktopPosition.bottom] > 0) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
        :not(.edit-mode) > hui-view:after {
          content: "";
          display: block;
          height: ${totalPaddings.desktop[DesktopPosition.bottom]}px;
          width: 100%;
          background-color: transparent;
        }
      }
    `;
  }
  if (totalPaddings.desktop[DesktopPosition.left] > 0) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
       :not(.edit-mode) > #view {
            padding-left: ${totalPaddings.desktop[DesktopPosition.left]}px !important;
          }
      }
    `;
  }
  if (totalPaddings.desktop[DesktopPosition.right] > 0) {
    cssText += `
      @media (min-width: ${desktopMinWidth}px) {
       :not(.edit-mode) > #view {
            padding-right: ${totalPaddings.desktop[DesktopPosition.right]}px !important;
          }
      }
    `;
  }
  if (totalPaddings.mobile.bottom > 0) {
    // When docked to the right, the bottom bar (and its padding) only
    // applies while the device is in portrait orientation.
    const orientationQuery =
      mobilePosition === MobilePosition.right
        ? ' and (orientation: portrait)'
        : '';
    cssText += `
        @media (max-width: ${mobileMaxWidth}px)${orientationQuery} {
          :not(.edit-mode) > hui-view:after {
            content: "";
            display: block;
            height: ${totalPaddings.mobile.bottom}px;
            width: 100%;
            background-color: transparent;
            }
          }
        `;
  }
  if (
    mobilePosition === MobilePosition.right &&
    totalPaddings.mobile.right > 0
  ) {
    cssText += `
        @media (max-width: ${mobileMaxWidth}px) and (orientation: landscape) {
          :not(.edit-mode) > #view {
            padding-right: ${totalPaddings.mobile.right}px !important;
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
