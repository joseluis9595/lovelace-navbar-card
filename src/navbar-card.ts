import { css, CSSResultGroup, html, LitElement, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { version } from '../package.json';
import { HomeAssistant, navigate } from 'custom-card-helpers';
import { DesktopPosition, NavbarCardConfig, RouteItem } from './types';
import { mapStringToEnum } from './utils';
import { getNavbarTemplates } from './dom-utils';

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

// Register our new custom card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card with a full-width bottom nav on mobile and a flexible nav on desktop that can be placed on any side of the screen.',
});

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state() private hass!: HomeAssistant;
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

  private _handleClick = (route: RouteItem) => {
    if (route.tap_action != null) {
      const event = new Event('hass-action', { bubbles: true, composed: true });
      // @ts-ignore
      event.detail = {
        action: 'tap',
        config: {
          tap_action: route.tap_action,
        },
      };

      this.dispatchEvent(event);
    } else {
      navigate(this, route.url);
    }
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
    // TODO improve this detection
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
    // Check for template configuration
    if (config?.template) {
      // Get templates from the DOM
      const templates = getNavbarTemplates();

      // If no templates are found, but the card is configured to use a template, warn and use the default configuration.
      if (!templates) {
        console.warn(
          '[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' +
            '\n\n' +
            'https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n',
        );
      } else {
        // Merge template configuration with the card configuration, giving priority to the card
        const templateConfig = templates[config.template];
        if (templateConfig) {
          config = {
            ...templateConfig,
            ...config,
          };
        }
      }
    }

    // Check for valid configuration
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }
    config.routes.forEach(route => {
      if (route.icon == null) {
        throw new Error('Each route must have an "icon" property configured');
      }
      if (route.tap_action == null && route.url == null) {
        throw new Error(
          'Each route must either have a "url" or a "tap_action" param',
        );
      }
    });

    // Store configuration
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
   * Stub configuration to be properly displayed in the "new card"
   * dialog in home assistant
   */
  static getStubConfig(): NavbarCardConfig {
    return {
      routes: [
        { url: window.location.pathname, icon: 'mdi:home', label: 'Home' },
        {
          url: `${window.location.pathname}/devices`,
          icon: 'mdi:devices',
          label: 'Devices',
        },
        {
          url: '/config/automation/dashboard',
          icon: 'mdi:creation',
          label: 'Automations',
        },
        { url: '/config/dashboard', icon: 'mdi:cog', label: 'Settings' },
      ],
    };
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
    const deviceModeClassName = isDesktopMode ? 'desktop' : 'mobile';
    const editModeClassname =
      this._inEditMode || this._inPreviewMode ? 'edit-mode' : '';

    // TODO use HA ripple effect for icon button
    return html`
      <style>
        ${this.customStyles}
      </style>
      <ha-card
        class="navbar ${editModeClassname} ${deviceModeClassName} ${desktopPositionClassname}">
        ${routes?.map((route, index) => {
          const isActive = this._location == route.url;
          const showBadge = this.evaluateBadge(route.badge?.template);

          return html`
            <div
              key="navbar_item_${index}"
              class="route ${isActive ? 'active' : ''}"
              @click=${() => this._handleClick(route)}>
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
            </div>
          `;
        })}
      </ha-card>
    `;
  }

  /**
   * Dynamically apply user-provided styles
   */
  private get customStyles(): CSSResultGroup {
    const userStyles = this._config?.styles
      ? unsafeCSS(this._config.styles)
      : css``;

    // Combine default styles and user styles
    return [this.defaultStyles, userStyles];
  }

  /**
   * Custom function to apply default styles instead of using lit's static
   * styles(), so that we can prioritize user custom styles over the default
   * ones defined in this card
   */
  private get defaultStyles(): CSSResultGroup {
    // Mobile-first css styling
    return css`
      .navbar {
        --navbar-background-color: var(--card-background-color);
        --navbar-route-icon-size: 24px;
        --navbar-primary-color: var(--primary-color);

        background: var(--navbar-background-color);
        border-radius: 0px;
        /* TODO harcoded box shadow? */
        box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
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
      .route {
        cursor: pointer;
        max-width: 60px;
        width: 100%;
        position: relative;
        text-decoration: none;
        color: var(--primary-text-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: filter 0.2s ease;
        --icon-primary-color: var(--state-inactive-color);
      }
      .route:hover {
        filter: brightness(1.2);
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
        box-shadow: var(--material-shadow-elevation-2dp);
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
