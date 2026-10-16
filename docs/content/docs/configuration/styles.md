---
title: Styles
---

Custom CSS styles can be applied to Navbar Card to personalize its appearance and adapt it to your dashboard's design. Simply provide a CSS string targeting the relevant classes to style the navbar to your liking.

```yaml
type: custom:navbar-card
# ...
styles: |
  .navbar-card {
    background-color: black;
  }
  .button.active {
    border-radius: 999px;
  }
```

## Anatomy

<!-- Diagrams share one scale (90% of their natural size): each width is also a
     share of the widest (691px), so they shrink together on narrow screens -->
<div class="nc-anatomy" markdown>

![Parts of Navbar Card and their CSS classes](../../img/configuration/navbar-card_anatomy.png#only-light){ style="width: min(454px, 65.7%)" }
![Parts of Navbar Card and their CSS classes](../../img/configuration/navbar-card_anatomy_dark.png#only-dark){ style="width: min(454px, 65.7%)" }

![Parts of the popup and their CSS classes](../../img/configuration/navbar-card_anatomy-popup.png#only-light){ style="width: min(679px, 98.3%)" }
![Parts of the popup and their CSS classes](../../img/configuration/navbar-card_anatomy-popup_dark.png#only-dark){ style="width: min(679px, 98.3%)" }

![Parts of the media player and their CSS classes](../../img/configuration/navbar-card_anatomy-media-player.png#only-light){ style="width: min(691px, 100.0%)" }
![Parts of the media player and their CSS classes](../../img/configuration/navbar-card_anatomy-media-player_dark.png#only-dark){ style="width: min(691px, 100.0%)" }

</div>

!!! tip

    You can check out some examples [**here**](../examples.md) for inspiration.

## Classes

Selectors to copy into `styles`, from the general ones to the specific cases.

### Navbar

| Selector                       | Matches                                                                     |
| ------------------------------ | --------------------------------------------------------------------------- |
| `.navbar`                      | Main wrapper of Navbar Card and its widgets                                 |
| `.navbar-card`                 | The card itself (`ha-card` component)                                       |
| `.navbar-card.desktop`         | The card on desktop                                                         |
| `.navbar-card.mobile`          | The card on mobile                                                          |
| `.navbar-card.desktop.left`    | The card placed on the left on desktop (also `.top`, `.bottom` and `.right`) |
| `.navbar-card.desktop.docked`  | The card on desktop with `mode: docked`                                     |
| `.navbar-card.mobile.floating` | The card on mobile with `mode: floating`                                    |
| `.navbar.mobile.safe-area`     | The wrapper on mobile with `safe_area: true`                                |

### Routes

| Selector         | Matches                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `.route`         | Each route (or item) within the navbar                                   |
| `.button`        | Background element for each icon (popup items too, `.route .button` for routes only) |
| `.icon`          | The ha-icon component used for displaying icons (popup items too)       |
| `.image`         | The img component used for displaying route images                       |
| `.label`         | Text label displayed under the icons, if labels are enabled (popup items too) |
| `.button.active` | Button of the selected route (also `.route`, `.icon`, `.image` and `.label`) |

### Badges

| Selector              | Matches                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `.badge`              | Small indicator or badge that appears over the icon (if configured) |
| `.badge.with-counter` | Badge that displays text or a number                                |
| `.badge.with-icon`    | Badge that displays an icon                                         |
| `.badge-icon`         | The `ha-icon` displayed inside an icon badge                        |
| `.badge.active`       | Badge of the selected route                                         |

### Popup

| Selector                           | Matches                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `.navbar-popup`                    | Main container for the popup                                                  |
| `.navbar-popup-backdrop`           | Backdrop of the popup                                                         |
| `.popup-item`                      | Container of each popup item, with both the "button" and the label            |
| `.popup-item .button`              | Button for each popup item, containing just the icon                          |
| `.popup-item .label`               | Label of each popup item                                                      |
| `.popup-item.active`               | Popup item of the current page                                                |
| `.popup-item.label-left`           | Items with the label left of the button (also `.label-right` and `.label-bottom`) |
| `.popup-item.popuplabelbackground` | Items when `show_popup_label_backgrounds` is enabled                          |

### Media player

| Selector                          | Matches                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `.media-player`                   | The media-player card                                                                      |
| `.media-player-bg`                | Background, with the image of the current media playing, blurred and with very low opacity |
| `.media-player-image`             | Image container of the current song                                                        |
| `.media-player-info`              | Container for the title and artist                                                         |
| `.media-player-title`             | Container for the title                                                                    |
| `.media-player-artist`            | Container for the artist                                                                   |
| `.media-player-button`            | All buttons in the media_player card                                                       |
| `.media-player-button-play-pause` | Play/pause button                                                                          |
| `.media-player-button-skip`       | Skip button                                                                                |
| `.media-player-progress-bar`      | Container for the progress bar of the current playing media                                |
| `.media-player-progress-bar-fill` | Filled section of the progress bar                                                         |
| `.media-player-carousel`          | Container when multiple players are configured                                             |
| `.media-player-dot`               | Each dot of the carousel (`.media-player-dot.active` for the current player)              |

## CSS variables

The `.navbar` component relies on a set of CSS variables to manage its styling. You can customize its appearance by overriding the following variables:

```yaml
styles: |
  .navbar {
    --navbar-primary-color: red;
    --navbar-border-radius: 24px;
  }
```

### Colors

| Name                        | Default value                | Description                                                              |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `--navbar-primary-color`    | var(--primary-color)         | Accent color used for Navbar Card                                 |
| `--navbar-background-color` | var(--card-background-color) | Background color used for all `ha-card` elements inside `.navbar` |

### Sizes

| Name                        | Default value                      | Description                                                             |
| --------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `--navbar-border-radius`    | var(--ha-card-border-radius, 12px) | Border radius applied to all `ha-card` elements inside `.navbar` |
| `--navbar-route-icon-size`  | 24px (28px on desktop)             | Size in pixels for each `.icon` element (set it on `.navbar-card` to also change it on desktop) |
| `--navbar-route-image-size` | 32px                               | Size in pixels for each `.image` element                         |
| `--navbar-badge-size`       | 16px                               | Size of badges that contain a count, text, or icon               |
| `--navbar-badge-icon-size`  | 12px                               | Size of the icon displayed inside an icon badge                  |

### Shadows

| Name                                  | Default value                        | Description                                    |
| ------------------------------------- | ------------------------------------ | --------------------------------------- |
| `--navbar-box-shadow`                 | 0px -1px 4px 0px rgba(0, 0, 0, 0.14) | Box shadow used in mobile docked layout |
| `--navbar-box-shadow-mobile-floating` | var(--material-shadow-elevation-2dp) | Box shadow used in mobile floating mode |
| `--navbar-box-shadow-desktop`         | var(--material-shadow-elevation-2dp) | Box shadow used in desktop mode         |

### Position

| Name                   | Default value                                         | Description                                                     |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `--navbar-left-margin` | var(--ha-sidebar-width, var(--mdc-drawer-width, 0px)) | Left margin of the navbar on desktop (the HA sidebar width) |
| `--navbar-edge-inset`  | 16px                                                  | Distance between the navbar and the screen edge on desktop  |

### Z-index

| Name                              | Default value | Description                                                  |
| --------------------------------- | ------------- | ----------------------------------------------------- |
| `--navbar-z-index`                | 3             | Default z-index for Navbar Card                       |
| `--navbar-media-player-z-index`   | 4             | z-index used for the media player widget              |
| `--navbar-popup-backdrop-z-index` | 900           | z-index used for the `.navbar-popup-backdrop` element |
| `--navbar-popup-z-index`          | 901           | z-index used for the `.navbar-popup` element          |
