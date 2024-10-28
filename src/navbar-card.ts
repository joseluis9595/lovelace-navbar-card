import { HomeAssistant } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';

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
  }[];
  desktop_min_width?: number;
};

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state()
  private _config?: NavbarCardConfig;

  @state()
  private screenWidth?: number;

  constructor() {
    super();
    console.info(
      `%c navbar-card %c ${version} `,
      // Card name styles
      'background-color: #555;\
      padding: 6px 4px;\
      color: #fff;\
      border-radius: 10px 0 0 10px;',
      // Card version styles
      'background-color: #00abd1; \
      color: #fff;\
      padding: 6px 4px;\
      border-radius: 0 10px 10px 0;',
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Initialize screen size listener
    window.addEventListener('resize', this._onResize);
    this.screenWidth = window.innerWidth;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Remove event listeners
    window.removeEventListener('resize', this._onResize);
  }

  private _onResize = () => {
    this.screenWidth = window.innerWidth;
  };

  setConfig(config) {
    this._config = config;
  }

  protected render() {
    if (!this._config) {
      return html``;
    }

    const isDesktopMode =
      (this.screenWidth ?? 0) >= (this._config.desktop_min_width ?? 768);

    const { routes } = this._config;

    // TODO this check does not update instantly when changing to edit mode in HA
    const inEditMode =
      this.parentElement?.closest('hui-card-edit-mode') !== null;

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card
        class="navbar ${inEditMode ? 'edit-mode' : ''} ${isDesktopMode
          ? 'desktop'
          : 'mobile'}">
        ${routes?.map((route, index) => {
          const isActive = window.location.pathname == route.url;

          return html`
            <a
              key="navbar_item_${index}"
              class="icon-button ${isActive ? 'active' : ''}"
              href="${route.url}">
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
    `;
  }
}
