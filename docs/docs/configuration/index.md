---
id: index
title: Configuration
# TODO JLAQ this title is not the best
---

| Name           | Type                           | Default    | Description                                                                                             |
| -------------- | ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------- |
| `routes`       | [Routes](./routes)             | `Required` | Defines the array of routes to be shown in the navbar                                                   |
| `desktop`      | [Desktop](./desktop)           | -          | Options specific to desktop mode                                                                        |
| `mobile`       | [Mobile](./mobile)             | -          | Options specific to mobile mode                                                                         |
| `template`     | [Template](./template)         | -          | Template name                                                                                           |
| `layout`       | [Layout](./layout)             | -          | Layout configuration options                                                                            |
| `styles`       | [Styles](./styles)             | -          | Custom CSS styles for the card                                                                          |
| `haptic`       | [Haptic](./haptic)             | -          | Fine tune when the haptic events should be fired in the card                                            |
| `media_player` | [Media player](./media-player) | -          | `[BETA]` Automatically display a media_player card on top of navbar-card. Only enabled for mobile mode. |

---

### Styles

Custom CSS styles can be applied to the Navbar Card to personalize its appearance and adapt it to your dashboard's design. Simply provide a CSS string targeting the relevant classes to style the navbar to your liking.

You can check out some examples [here](#examples-with-custom-styles) for inspiration.

#### Targetable Classes

Here is a breakdown of the CSS classes available for customization:

- `.navbar`: Main wrapper of navbar-card and its widgets.
  - `.navbar.desktop`: Styling for the desktop version.
  - `.navbar.desktop.[top | bottom | left | right]`: Specific styles for different positions of the navbar.
  - `.navbar.mobile`: Styling for the mobile version.
  - `.navbar.mobile.floating`: Styling for the mobile version when using `floating` mode.

- `.navbar-card`: The navbar-card itself (`ha-card` component).
  - `.navbar-card.desktop`: Styling for the desktop version.
  - `.navbar-card.desktop.[top | bottom | left | right]`: Specific styles for different positions of the navbar.
  - `.navbar-card.mobile`: Styling for the mobile version.
  - `.navbar-card.mobile.floating`: Styling for the mobile version when using `floating` mode.

- `.route`: Represents each route (or item) within the navbar.

- `.button`: Background element for each icon.
  - `.button.active`: Applies when a route is selected.

- `.icon`: Refers to the ha-icon component used for displaying icons.
  - `.icon.active`: Applies when a route is selected.

- `.image`: Refers to the img component used for displaying route images.
  - `.image.active`: Applies when a route is selected.

- `.label`: Text label displayed under the icons (if labels are enabled).
  - `.label.active`: Applies when a route is selected.

- `.badge`: Small indicator or badge that appears over the icon (if configured).
  - `.badge.active`: Applies when a route is selected.

- `.navbar-popup`: Main container for the popup.

- `.navbar-popup-backdrop`: Backdrop styles for the popup.

- `.popup-item`: Styles applied to the container of each popup-item. This object contains both the "button" with the icon, and the label.
  - `.popup-item.label-[top | bottom | left | right]`: Specific styles for different positions of the label.
  - `.popup-item .label`: Styles applied to the label of each popup item.
  - `.popup-item .button`: Button for each popup item, containing just the icon.

- `.media-player`: Styles applied to the media-player card
- `.media-player-bg`: Background of the media-player. This contains the image of the current media playing, blurred and with very low opacity
- `.media-player-image`: Image container of the current song
- `.media-player-info`: Container for the title and artist
- `.media-player-title`: Container for the title
- `.media-player-artist`: Container for the artist
- `.media-player-button`: Class applied to all buttons in the media_player card
- `.media-player-button-play-pause`: Play pause button
- `.media-player-progress-bar`: Container for the progress bar of the current playing media
- `.media-player-progress-bar-fill`: Filled section of the progress bar

#### CSS variables

The `.navbar` component relies on a set of CSS variables to manage its styling. You can customize its appearance by overriding the following variables:

| Name                                  | Default value                        | Uses                                                              |
| ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `--navbar-primary-color`              | var(--primary-color)                 | Accent color used for navbar-card                                 |
| `--navbar-border-radius`              | var(--ha-card-border-radius, 12px)   | Border radius applied to all `ha-card` elements inside `.navbar`  |
| `--navbar-background-color`           | var(--card-background-color)         | Background color used for all `ha-card` elements inside `.navbar` |
| `--navbar-route-icon-size`            | 24px                                 | Size in pixels for each `.icon` element                           |
| `--navbar-route-image-size`           | 32px                                 | Size in pixels for each `.image` element                          |
| `--navbar-box-shadow`                 | 0px -1px 4px 0px rgba(0, 0, 0, 0.14) | Box shadow used in mobile docked layout                           |
| `--navbar-box-shadow-mobile-floating` | var(--material-shadow-elevation-2dp) | Box shadow used in mobile floating mode                           |
| `--navbar-box-shadow-desktop`         | var(--material-shadow-elevation-2dp) | Box shadow used in desktop mode                                   |
| `--navbar-z-index`                    | 3                                    | Default z-index for navbar-card                                   |
| `--navbar-popup-backdrop-z-index`     | 900                                  | z-index used for the `.navbar-popup-backdrop` element             |
| `--navbar-popup-z-index`              | 901                                  | z-index used for the `.navbar-popup` element                      |
