import {
  AutoPaddingConfig,
  DEFAULT_NAVBAR_CONFIG,
  NavbarCardConfig,
  RippleElement,
} from './types';

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

  rippleElements.forEach((ripple: RippleElement) => {
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
 * Manually inject styles into the hui-root element to force dashboard padding.
 * This prevents overlaps with other cards in the dashboard.
 */
export const forceDashboardPadding = (options?: {
  desktop: NavbarCardConfig['desktop'];
  mobile: NavbarCardConfig['mobile'];
  auto_padding: AutoPaddingConfig;
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
  const styleId = 'navbar-card-forced-padding-styles';
  let styleEl = huiRoot.shadowRoot.querySelector<HTMLStyleElement>(
    `#${styleId}`,
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
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.desktop_px;
  const desktopPadding =
    options?.desktop?.position === 'left'
      ? `padding-left: ${desktopPaddingPx}px !important;`
      : options?.desktop?.position === 'right'
        ? `padding-right: ${desktopPaddingPx}px !important;`
        : undefined;
  if (desktopPadding) {
    cssText += `
        @media (min-width: ${desktopMinWidth}px) {
          :not(.edit-mode) > #view {
            ${desktopPadding}
          }
        }
      `;
  }

  // Mobile padding
  const mobilePaddingPx =
    options?.auto_padding?.mobile_px ??
    DEFAULT_NAVBAR_CONFIG.layout?.auto_padding?.mobile_px;

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

  // Append styles to hui-root
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = cssText;
    huiRoot.shadowRoot.appendChild(styleEl);
  } else {
    styleEl.textContent = cssText;
  }
};
