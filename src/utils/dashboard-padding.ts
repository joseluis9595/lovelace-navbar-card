import {
  DEFAULT_NAVBAR_CONFIG,
  type NavbarCardConfig,
  type WidgetPosition,
} from '@/types/config';

import { findHuiRoot } from './dom';

/**
 * Dashboard auto padding.
 *
 * Every navbar-card on the page shares this module, so `cardPaddings` holds the
 * padding of all connected cards. Each card registers and unregisters itself
 * through `setDashboardPadding` / `removeDashboardPadding`, and the largest
 * padding on each side is applied through a single style element in hui-root.
 */

const DASHBOARD_PADDING_STYLE_ID = 'navbar-card-forced-padding-styles';

/** Padding in px a card reserves on each side of the dashboard */
type CardPadding = {
  minWidth: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  mobile: number;
};

/** Padding of every connected navbar-card, shared by all instances on the page */
const sharedCardPaddings = new Map<HTMLElement, CardPadding>();

/**
 * Set a card's padding and update the dashboard padding styles.
 * Does nothing if the card's padding did not change.
 */
export const setDashboardPadding = (
  card: HTMLElement,
  config: NavbarCardConfig | undefined,
  mediaPlayerPosition: WidgetPosition | null,
) => {
  const padding = getCardPadding(config, mediaPlayerPosition);
  if (
    JSON.stringify(padding) === JSON.stringify(sharedCardPaddings.get(card))
  ) {
    return;
  }

  if (padding) {
    sharedCardPaddings.set(card, padding);
  } else {
    sharedCardPaddings.delete(card);
  }

  if (!updateStyles()) {
    console.warn(
      '[navbar-card] Could not find <hui-root>. Custom padding styles will not be applied.',
    );
  }
};

/**
 * Remove a card's padding from the dashboard padding styles.
 */
export const removeDashboardPadding = (card: HTMLElement) => {
  if (sharedCardPaddings.delete(card)) updateStyles();
};

/**
 * Resolve the padding a card reserves, or undefined if auto padding is disabled.
 */
const getCardPadding = (
  config: NavbarCardConfig | undefined,
  mediaPlayerPosition: WidgetPosition | null,
): CardPadding | undefined => {
  const autoPadding = {
    ...DEFAULT_NAVBAR_CONFIG.layout?.auto_padding,
    ...config?.layout?.auto_padding,
  };
  if (!autoPadding.enabled) return undefined;

  const { desktop_px = 0, mobile_px = 0, media_player_px = 0 } = autoPadding;
  const padding: CardPadding = {
    bottom: 0,
    left: 0,
    minWidth: config?.desktop?.min_width ?? 768,
    mobile: mobile_px,
    right: 0,
    top: 0,
  };
  padding[
    config?.desktop?.position ?? DEFAULT_NAVBAR_CONFIG.desktop.position
  ] += desktop_px;

  if (mediaPlayerPosition) {
    padding[mediaPlayerPosition.startsWith('top') ? 'top' : 'bottom'] +=
      media_player_px;
    padding.mobile += media_player_px;
  }
  return padding;
};

/**
 * Rebuild the padding style elements from all registered cards: one in hui-root
 * for the view padding, and one in the sections view for its sticky footer.
 * Returns false if hui-root could not be found.
 */
const updateStyles = (): boolean => {
  const root = findHuiRoot()?.shadowRoot;
  if (!root) return false;

  const paddings = [...sharedCardPaddings.values()];
  const largest = (side: keyof CardPadding) =>
    Math.max(0, ...paddings.map(padding => padding[side]));

  // Breakpoint taken from the first card
  const minWidth = paddings[0]?.minWidth ?? 768;
  const desktop = `(min-width: ${minWidth}px)`;
  const mobile = `(max-width: ${minWidth - 1}px)`;

  writeStyle(
    root,
    [
      spacerCss(desktop, 'before', largest('top')),
      spacerCss(desktop, 'after', largest('bottom')),
      sidePaddingCss(desktop, 'left', largest('left')),
      sidePaddingCss(desktop, 'right', largest('right')),
      spacerCss(mobile, 'after', largest('mobile')),
    ].join(''),
  );

  // Sections view footer sticks to the bottom of the screen, behind the navbar
  const sectionsView = root.querySelector('hui-sections-view')?.shadowRoot;
  if (sectionsView) {
    writeStyle(
      sectionsView,
      [
        // Mobile padding already leaves room above the docked navbar, so HA's
        // footer gap is only kept on desktop
        stickyFooterCss(desktop, largest('bottom'), true),
        stickyFooterCss(mobile, largest('mobile')),
      ].join(''),
    );
  }
  return true;
};

/**
 * Write the padding style element of a root, removing it when there is no CSS.
 */
const writeStyle = (root: ShadowRoot, cssText: string) => {
  let styleEl = root.querySelector<HTMLStyleElement>(
    `#${DASHBOARD_PADDING_STYLE_ID}`,
  );
  if (!cssText) {
    styleEl?.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DASHBOARD_PADDING_STYLE_ID;
    root.appendChild(styleEl);
  }
  // Only write when changed, to avoid an unnecessary style recalculation
  if (styleEl.textContent !== cssText) {
    styleEl.textContent = cssText;
  }
};

/** Empty block before/after the view, used for top and bottom padding */
const spacerCss = (media: string, pseudo: 'before' | 'after', px: number) =>
  px > 0
    ? `@media ${media} {
  :not(.edit-mode) > hui-view:${pseudo} {
    content: "";
    display: block;
    height: ${px}px;
    width: 100%;
  }
}
`
    : '';

/** Raise the sticky sections view footer above the navbar */
const stickyFooterCss = (media: string, px: number, keepGap = false) =>
  px > 0
    ? `@media ${media} {
  hui-view-footer[sticky] {
    bottom: ${keepGap ? `calc(var(--row-gap) + ${px}px)` : `${px}px`};
  }
}
`
    : '';

/** View padding, used for left and right padding */
const sidePaddingCss = (media: string, side: 'left' | 'right', px: number) =>
  px > 0
    ? `@media ${media} {
  :not(.edit-mode) > #view {
    padding-${side}: ${px}px !important;
  }
}
`
    : '';
