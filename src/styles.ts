import { css, CSSResult } from 'lit';

const HOST_STYLES = css`
  :host {
    --navbar-background-color: var(--card-background-color);
    --navbar-route-icon-size: 24px;
    --navbar-primary-color: var(--primary-color);
    --navbar-box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
    --navbar-box-shadow-desktop: var(--material-shadow-elevation-2dp);

    --navbar-z-index: 3;
    --navbar-popup-backdrop-index: 900;
    --navbar-popup-index: 901;
  }
`;

const NAVBAR_STYLES = css`
  .navbar {
    background: var(--navbar-background-color);
    border-radius: 0px;
    box-shadow: var(--navbar-box-shadow);
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
    z-index: var(--navbar-z-index);
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
    box-shadow: var(--navbar-box-shadow-desktop);
    width: auto;
    justify-content: space-evenly;

    --navbar-route-icon-size: 28px;
  }
  .navbar.desktop.bottom {
    flex-direction: row;
    top: unset;
    right: unset;
    bottom: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.top {
    flex-direction: row;
    bottom: unset;
    right: unset;
    top: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
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
`;

const ROUTE_STYLES = css`
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

  /* Desktop mode styles */
  .navbar.desktop .route {
    height: 60px;
    width: 60px;
  }
  .navbar.desktop .button {
    flex: unset;
    height: 100%;
  }
`;

const POPUP_STYLES = css`
  /****************************************/
  /* Backdrop */
  /****************************************/
  .navbar-popup-backdrop {
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: var(--navbar-popup-backdrop-index);
    transition: opacity 0.2s ease;
  }

  .navbar-popup-backdrop.visible {
    opacity: 1;
  }

  /****************************************/
  /* Main popup container */
  /****************************************/
  .navbar-popup {
    pointer-events: none;
    position: fixed;
    opacity: 0;
    padding: 6px;
    gap: 10px;
    z-index: var(--navbar-popup-index);

    display: flex;
    justify-content: center;

    transition: all 0.2s ease;
    transform-origin: bottom left;
  }

  .navbar-popup.open-up {
    flex-direction: column-reverse;
    margin-bottom: 32px;
    transform: translate(0, -100%);
  }

  .navbar-popup.open-bottom {
    flex-direction: column;
    margin-top: 32px;
  }

  .navbar-popup.open-right {
    flex-direction: row;
    margin-left: 32px;
  }

  .navbar-popup.open-left {
    flex-direction: row-reverse;
    margin-right: 32px;
  }

  .navbar-popup.label-right {
    align-items: flex-start;
  }

  .navbar-popup.label-left {
    align-items: flex-end;
  }

  .navbar-popup.visible {
    opacity: 1;
  }

  /****************************************/
  /* Popup item styles */
  /****************************************/

  .popup-item {
    pointer-events: auto;
    cursor: pointer;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    --icon-primary-color: var(--primary-text-color);
    display: flex;
    flex-direction: row-reverse;
    width: fit-content;
    height: fit-content;
    gap: 6px;
    align-items: center;

    opacity: 0;
    transform: translateY(10px);
    transition: filter 0.2s ease;
    transition: all 0.2s ease;
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .popup-item.label-bottom {
    flex-direction: column;
    max-width: 80px;
  }

  .popup-item.label-left {
    flex-direction: row-reverse;
  }

  .popup-item.label-right {
    flex-direction: row;
  }

  .popup-item.label-left .label {
    text-align: end;
  }

  .popup-item.label-right .label {
    text-align: start;
  }

  .popup-item .button {
    width: 50px;
    height: 50px;
    background: var(--navbar-background-color);
    box-shadow: var(--navbar-box-shadow-desktop);
  }
`;

/**
 * Custom function to apply default styles instead of using lit's static
 * styles(), so that we can prioritize user custom styles over the default
 * ones defined in this card
 */
export const getDefaultStyles = (): CSSResult => {
  // Mobile-first css styling
  return css`
    ${HOST_STYLES}
    ${NAVBAR_STYLES}
    ${ROUTE_STYLES}
    ${POPUP_STYLES}
  `;
};
