import { css, CSSResult } from 'lit';

const HOST_STYLES = css`
  :host {
    --navbar-border-radius: var(--ha-card-border-radius, 12px);
    --navbar-background-color: var(--card-background-color);
    --navbar-route-icon-size: 24px;
    --navbar-route-image-size: 32px;
    --navbar-primary-color: var(--primary-color);
    --navbar-box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
    --navbar-box-shadow-desktop: var(--material-shadow-elevation-2dp);
    --navbar-box-shadow-mobile-floating: var(--material-shadow-elevation-2dp);

    --navbar-z-index: 3;
    --navbar-popup-backdrop-z-index: 900;
    --navbar-popup-z-index: 901;
  }
`;

const NAVBAR_CONTAINER_STYLES = css`
  .navbar {
    display: flex;
    flex-direction: column;
    width: 100vw;
    position: fixed;
    gap: 10px;
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    z-index: var(--navbar-z-index);
  }

  ha-card {
    background: var(--navbar-background-color);
    border-radius: 0px;
    box-shadow: var(--navbar-box-shadow);
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px;
    gap: 10px;
  }

  .navbar-card {
    justify-content: space-between;
    width: 100%;
  }

  /* Edit mode styles */
  .navbar.edit-mode {
    position: relative !important;
    flex-direction: column !important;
    left: unset !important;
    right: unset !important;
    bottom: unset !important;
    width: auto !important;
    top: unset !important;
    transform: none !important;
  }

  .navbar.edit-mode ha-card {
    width: 100% !important;
    flex-direction: row !important;
  }

  /* Mobile floating style */
  .navbar-card.mobile.floating {
    border: none !important;
    box-shadow: var(--navbar-box-shadow-mobile-floating) !important;
    border-radius: var(--navbar-border-radius) !important;
    margin-bottom: 10px;
    width: 90%;
  }

  /* Desktop mode styles */
  .navbar.desktop {
    width: auto;
    justify-content: space-evenly;
    --navbar-route-icon-size: 28px;
  }

  .navbar-card.desktop {
    border-radius: var(--navbar-border-radius);
    box-shadow: var(--navbar-box-shadow-desktop);
  }

  .navbar.desktop.bottom {
    flex-direction: column;
    top: unset;
    right: unset;
    bottom: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }

  .navbar-card.desktop.bottom {
    flex-direction: row;
  }

  .navbar.desktop.top {
    flex-direction: column;
    bottom: unset;
    right: unset;
    top: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }

  .navbar-card.desktop.top {
    flex-direction: row;
  }

  .navbar.desktop.left {
    flex-direction: row-reverse;
    left: calc(var(--mdc-drawer-width, 0px) + 16px);
    right: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }

  .navbar-card.desktop.left {
    flex-direction: column;
  }

  .navbar.desktop.right {
    flex-direction: row;
    right: 16px;
    left: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }

  .navbar-card.desktop.right {
    flex-direction: column;
  }
`;

const MEDIA_PLAYER_STYLES = css`
  .media-player.error {
    padding: 0px !important;
  }

  .media-player.error ha-alert {
    width: 100%;
  }

  .media-player {
    cursor: pointer;
    width: 90%;
    overflow: hidden;
    position: relative;
    border: none;
    box-shadow: var(--navbar-box-shadow-mobile-floating);
    border-radius: var(--navbar-border-radius);
    display: flex;
    flex-direction: row;
  }

  .media-player .media-player-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    opacity: 0.3;
    z-index: 0;
  }

  .media-player .media-player-image {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    object-fit: cover;
    margin-right: 6px;
  }

  .media-player .media-player-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .media-player .media-player-title {
    font-size: 14px;
    font-weight: 500;
  }

  .media-player .media-player-artist {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .media-player .media-player-button {
    width: 38px;
    --ha-button-height: 38px;
    --ha-button-border-radius: 999px;
  }

  .media-player .media-player-button.media-player-button-play-pause {
  }

  .media-player .media-player-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  .media-player .media-player-progress-bar-fill {
    background-color: var(--navbar-primary-color);
    height: 100%;
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
    --icon-primary-color: var(--state-inactive-color);
  }

  /* Button styling */
  .button {
    position: relative;
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

  /* Icon and Image styling */
  .icon {
    --mdc-icon-size: var(--navbar-route-icon-size);
  }

  .image {
    width: var(--navbar-route-image-size);
    height: var(--navbar-route-image-size);
    object-fit: contain;
  }

  .image.active {
  }

  /* Label styling */
  .label {
    flex: 1;
    width: 100%;
    /* TODO fix ellipsis*/
    text-align: center;
    font-size: var(--paper-font-caption_-_font-size, 12px);
    font-weight: 500;
  }

  /* Badge styling */
  .badge {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 999px;
    width: 12px;
    height: 12px;
  }
  .badge.with-counter {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16px;
    width: auto !important;
    min-width: 16px;
    padding: 0px 2px;
    font-weight: bold;
    font-size: 11px;
    line-height: 11px;
  }

  /* Desktop mode styles */
  .desktop .route {
    height: 60px;
    width: 60px;
  }
  .desktop .button {
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
    z-index: var(--navbar-popup-backdrop-z-index);
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
    z-index: var(--navbar-popup-z-index);

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

  .navbar-popup.open-right.popuplabelbackground {
    gap: 24px;
  }

  .navbar-popup.open-left {
    flex-direction: row-reverse;
    margin-right: 32px;
  }

  .navbar-popup.open-left.popuplabelbackground {
    gap: 24px;
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

  .navbar-popup.popuplabelbackground {
    padding-left: 0px;
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

  .popup-item .button.popuplabelbackground {
    width: 100%;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: row;
    gap: 4px;
  }

  .popup-item.active {
    --icon-primary-color: var(--navbar-primary-color);
  }

  .popup-item.active .button {
    color: var(--navbar-primary-color);
    background: color-mix(in srgb, var(--navbar-primary-color) 30%, white);
  }
`;

const EDITOR_STYLES = css`
  .navbar-editor {
    display: flex;
    flex-direction: column;
    gap: 6px;

    ha-textfield {
      width: 100%;
    }

    ha-button {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .navbar-template-toggle-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5em;
      padding: 0px !important;
      border-radius: 99px;
      font-size: 0.85em;
      font-weight: 600;
      border: 0px;
      padding: 4px 8px !important;
      cursor: pointer;
    }
  }
  .editor-section {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 12px;
  }
  .editor-row {
    gap: 6px;
    display: flex;
    flex-direction: row;
  }
  .editor-row-item {
    flex: 1;

    ha-textfield {
      width: 100%;
    }
  }
  @media (max-width: 600px) {
    .editor-row {
      flex-direction: column !important;
      gap: 0.5em;
    }
    .route-grid {
      grid-template-columns: 1fr !important;
    }
    .editor-row-item {
      width: 100%;
    }
  }
  .editor-label {
    font-weight: 500;
  }
  .routes-container {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }
  ha-expansion-panel {
    h4[slot='header'],
    h5[slot='header'],
    h6[slot='header'] {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.7em;
      padding: 0.2em 0.5em 0.2em 0;
      height: 40px;
      margin: 0px !important;
      margin-left: 1em;

      .expansion-panel-title {
        flex: 1;
      }
    }
  }
  .route-header {
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.2em 0.5em 0.2em 0;
  }
  .route-header-title {
    font-weight: bold;
    color: var(--primary-color);
  }
  .route-header-summary {
    flex: 1;
    opacity: 0.7;
    font-size: 0.95em;
    display: flex;
    align-items: center;
    gap: 0.3em;
  }
  .route-header-image {
    height: 1.2em;
    vertical-align: middle;
  }
  .route-editor {
    display: flex;
    flex-direction: column;
    gap: 1em;
    background: var(--primary-background-color);
    border-radius: 8px;
    padding: 1em 1.2em 1.2em 1.2em;
    margin: 1em 0em;
  }
  .popup-controls {
    display: flex;
    gap: 0.5em;
    margin-bottom: 1em;
  }
  .route-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }
  .route-divider {
    margin: 1.5em 0 1em 0;
    border: none;
    border-top: 1px solid #e0e0e0;
    height: 1px;
    background: none;
  }
  .add-popup-btn {
    margin-top: 1em;
  }
  .template-editor-container {
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    margin-bottom: 0.7em;
  }
  .template-editor-helper {
    font-size: 0.93em;
    color: var(--secondary-text-color, #888);
  }
  .quickbar-mode-container {
    display: flex;
    flex-direction: column;
  }
  .templatable-field-container {
    display: flex;
    flex-direction: row;
  }
  .templatable-field-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
  }
  .templatable-field-header-label {
    flex: 1;
  }
`;

// Drag-and-drop styles for routes editor
export const ROUTES_EDITOR_DND_STYLES = css`
  .draggable-route {
    border: 1.5px dashed transparent;
    border-radius: 8px;
    transition:
      border-color 0.2s,
      background 0.2s;
    background: none;
    position: relative;
  }
  .draggable-route.drag-over {
    border-color: var(--primary-color, #03a9f4);
    background: rgba(3, 169, 244, 0.08);
  }
  .draggable-route.dragging {
    opacity: 0.6;
    background: #eee;
    z-index: 2;
  }
  .drag-handle {
    cursor: grab;
    margin-right: 8px;
    color: var(--primary-color, #03a9f4);
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
  }
  .delete-btn ha-icon {
    color: var(--error-color, #db4437) !important;
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
    ${NAVBAR_CONTAINER_STYLES}
    ${MEDIA_PLAYER_STYLES}
    ${ROUTE_STYLES}
    ${POPUP_STYLES}
  `;
};

export const getEditorStyles = (): CSSResult => {
  return css`
    ${EDITOR_STYLES}
    ${ROUTES_EDITOR_DND_STYLES}
  `;
};
