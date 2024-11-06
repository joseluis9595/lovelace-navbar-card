import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant } from 'custom-card-helpers';

// TODO add proper typing to window
// @ts-ignore
window.customCards = window.customCards || [];
// @ts-ignore
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card that displays a bottom nav in mobile devices, and a side nav in desktop devices',
});

type NavbarCardConfig = {
  routes: {
    url: string;
    icon: string;
    icon_selected?: string;
    badge?: {
      template?: string;
      color?: string;
    };
  }[];
  desktop_min_width?: number;
};

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state() private hass?: HomeAssistant;
  @state() private _config?: NavbarCardConfig;
  @state() private screenWidth?: number;
  @state() private inEditMode?: boolean;
  @state() private lastRender?: number;

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
    // Initialize screen size listener
    window.addEventListener('resize', this._onResize);
    this.screenWidth = window.innerWidth;

    // Check if Home Assistant dashboard is in edit mode
    this.inEditMode =
      this.parentElement?.closest('hui-card-edit-mode') !== null;
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
      if (['_config', 'screenWidth', 'inEditMode'].includes(propName)) {
        shouldUpdate = true;
      } else if (propName == 'hass') {
        // Render card when hass object changes, but debounced every 1s
        if (new Date().getTime() - (this.lastRender ?? 0) > 1000) {
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

    const { routes } = this._config;

    // Keep last render timestamp for debounced state updates
    this.lastRender = new Date().getTime();

    // Check desktop mode
    const isDesktopMode =
      (this.screenWidth ?? 0) >= (this._config.desktop_min_width ?? 768);

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card
        class="navbar ${this.inEditMode ? 'edit-mode' : ''} ${isDesktopMode
          ? 'desktop'
          : 'mobile'}">
        ${routes?.map((route, index) => {
          const isActive = window.location.pathname == route.url;
          const showBadge = this.evaluateBadge(route.badge?.template);

          return html`
            <a
              key="navbar_item_${index}"
              class="icon-button ${isActive ? 'active' : ''}"
              href="${route.url}">
              ${showBadge
                ? html`<div
                    class="badge"
                    style="background-color: ${route.badge?.color ||
                    'red'};"></div>`
                : html``}
              <ha-icon
                icon="${isActive && route.icon_selected
                  ? route.icon_selected
                  : route.icon}"></ha-icon>
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
      }
      .icon-button {
        position: relative;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 50px;
        border-radius: 16px;
        --icon-primary-color: var(--state-inactive-color);
      }
      .icon-button.active {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        --icon-primary-color: var(--primary-color);
      }

      /* Edit mode styles */
      .navbar.edit-mode {
        position: relative !important;
        flex-direction: row !important;
        left: unset !important;
        width: auto !important;
      }

      /* Desktop mode styles */
      .desktop.navbar {
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--material-shadow-elevation-2dp) !important;
        width: auto;
        left: calc(var(--mdc-drawer-width, 0px) + 16px);
        right: unset;
        bottom: unset;
        top: 50%;
        transform: translate(0, -50%);
        justify-content: space-evenly;
        flex-direction: column;
      }
      .desktop .icon-button {
        flex: unset;
        width: 60px;
        height: 60px;
      }
      .badge {
        border-radius: 999px;
        width: 12px;
        height: 12px;
        position: absolute;
        top: 0;
        right: 0;
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
