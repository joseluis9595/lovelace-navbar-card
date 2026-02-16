import { css } from 'lit';

export const EDITOR_STYLES = css`
  .navbar-editor {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .navbar-editor ha-textfield {
    width: 100%;
  }

  .navbar-editor ha-button {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .navbar-editor .navbar-template-toggle-button {
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
  }

  .editor-row-item ha-textfield {
    width: 100%;
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

  ha-expansion-panel h4[slot='header'],
  ha-expansion-panel h5[slot='header'],
  ha-expansion-panel h6[slot='header'] {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.7em;
    padding: 0.2em 0.5em 0.2em 0;
    height: 40px;
    margin: 0px !important;
    margin-left: 1em;
  }

  ha-expansion-panel h4[slot='header'] .expansion-panel-title,
  ha-expansion-panel h5[slot='header'] .expansion-panel-title,
  ha-expansion-panel h6[slot='header'] .expansion-panel-title {
    flex: 1;
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

  /* Custom Editor inputs */

  .editor-select-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .editor-select {
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    min-height: 48px;
    padding: 10px 12px;
    padding-right: 32px;
    border-radius: var(--ha-border-radius-sm, 4px); /* TODO JLAQ: review this variable */
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.14));
    background: var(--input-fill-color, var(--card-background-color, #fff));
    color: var(--primary-text-color, #000);
    outline: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    /* Remove default dropdown arrow */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    /* Add our own dropdown icon */
    background-image: linear-gradient(
      135deg,
      transparent 50%,
      var(--secondary-text-color, #666) 50%
    );
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 8px 6px; /* slightly wider than tall for a crisp arrow */
  }

  .editor-select:hover:not(:disabled) {
    border-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 40%,
      var(--divider-color, rgba(0, 0, 0, 0.14))
    );
    background-color: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 4%,
      var(--input-fill-color, var(--card-background-color, #fff))
    );
  }

  .editor-select:focus {
    border-color: var(--primary-color, #03a9f4);
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--primary-color, #03a9f4) 30%, transparent);
  }

  .editor-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .editor-select-helper {
    font-size: 0.9em;
    color: var(--secondary-text-color, #666);
  }

  /* Custom Tabs Styles */

  .editor-tab-nav {
    margin-bottom: 0.25em;
    display: flex;
    background: var(--card-background-color, #fff);
    border-radius: 8px;
    border: 1px solid var(--divider-color, #e0e0e0);
  }

  .editor-tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 6px 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    font-weight: 600;
    color: var(--secondary-text-color, #666);
    position: relative;
    overflow: hidden;
  }

  .editor-tab-button:hover {
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 10%,
      transparent
    );
  }

  .editor-tab-button.active {
    background: var(--primary-color, #03a9f4);
    color: white;
  }

  .editor-tab-button ha-icon {
    --mdc-icon-size: 18px;
  }

  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;
  }

  .loader {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: inline-block;
    border: 2px solid transparent;
    border-top: 4px solid var(--primary-color, #03a9f4);
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
