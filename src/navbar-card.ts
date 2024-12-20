import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';
import { DesktopPosition } from './types';
import { mapStringToEnum } from './utils';

// TODO add proper typing to window
// @ts-ignore
window.customCards = window.customCards || [];
// @ts-ignore
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen.',
});

type NavbarCardConfig = {
  routes: {
    url: string;
    icon: string;
    icon_selected?: string;
    label?: string;
    badge?: {
      template?: string;
      color?: string;
    };
  }[];
  desktop?: {
    show_labels?: boolean;
    min_width?: number;
    position?: DesktopPosition;
  };
  mobile?: {
    show_labels?: boolean;
  };
};

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state() private hass?: HomeAssistant;
  @state() private _config?: NavbarCardConfig;
  @state() private screenWidth?: number;
  @state() private _inEditMode?: boolean;
  @state() private _inPreviewMode?: boolean;
  @state() private _lastRender?: number;
  @state() private _location?: string;

  // Badge visibility evaluator
  private evaluateBadge(template?: string): boolean {
    if (!template || !this.hass) return false;
    try {
      // Dynamically evaluate template with current Home Assistant context
      const func = new Function('states', `return ${template}`);
      return func(this.hass.states) as boolean;
    } catch (e) {
      console.warn(`NavbarCard: Error evaluating badge template: ${e}`);
      return false;
    }
  }

  /**
   * Private resize callback to update screenWidth
   */
  private _onResize = () => {
    this.screenWidth = window.innerWidth;
  };

  connectedCallback(): void {
    super.connectedCallback();

    // Initialize location
    this._location = window.location.pathname;

    // Initialize screen size listener
    window.addEventListener('resize', this._onResize);
    this.screenWidth = window.innerWidth;

    // Check if Home Assistant dashboard is in edit mode
    this._inEditMode =
      this.parentElement?.closest('hui-card-edit-mode') != null;

    // Check if the card is in preview mode
    this._inPreviewMode =
      document
        .querySelector('body > home-assistant')
        ?.shadowRoot?.querySelector('hui-dialog-edit-card')
        ?.shadowRoot?.querySelector(
          'ha-dialog > div.content > div.element-preview',
        ) != null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Remove event listeners
    window.removeEventListener('resize', this._onResize);
  }

  /**
   * Set config
   */
  setConfig(config) {
    this._config = config;
  }

  /**
   * Manually control whether to re-render or not the card
   */
  shouldUpdate(changedProperties) {
    let shouldUpdate = false;
    changedProperties.forEach((_, propName) => {
      if (
        [
          '_config',
          'screenWidth',
          '_inEditMode',
          '_inPreviewMode',
          '_location',
        ].includes(propName)
      ) {
        shouldUpdate = true;
      } else if (propName == 'hass') {
        // Render card when hass object changes, but debounced every 1s
        if (new Date().getTime() - (this._lastRender ?? 0) > 1000) {
          shouldUpdate = true;
        }
      }
    });
    return shouldUpdate;
  }

  /**
   * Default render function
   */
  protected render() {
    if (!this._config) {
      return html``;
    }

    const { routes, desktop, mobile } = this._config;
    const {
      position: desktopPosition,
      show_labels: desktopShowLabels,
      min_width: desktopMinWidth,
    } = desktop ?? {};
    const { show_labels: mobileShowLabels } = mobile ?? {};

    // Keep last render timestamp for debounced state updates
    this._lastRender = new Date().getTime();

    // Check desktop mode
    const isDesktopMode = (this.screenWidth ?? 0) >= (desktopMinWidth ?? 768);

    // Choose css classnames
    const desktopPositionClassname =
      mapStringToEnum(DesktopPosition, desktopPosition as string) ??
      DesktopPosition.bottom;
    const desktopModeClassname = isDesktopMode ? 'desktop' : 'mobile';
    const editModeClassname =
      this._inEditMode || this._inPreviewMode ? 'edit-mode' : '';

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card
        class="navbar ${editModeClassname} ${desktopModeClassname} ${desktopPositionClassname}">
        ${routes?.map((route, index) => {
          const isActive = this._location == route.url;
          const showBadge = this.evaluateBadge(route.badge?.template);

          return html`
            <a
              key="navbar_item_${index}"
              class="route ${isActive ? 'active' : ''}"
              href="${route.url}">
              ${showBadge
                ? html`<div
                    class="badge ${isActive ? 'active' : ''}"
                    style="background-color: ${route.badge?.color ||
                    'red'};"></div>`
                : html``}

              <div class="button ${isActive ? 'active' : ''}">
                <ha-icon
                  class="icon ${isActive ? 'active' : ''}"
                  icon="${isActive && route.icon_selected
                    ? route.icon_selected
                    : route.icon}"></ha-icon>
              </div>
              ${(isDesktopMode && desktopShowLabels) ||
              (!isDesktopMode && mobileShowLabels)
                ? html`<div class="label ${isActive ? 'active' : ''}">
                    ${route.label ?? ' '}
                  </div>`
                : html``}
            </a>
          `;
        })}
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    // Mobile-first css styling
    return css`
      .navbar {
        background: var(--card-background-color);
        border-radius: 0px;
        /* TODO harcoded box shadow? */
        box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14) !important;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        gap: 10px;
        width: 100vw;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: unset;
        z-index: 2; /* TODO check if needed */

        --navbar-route-icon-size: 24px;
        --navbar-primary-color: var(--primary-color);
      }
      .route {
        max-width: 60px;
        width: 100%;
        position: relative;
        text-decoration: none;
        color: var(--primary-text-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        --icon-primary-color: var(--state-inactive-color);
      }

      /* Button styling */
      .button {
        height: 36px;
        width: 100%;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .button.active {
        background: color-mix(
          in srgb,
          var(--navbar-primary-color) 30%,
          transparent
        );
        --icon-primary-color: var(--navbar-primary-color);
      }

      /* Icon styling */
      .icon {
        --mdc-icon-size: var(--navbar-route-icon-size);
      }

      /* Label styling */
      .label {
        flex: 1;
        width: 100%;
        /* TODO fix ellipsis*/
        text-align: center;
        font-size: var(--paper-font-caption_-_font-size);
        font-weight: 500;
        font-family: var(--paper-font-caption_-_font-size);
      }

      /* Badge styling */
      .badge {
        border-radius: 999px;
        width: 12px;
        height: 12px;
        position: absolute;
        top: 0;
        right: 0;
      }

      /* Edit mode styles */
      .navbar.edit-mode {
        position: relative !important;
        flex-direction: row !important;
        left: unset !important;
        right: unset !important;
        bottom: unset !important;
        top: unset !important;
        width: auto !important;
        transform: none !important;
      }

      /* Desktop mode styles */
      .navbar.desktop {
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--material-shadow-elevation-2dp) !important;
        width: auto;
        justify-content: space-evenly;

        --navbar-route-icon-size: 28px;
      }
      .navbar.desktop.bottom {
        flex-direction: row;
        top: unset;
        right: unset;
        bottom: 16px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      .navbar.desktop.top {
        flex-direction: row;
        bottom: unset;
        right: unset;
        top: 16px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      .navbar.desktop.left {
        flex-direction: column;
        left: calc(var(--mdc-drawer-width, 0px) + 16px);
        right: unset;
        bottom: unset;
        top: 50%;
        transform: translate(0, -50%);
      }
      .navbar.desktop.right {
        flex-direction: column;
        right: 16px;
        left: unset;
        bottom: unset;
        top: 50%;
        transform: translate(0, -50%);
      }
      .navbar.desktop .route {
        height: 60px;
        width: 60px;
      }
      .navbar.desktop .button {
        flex: unset;
        height: 100%;
      }
    `;
  }
}

console.info(
  `%c navbar-card %c ${version} `,
  // Card name styles
  'background-color: #555;\
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 10px 0 0 10px;',
  // Card version styles
  'background-color: #00abd1; \
      padding: 6px 4px;\
      color: #fff;\
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3); \
      border-radius: 0 10px 10px 0;',
);
