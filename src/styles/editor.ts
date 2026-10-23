import { css } from 'lit';

export const EDITOR_STYLES = css`
  .navbar-editor {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .navbar-editor ha-input {
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

  .reset-overrides-button {
    white-space: nowrap;
  }

  .template-editing-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 1em;
  }

  .editor-section {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 12px;
  }

  .editor-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .editor-row-item {
    min-width: 0;
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
    min-height: 40px;
    margin: 0px !important;
    margin-left: 1em;
  }

  ha-expansion-panel h4[slot='header'] .expansion-panel-title,
  ha-expansion-panel h5[slot='header'] .expansion-panel-title,
  ha-expansion-panel h6[slot='header'] .expansion-panel-title {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .expansion-panel-subtitle,
  .expansion-panel-summary {
    font-size: 0.8em;
    font-weight: 400;
    color: var(--secondary-text-color);
  }

  .expansion-panel-summary {
    white-space: nowrap;
  }

  .draggable-item-header {
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.2em 0.5em 0.2em 0;
  }

  .draggable-item-header-icon {
    display: flex;
    color: var(--secondary-text-color);
  }

  .draggable-item-header-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .draggable-item-header-title,
  .draggable-item-header-subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .draggable-item-header-title {
    font-weight: 500;
  }

  .draggable-item-header-subtitle {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }

  .draggable-item-header-image {
    height: 24px;
    width: 24px;
    object-fit: cover;
    border-radius: 50%;
  }

  /* Dialog to edit a shared template, above the card editor */

  .template-dialog {
    width: min(600px, 95vw);
    max-height: 90vh;
    padding: 0;
    border: none;
    border-radius: var(--ha-dialog-border-radius, 24px);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .template-dialog[open] {
    display: flex;
    flex-direction: column;
  }

  .template-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 600px) {
    .template-dialog {
      inset: 0;
      margin: 0;
      width: 100%;
      max-width: none;
      height: 100%;
      max-height: none;
      border-radius: 0;
    }
  }

  .template-dialog-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 12px 12px 24px;
    border-bottom: 1px solid var(--divider-color);
  }

  .template-dialog-title {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 1.25em;
    font-weight: 500;
  }

  .template-dialog-subtitle {
    font-size: 0.65em;
    font-weight: 400;
    color: var(--secondary-text-color);
  }

  .template-dialog-body {
    flex: 1;
    overflow: auto;
    padding: 16px 24px;
  }

  .template-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 24px 16px;
    border-top: 1px solid var(--divider-color);
  }

  @media (max-width: 600px) {
    .template-dialog-header {
      padding-top: calc(16px + env(safe-area-inset-top));
    }

    .template-dialog-actions {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
  }

  /* Template section */

  .template-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .template-save-as {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .template-save-as-actions {
    display: flex;
    gap: 8px;
  }

  /* Field shell: marks values that override the template, and ends with an
     options menu (reset, JavaScript template, documentation) */

  .field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .field-content {
    flex: 1;
    min-width: 0;
  }

  .field-content > ha-selector {
    display: block;
    width: 100%;
  }

  .field-overridden {
    padding-left: 10px;
    border-left: 3px solid var(--primary-color);
  }

  .field-menu-button,
  .field-menu-spacer {
    flex: none;
    width: 32px;
  }

  .field-menu-button {
    position: relative;
    color: var(--secondary-text-color);
    --mdc-icon-button-size: 32px;
    --ha-icon-button-size: 32px;
    --mdc-icon-size: 20px;
  }

  /* A dot on the menu button when a reset or template option is in use */
  .field-menu-button.highlighted {
    color: var(--primary-color);
  }

  .field-menu-button.highlighted::after {
    content: '';
    position: absolute;
    top: 4px;
    right: 4px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--primary-color);
    pointer-events: none;
  }

  /* Popover in the top layer, placed next to its button by the editor */
  .field-menu {
    position: fixed;
    inset: auto;
    margin: 0;
    min-width: 220px;
    padding: 4px;
    border: 1px solid var(--divider-color);
    border-radius: 10px;
    background: var(--card-background-color, #fff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    color: var(--primary-text-color);
  }

  /* Only while open, to keep the browser hiding it when closed */
  .field-menu:popover-open {
    display: flex;
    flex-direction: column;
  }

  .field-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.9em;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    --mdc-icon-size: 18px;
  }

  .field-menu-item:hover,
  .field-menu-item:focus-visible {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    outline: none;
  }

  .field-menu-item > ha-icon {
    color: var(--secondary-text-color);
  }

  .field-menu-item > span {
    flex: 1;
  }

  .field-menu-external {
    --mdc-icon-size: 14px;
  }

  .templatable-field-toggle {
    color: var(--secondary-text-color);
  }

  .templatable-field-toggle.active {
    color: var(--primary-color);
  }

  .override-chip {
    font-size: 0.75em;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 999px;
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    white-space: nowrap;
  }

  /* Groups of fields, with a caption */

  .group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .group + .group {
    padding-top: 4px;
  }

  .group-caption {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .group-title {
    font-size: 0.8em;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .group-helper {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }

  .group-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Compact switches, in a bordered list */

  .switch-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .switch-list > .field + .field {
    border-top: 1px solid var(--divider-color);
  }

  .switch-list > .field-overridden {
    padding-left: 0;
    border-left: none;
    box-shadow: inset 3px 0 0 var(--primary-color);
  }

  .switch-list .field-row {
    padding-right: 4px;
  }

  /* A switch turned into a JavaScript template */
  .switch-list .template-editor-container {
    padding: 10px 0 10px 12px;
  }

  .switch-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    padding: 6px 8px 6px 12px;
    box-sizing: border-box;
    cursor: pointer;
  }

  .switch-row.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .switch-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .switch-row-helper {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }

  .switch-row ha-switch {
    flex: none;
  }

  /* Lists inherited from the template */

  .inherited-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .inherited-list-hint,
  .editor-subsection-helper {
    font-size: 0.9em;
    color: var(--secondary-text-color);
  }

  .inherited-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 4px;
    color: var(--secondary-text-color);
    border-bottom: 1px solid var(--divider-color);
  }

  .inherited-item-title {
    color: var(--primary-text-color);
  }

  .inherited-item-subtitle {
    flex: 1;
    text-align: right;
    font-size: 0.85em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inherited-list ha-button {
    margin-top: 8px;
  }

  .inherited-list-notice {
    display: block;
  }

  .editor-subsection {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 8px;
  }

  /* Route and player actions */

  .add-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .add-actions-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
    margin-right: 4px;
  }

  .draggable-item-editor {
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

  .editor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }

  .editor-divider {
    margin: 0;
    border: none;
    border-top: 1px solid var(--divider-color);
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

  /* Segmented control */

  .segmented {
    display: flex;
    padding: 3px;
    gap: 3px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }

  .segmented-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 4px 8px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 0.9em;
    cursor: pointer;
    --mdc-icon-size: 18px;
  }

  .segmented-option.active {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .segmented-option:focus-visible {
    outline: 2px solid var(--primary-color);
  }

  .segmented-badge {
    min-width: 18px;
    padding: 0 5px;
    border-radius: 999px;
    font-size: 0.75em;
    line-height: 18px;
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
  }

  /* Route and popup item rows */

  .item-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    overflow: hidden;
  }

  .item-list:empty {
    display: none;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 8px 0 4px;
    cursor: pointer;
    outline: none;
  }

  .item-row + .item-row {
    border-top: 1px solid var(--divider-color);
  }

  .item-row:hover,
  .item-row:focus-visible {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }

  .item-row.drop-before {
    box-shadow: inset 0 2px 0 var(--primary-color);
  }

  .item-row.drop-after {
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  .item-row .drag-handle {
    margin-right: 0;
    padding: 8px 2px;
  }

  .item-row-icon {
    display: flex;
  }

  .item-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .item-row-title,
  .item-row-subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-row-subtitle {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }

  .item-row-chevron {
    color: var(--secondary-text-color);
  }

  /* Route and popup item view */

  .item-view-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--divider-color);
  }

  .item-view-title {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 1.1em;
    font-weight: 500;
  }

  .item-view-subtitle {
    font-size: 0.8em;
    font-weight: 400;
    color: var(--secondary-text-color);
  }

  .action-inline,
  .popup-items {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .popup-items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    background-size: 8px 6px;
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

// Drag-and-drop styles for draggable list items (routes, players, etc.)
export const DRAGGABLE_ITEM_STYLES = css`
  .draggable-item {
    border: 1.5px dashed transparent;
    border-radius: 8px;
    transition:
      border-color 0.2s,
      background 0.2s;
    background: none;
    position: relative;
  }

  .draggable-item.drag-over {
    border-color: var(--primary-color, #03a9f4);
    background: rgba(3, 169, 244, 0.08);
  }

  .draggable-item.dragging {
    opacity: 0.6;
    background: #eee;
    z-index: 2;
  }

  .drag-handle {
    cursor: grab;
    margin-right: 8px;
    color: var(--secondary-text-color);
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
  }

  .delete-btn {
    color: var(--secondary-text-color);
  }

  .delete-btn:hover {
    color: var(--error-color, #db4437);
  }
`;
