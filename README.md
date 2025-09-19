# Navbar Card

[![Buy me a beer](https://img.shields.io/badge/Support-Buy%20me%20a%20beer-fdd734?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/joseluis9595)
[![Last commit](https://img.shields.io/github/last-commit/joseluis9595/lovelace-navbar-card)](#)
![Downloads](https://img.shields.io/github/downloads/joseluis9595/lovelace-navbar-card/total)
[![Version](https://img.shields.io/github/v/release/joseluis9595/lovelace-navbar-card)](#)
[![HA Community forum](https://img.shields.io/badge/Home%20Assistant-Community%20Forum-319fee?logo=home-assistant)](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917)

<img width="1282" height="478" alt="navbar-card-github" src="https://github.com/user-attachments/assets/11c383ad-bdc1-4254-b6b0-c88a5341ecc0" />

<br>
<br>

Navbar Card is a custom Lovelace card designed to **simplify navigation** within your Home Assistant dashboard, heavily inspired by the great work of [**Adaptive Mushroom**](https://community.home-assistant.io/t/adaptive-mushroom/640308) and [**Google's Material Design**](https://m3.material.io/). It provides a sleek, responsive navigation bar that displays as a full-width bar at the bottom on mobile devices. On desktop, it adapts into a flexible container that can be positioned on any side of the screen (top, bottom, left, or right) adjusting its orientation to fit seamlessly.

<br>

[**Installation**](#-installation) • [**Quickstart**](#-quickstart) • [**Configuration**](#%EF%B8%8F-configuration) • [**Dashboard adjustements**](#%EF%B8%8F-dashboard-adjustements) • [**Example configurations**](#-example-configurations) • [**Help**](#-help) • [**Donate**](#-donate)

<br>

---

<br>

## 🚀 Installation

<details open>
  <summary>Open in HACS (recommended)</summary>

<br>

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=joseluis9595&repository=lovelace-navbar-card&category=plugin)

</details>

<details>
  <summary>HACS manual configuration</summary>

<br>

1. Go to HACS in Home Assistant.
2. On the top right, click "Custom repositories".
3. Enter the repository URL: https://github.com/joseluis9595/lovelace-navbar-card.git
4. Search for "Navbar Card".
5. Click Install!

</details>

<details>
  <summary>Manual installation without HACS</summary>

<br>

1. Download [navbar-card.js](https://github.com/joseluis9595/lovelace-navbar-card/releases/latest/download/navbar-card.js) from the latest release.
2. Move this file to home assistant's `<config>/www` folder.
3. In home assistant, go to `Settings > Dashboards`.
4. On the top right corner, click `Resources`.
5. Add a new resource with the following:
   - **URL**: `/local/navbar-card.js`
   - **Resource type**: JavaScript module
6. Go to your dashboard, refresh your page and add your new navbar-card!

</details>

<br>

---

<br>

## ⚡ Quickstart

1. **Edit your Home Assistant dashboard**: Go to your dashboard in Home Assistant and enter edit mode.
2. **Add the Navbar Card**: Click to add a new card, search for "navbar-card", and add it anywhere in your dashboard layout (doesn't matter where, navbar-card will automatically float to the bottom on mobile devices, and to the position you have configured for desktop devices).
3. **Configure your routes**: In the card configuration, define a few routes to the views you want quick access to. For example:

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/lights
    icon: mdi:lightbulb-outline
    label: Lights
  - url: /lovelace/devices
    icon: mdi:devices
    label: Devices
```

4. **Save and enjoy**: Save your dashboard. The navbar will now appear and let you quickly switch between your configured views!

<br>

---

<br>

## ⚙️ Configuration

<img width="400" height="120" alt="navbar-card" src="https://github.com/user-attachments/assets/346a6466-1a79-400e-9fe4-4f8472b3bee5" />

| Name           | Type                          | Default    | Description                                                                                             |
| -------------- | ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| `routes`       | [Routes](#routes)             | `Required` | Defines the array of routes to be shown in the navbar                                                   |
| `desktop`      | [Desktop](#desktop)           | -          | Options specific to desktop mode                                                                        |
| `mobile`       | [Mobile](#mobile)             | -          | Options specific to mobile mode                                                                         |
| `template`     | [Template](#template)         | -          | Template name                                                                                           |
| `layout`       | [Layout](#layout)             | -          | Layout configuration options                                                                            |
| `styles`       | [Styles](#styles)             | -          | Custom CSS styles for the card                                                                          |
| `haptic`       | [Haptic](#haptic)             | -          | Fine tune when the haptic events should be fired in the card                                            |
| `media_player` | [Media player](#media-player) | -          | `[BETA]` Automatically display a media_player card on top of navbar-card. Only enabled for mobile mode. |

### Routes

Routes represents an array of clickable icons that redirects to a given path. Each item in the array should contain the following configuration:

| Name                | Type                                                    | Default     | Description                                                                                                                                                |
| ------------------- | ------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`               | string                                                  | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                                                                                           |
| `icon`              | string \| [JSTemplate](#jstemplate)                     | -           | Material icon to display as this entry icon. Either `icon` or `image` is required.                                                                         |
| `icon_selected`     | string \| [JSTemplate](#jstemplate)                     | -           | Icon to be displayed when `url` matches the current browser URL                                                                                            |
| `image`             | string \| [JSTemplate](#jstemplate)                     | -           | URL of an image to display as this entry icon. Either `icon` or `image` is required.                                                                       |
| `image_selected`    | string \| [JSTemplate](#jstemplate)                     | -           | Image to be displayed when `url` matches the current browser URL                                                                                           |
| `badge`             | [Badge](#badge)                                         | -           | Badge configuration                                                                                                                                        |
| `label`             | string \| [JSTemplate](#jstemplate)                     | -           | Label to be displayed under the given route if `show_labels` is true                                                                                       |
| `tap_action`        | [CustomAction](#custom-actions)                         | -           | Custom tap action configuration.                                                                                                                           |
| `hold_action`       | [CustomAction](#custom-actions)                         | -           | Custom hold action configuration.                                                                                                                          |
| `double_tap_action` | [CustomAction](#custom-actions)                         | -           | Custom double_tap action configuration.                                                                                                                    |
| `popup`             | [Popup items](#popup-items)\| [JSTemplate](#jstemplate) | -           | List of routes to display in a popup menu                                                                                                                  |
| `hidden`            | boolean \| [JSTemplate](#jstemplate)                    | -           | Controls whether to render this route or not                                                                                                               |
| `selected`          | boolean \| [JSTemplate](#jstemplate)                    | -           | Controls whether to display this route as selected or not. If not defined, the selected status will be computed as `route.url == window.location.pathname` |

> **Note**: `url` is required unless `tap_action`, `hold_action`, `double_tap_action` or `popup` is present.

> **Note**: If `tap_action` is defined, `url` is ignored.

<br>

> **Tip**: Some suggestions when using the `image` property:
>
> 1. Place your custom images in the `<ha-config-folder>/www` directory
> 2. Use images with a transparent background for best results
> 3. Keep image dimensions squared for best results

#### Custom actions

Apart from the [standard Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) (navigate, call-service, etc.), `navbar-card` supports some additional custom actions:

| Action               | Description                                                | Required Parameters                           |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `open-popup`         | Opens the popup menu defined in the route                  | -                                             |
| `toggle-menu`        | Opens the native HA side menu                              | -                                             |
| `show-notifications` | Opens the native HA notifications drawer                   | -                                             |
| `quickbar`           | Opens the native HA quickbar                               | `mode`: `entities` \| `commands` \| `devices` |
| `navigate-back`      | Navigates back to the previous page in the browser history | -                                             |
| `open-edit-mode`     | Opens the current dashboard in edit mode                   | -                                             |
| `logout`             | Logs out the current user from Home Assistant              | -                                             |
| `custom-js-action`   | Allows the user to execute custom Javascript code          | `code`: JS code                               |

Example:

```yaml
type: custom:navbar-card
...
routes:
  ...
  - url: /lovelace/lights
    icon: mdi:lightbulb-outline
    tap_action:
      action: open-popup # Will open the popup menu defined for this route
    double_tap_action:
      action: quickbar # Will open the native HA quickbar
      mode: entities
    hold_action:
      action: toggle-menu # Will open the native HA side menu
  - icon: mdi:menu
    tap_action:
      action: custom-js-action
      code: |
        [[[
          const newURL = window.location.href + "#bubble-popup";
          history.replaceState(null, "", newURL);
          window.dispatchEvent(new Event('location-changed'));
        ]]]
  - icon: mdi:pencil
    tap_action:
      action: open-edit-mode
```

#### Badge

Configuration to display a small badge on any of the navbar items.

<img width="400" height="120" alt="navbar-card_badges" src="https://github.com/user-attachments/assets/44824ecd-9088-44c3-bab1-d900edeea614" />

| Name        | Type                                 | Default | Description                                                     |
| ----------- | ------------------------------------ | ------- | --------------------------------------------------------------- |
| `show`      | boolean \| [JSTemplate](#jstemplate) | false   | Boolean template indicating whether to display the badge or not |
| `color`     | string \| [JSTemplate](#jstemplate)  | red     | Background color of the badge                                   |
| `count`     | string \| [JSTemplate](#jstemplate)  | -       | Text to be displayed inside the badge                           |
| `textColor` | string \| [JSTemplate](#jstemplate)  | -       | Color for the text displayed inside the badge                   |

#### Popup Items

For each route, a popup menu can be configured, to display a popup when clicked. This is activated using the `open-popup` action in either `tap_action` or `hold_action`.

<img width="431" height="218" alt="navbar-card_popup" src="https://github.com/user-attachments/assets/520d85c7-9d73-4e73-b3c3-a4a6b2635dcb" />

| Name             | Type                                 | Default     | Description                                                                                                                                              |
| ---------------- | ------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | string                               | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                                                                                         |
| `icon`           | string \| [JSTemplate](#jstemplate)  | -           | Material icon to display as this entry icon.                                                                                                             |
| `icon_selected`  | string \| [JSTemplate](#jstemplate)  | -           | Icon to be displayed when `url` matches the current browser URL                                                                                          |
| `image`          | string \| [JSTemplate](#jstemplate)  | -           | URL of an image to display as this entry icon.                                                                                                           |
| `image_selected` | string \| [JSTemplate](#jstemplate)  | -           | Image to be displayed when `url` matches the current browser URL                                                                                         |
| `badge`          | [Badge](#badge)                      | -           | Badge configuration                                                                                                                                      |
| `label`          | string \| [JSTemplate](#jstemplate)  | -           | Label to be displayed under the given route if `show_labels` is true                                                                                     |
| `tap_action`     | [tap_action](#actions)               | -           | Custom tap action configuration, including 'open-popup' to display a popup menu.                                                                         |
| `hold_action`    | [hold_action](#actions)              | -           | Custom hold action configuration, including 'open-popup' to display a popup menu.                                                                        |
| `selected`       | boolean \| [JSTemplate](#jstemplate) | -           | Controls whether to display this item as selected or not. If not defined, the selected status will be computed as `item.url == window.location.pathname` |

> **Note**: `url` is required unless `tap_action` is present. If `tap_action` is defined, `url` is ignored.

In addition to the default annotation, we also support using JSTemplate to define popup items.
For example, you can dynamically define items based on the areas in your Home Assistant environment:

```yaml
- icon: mdi:sofa-outline
  icon_selected: mdi:sofa
  label: Rooms
  tap_action: { action: open-popup }
  popup: |
    [[[
      return Object.values(hass.areas).map(area => ({
        label: area.name,
        url: "/d-bubble/home#" + area.area_id,
        icon: area.icon
      }));
    ]]]
```

#### JSTemplate

You can easily customize some properties of the navbar-card by writing your own JavaScript rules. To do this, you simply wrap the value of the field that supports JSTemplates in `[[[` and `]]]`, then write the JavaScript code that determines the property's value.

> **Note**: `[[[` and `]]]` are only needed in the YAML editor. For the visual editor, simply write plain javascript in the code block without the template wrappers.

Apart from using plain javascript, you can access some predefined variables:

- `states` -> Contains the global state of all entities in HomeAssistant. To get the state of a specific entity, use: `states['entity_type.your_entity'].state`.
- `user` -> Information about the current logged user.
- `navbar` -> Internal state of the navbar-card. Accessible fields are:
  - `isDesktop` -> Boolean indicating whether the card is in its desktop variant or not.

Below is an example using JSTemplates for displaying a route only for one user, and a label indicating the number of lights currently on:

```yaml
type: custom:navbar-card
desktop:
  position: bottom
  show_labels: true
routes:
  - url: /lovelace/lights
    label: |
      [[[ 
        const lightsOn = Object.entries(states)
          .filter(([entityId, value]) => {
            return entityId.startsWith('light.') && value.state == 'on';
          })
          .length;
        return `Lights (${lightsOn})` 
      ]]]
    icon: mdi:lightbulb-outline
    icon_selected: mdi:lightbulb
    hidden: |
      [[[ return navbar.isDesktop; ]]]
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
    hidden: |
      [[[ return user.name != "jose"; ]]]
```

> **Tip**: You can use `console.log` in your JSTemplate to help debug your HomeAssistant states.

---

### Desktop

Specific configuration for desktop mode.

<img width="400" height="120" alt="navbar-card_desktop" src="https://github.com/user-attachments/assets/3f110a2d-3078-41ff-b357-459c69785fe8" />

| Name                           | Type                                     | Default  | Description                                                                |
| ------------------------------ | ---------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `show_labels`                  | boolean \| `popup_only` \| `routes_only` | `false`  | Whether or not to display labels under each route                          |
| `show_popup_label_backgrounds` | boolean                                  | `false`  | Whether or not to display label backgrounds for popup items                |
| `min_width`                    | number                                   | `768`    | Screen size from which the navbar will be displayed as its desktop variant |
| `position`                     | `top` \| `bottom` \| `left` \| `right`   | `bottom` | Position of the navbar on desktop devices                                  |
| `hidden`                       | boolean \| [JSTemplate](#jstemplate)     | `false`  | Set to true to hide the navbar on desktop devices                          |

<img width="200" alt="Popup labels turned off for desktop" src="https://github.com/user-attachments/assets/33516186-be1e-48de-9f25-808851f302b6" />
<img width="200" alt="Popup labels turned on for desktop" src="https://github.com/user-attachments/assets/d8453509-9c67-4e5d-949f-2848630346d6" />

---

### Mobile

Specific configuration for mobile mode.

<img width="785" height="108" alt="navbar-card_mobile" src="https://github.com/user-attachments/assets/b8134d65-d237-412a-9c0b-dfc9c009de46" />

| Name                           | Type                                     | Default  | Description                                                                                                             |
| ------------------------------ | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `show_labels`                  | boolean \| `popup_only` \| `routes_only` | `false`  | Whether or not to display labels under each route                                                                       |
| `show_popup_label_backgrounds` | boolean                                  | `false`  | Whether or not to display label backgrounds for popup items                                                             |
| `hidden`                       | boolean \| [JSTemplate](#jstemplate)     | `false`  | Set to true to hide the navbar on mobile devices                                                                        |
| `mode`                         | `docked` \| `floating`                   | `docked` | Choose visualization mode on mobile devices. `docked` for default experience, `floating` for desktop-like visualization |

<img width="200" alt="Popup labels turned off for mobile" src="https://github.com/user-attachments/assets/0547373e-283c-4233-b8d7-fd0928f0af4b" />
<img width="200" alt="Popup labels turned on for mobile" src="https://github.com/user-attachments/assets/aaa6c424-1f44-46a5-9a20-2eb08d5d8eb4" />

---

### Haptic

Controls when haptic feedback is triggered. You can either use a boolean to enable/disable all haptic feedback, or specify which actions should trigger haptic feedback:

| Option              | Type    | Default | Description                           |
| ------------------- | ------- | ------- | ------------------------------------- |
| `url`               | boolean | `false` | Trigger when navigating to a new page |
| `tap_action`        | boolean | `false` | Trigger on tap actions                |
| `hold_action`       | boolean | `false` | Trigger on hold actions               |
| `double_tap_action` | boolean | `false` | Trigger on double tap actions         |

---

### Media player

> [!IMPORTANT]
> This feature is still in **BETA**. Some features might not work as expected

When enabled, this configuration displays a `media_player` widget above the `navbar-card`. Currently, it is shown only in mobile mode and only when the `media_player` state is `paused` or `playing`.

<img width="445" height="166" alt="navbar-card_media-player" src="https://github.com/user-attachments/assets/b8898268-e232-4759-b35c-23a1afd43e7a" />

| Option                   | Type                                                           | Default                                                  | Description                                                                                    |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `entity`                 | string \| [JSTemplate](#jstemplate)                            | -                                                        | Entity ID of the media_player                                                                  |
| `show`                   | boolean \| [JSTemplate](#jstemplate)                           | `true` when media_player is either `playing` or `paused` | Manually configure when the media player widget should be displayed                            |
| `album_cover_background` | boolean                                                        | `false`                                                  | Enable this option to display the album cover as blurred background of the media player widget |
| `tap_action`             | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant tap action configuration.                                                       |
| `hold_action`            | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant hold action configuration.                                                      |
| `double_tap_action`      | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant double_tap action configuration.                                                |

Example:

```yaml
type: custom:navbar-card
  ...
media_player:
  show: true
  album_cover_background: true
  entity: |
    [[[
      const state = states['sensor.area_select'].state;
      let entity;

      switch (state) {
        case 'Office':
          entity = 'media_player.office';
          break;
        case 'Kitchen':
          entity = 'media_player.kitchen';
          break;
        case 'Main bedroom':
          entity = 'media_player.main_bedroom';
          break;
        case 'Living room':
          entity = 'media_player.living_room';
          break;
        default:
          // fallback if not in a room with a defined player
          entity = 'media_player.whole_home';
      }

      return entity;
    ]]]
```

---

### Template

Templates allow you to predefine a custom configuration for `navbar-card` and reuse it across multiple dashboards. This approach saves time and simplifies maintenance — any change to the template will automatically apply to all cards using it.

#### Defining Templates

To define custom templates, add them under `navbar-templates` in your main Lovelace YAML configuration like this:

```yaml
navbar-templates:
   your_template_name:
      # Your navbar config
      routes:
         - label: Home
           icon: mdi:home
           url: /lovelace/home
         ...
# Your normal lovelace configuration
views:
...
```

#### Referencing Templates

You can reference a template from your `navbar-card` using the template property:

```yaml
type: custom:navbar-card
template: your_template_name
```

#### Overriding props

Card properties defined directly in the card will take priority over those inherited from the template.

For example, if you want to use a template called `your_template_name` but have one specific dashboard with a different primary color, your configurations might look like this:

- Default Navbar for Most Views:

```yaml
type: custom:navbar-card
template: your_template_name
```

- Customized Navbar for a Specific View:

```yaml
type: custom:navbar-card
template: your_template_name
styles: |
  .navbar {
    --navbar-primary-color: red;
  }
```

---

### Layout

Configuration options for the navbar layout and behavior.

| Name                  | Type                          | Default | Description                                                                                           |
| --------------------- | ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `auto_padding`        | [Auto Padding](#auto-padding) | -       | Add padding to your Home Asistant dashboard to prevent overlaps                                       |
| `reflect_child_state` | `boolean`                     | -       | Determines if each route item should be displayed as selected when any of its popup items is selected |

#### Auto Padding

Automatically adds padding to your Home Assistnat dashboard to prevent cards from overlapping with `navbar-card`. This eliminates the need for manual CSS padding adjustments in your Home Assistant theme.

| Name         | Type    | Default | Description                                                                  |
| ------------ | ------- | ------- | ---------------------------------------------------------------------------- |
| `enabled`    | boolean | `true`  | Whether to automatically add padding to prevent overlaps                     |
| `desktop_px` | number  | `100`   | Padding in pixels for desktop mode (applied to left/right based on position) |
| `mobile_px`  | number  | `80`    | Padding in pixels for mobile mode (applied to bottom)                        |

> **Note**: The `desktop_px` padding is automatically applied to the appropriate side based on your navbar's `desktop.position` setting.

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

<br>

---

<br>

## 🛠️ Dashboard adjustements

### Padding

If you're using the Navbar Card, you might notice it could collide with other cards on your dashboard. The navbar-card now includes an [**automatic padding feature**](#auto-padding) that handles this for you, eliminating the need for manual CSS adjustments.

#### Automatic Padding (Recommended)

The navbar-card automatically adds appropriate padding to prevent overlaps:

- **Desktop**: Adds padding to the left or right side based on your navbar position
- **Mobile**: Adds bottom padding to prevent cards from overlapping the bottom navbar

This feature is enabled by default, but you can customize it using the `layout.auto_padding` configuration. [More info here](#auto-padding)

#### Manual Adjustement (Legacy)

<details>
<summary>If you prefer to handle padding manually or need more control, you can disable automatic padding and use CSS instead:</summary>

```yaml
type: custom:navbar-card
layout:
  auto_padding:
    enabled: false # Disable automatic padding
```

Then use [card-mod](https://github.com/thomasloven/lovelace-card-mod) with a [custom theme](https://www.home-assistant.io/integrations/frontend/#themes) to add manual padding:

```yaml
your_theme:
  card-mod-theme: your_theme
  card-mod-root-yaml: |
    .: |
      /* Add padding to the left (or other sides, depending on your navbar position) for desktop screens */
      @media (min-width: 768px) {
        :not(.edit-mode) > #view {
          padding-left: 100px !important;
        }
      }

      /* Add bottom padding for mobile screens to prevent cards from overlapping with the navbar */
      @media (max-width: 767px) {
        :not(.edit-mode) > hui-view:after {
          content: "";
          display: block;
          height: 80px;
          width: 100%;
          background-color: transparent; 
        }
      }
```

</details>

---

### Hiding native tabs

Another useful styling detail, is removing the native ha-tabs element on the top of the screen. We want to hide the ha-tabs element, but keep the edit, search and assist buttons visible.
To do so, once again, using card-mod and custom themes is quite easy:

#### For Home Assistant < 2025.0

```yaml
your_theme:
  app-header-background-color: transparent
  app-header-text-color: var(--primary-text-color)

  card-mod-theme: your_theme
  card-mod-root-yaml: |
    .: |
      ha-tabs {
        pointer-events: none;
        opacity: 0;
      }
```

#### For Home Assistant ≥ 2025.0

```yaml
your_theme:
  app-header-background-color: transparent
  app-header-text-color: var(--primary-text-color)

  card-mod-theme: your_theme
  card-mod-root-yaml: |
    .: |
      .toolbar > sl-tab-group {
        pointer-events: none;
        opacity: 0;
      }
```

<br>

---

<br>

## 📚 Example Configurations

<details open>
<summary open>Basic example</summary>

```yaml
type: custom:navbar-card
layout:
  auto_padding:
    enabled: true
    desktop_px: 100
    mobile_px: 80
desktop:
  position: left
  min_width: 768
  show_labels: true
mobile:
  show_labels: false
routes:
  - icon: mdi:home-outline
    icon_selected: mdi:home-assistant
    url: /lovelace/home
    label: Home
  - icon: mdi:devices
    url: /lovelace/devices
    label: Devices
    hold_action:
      action: navigate
      navigation_path: /config/devices/dashboard
  - icon: mdi:thermometer
    url: /lovelace/weather
    label: Weather
  - icon: mdi:creation-outline
    icon_selected: mdi:creation
    url: /lovelace/control
    label: Control
  - icon: mdi:dots-horizontal
    label: More
    tap_action:
      action: open-popup
    popup:
      - icon: mdi:cog
        url: /config/dashboard
      - icon: mdi:hammer
        url: /developer-tools/yaml
      - icon: mdi:power
        tap_action:
          action: call-service
          service: homeassistant.restart
          service_data: {}
          confirmation:
            text: Are you sure you want to restart Home Assistant?
    badge:
      show: >
        [[[ return states['binary_sensor.docker_hub_update_available'].state === 'on' ]]]
      color: var(--primary-color)
```

</details>

#### Examples with custom styles

<details>
<summary>Custom primary color</summary>

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
styles: |
  .navbar {
    --navbar-primary-color: red;
  }
```

![custom_primary_colors](https://github.com/user-attachments/assets/e2656904-4def-4b48-9e13-0a6f582bf12f)

</details>

<details>
<summary>Custom background color</summary>

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
styles: |
  .navbar-card {
    background: #000000;
  }
```

![custom_background](https://github.com/user-attachments/assets/106ef845-b67d-4244-9f32-a0591934bce5)

</details>

<details>
<summary>No rounded corners only in desktop mode</summary>

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
styles: |
  .navbar-card.desktop {
    border-radius: 0px;
  }
```

![border_radius](https://github.com/user-attachments/assets/ca6d0a48-5625-4f0a-9418-72cae54b9fe5)

</details>

<details>
<summary>More spacing on desktop mode and "bottom" position</summary>

```yaml
type: custom:navbar-card
desktop:
  position: bottom
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
styles: |
  .navbar.desktop.bottom {
    bottom: 100px;
  }
```

![bottom_padding](https://github.com/user-attachments/assets/b08cab6b-c978-48af-8fb3-57d2d0599925)

</details>

<details>
<summary>Custom auto-padding configuration</summary>

```yaml
type: custom:navbar-card
layout:
  auto_padding:
    enabled: true
    desktop_px: 150 # Extra wide padding for desktop
    mobile_px: 120 # Extra tall padding for mobile
desktop:
  position: right # Padding will be applied to the right
  show_labels: true
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
```

</details>

<details>
<summary>Display route only for a given user</summary>

```yaml
type: custom:navbar-card
desktop:
  position: bottom
routes:
  - url: /lovelace/home
    label: Home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
  - url: /lovelace/settings
    label: Settings
    icon: mdi:cog
    # This route will only be displayed for user "jose"
    hidden: |
      [[[ return user.name != "jose"]]]
```

</details>

<details>
<summary>Force one route to always be selected</summary>

```yaml
type: custom:navbar-card
desktop:
  position: bottom
routes:
  - url: /lovelace/home
    label: Home
    selected: true # force `selected` field to true
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
  - url: /lovelace/settings
    label: Settings
    icon: mdi:cog
```

</details>

<details>
<summary>Route with rounded user's image</summary>

```yaml
type: custom:navbar-card
routes:
  - image: |
      [[[ 
        return hass.states["person.jose"].attributes.entity_picture
      ]]]
    label: More
    tap_action:
      action: open-popup
    popup:
      - icon: mdi:cog
        url: /config/dashboard
      - icon: mdi:hammer
        url: /developer-tools/yaml
      - icon: mdi:power
        tap_action:
          action: call-service
          service: homeassistant.restart
          service_data: {}
          confirmation:
            text: Are you sure you want to restart Home Assistant?
styles: |
  .image {
    border-radius: 16px !important;
  }
```

</details>

<br>

---

<br>

## 💬 Help

Need help using `navbar-card`, have ideas, or found a bug? Here's how you can reach out:

- **🐛 Found a bug or have a feature request?**<br>
  [Open an issue on GitHub](https://github.com/joseluis9595/lovelace-navbar-card/issues) so we can track and fix it.

- **💬 Have questions, want to share feedback, or just chat?**<br>
  Either start [a discussion on GitHub](https://github.com/joseluis9595/lovelace-navbar-card/discussions) or join the conversation on the [Home Assistant Community Forum
  ](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917).

Your feedback helps make navbar-card better for everyone. Don’t hesitate to reach out!

<br>

---

<br>

## 🍻 Donate

If you enjoy using `navbar-card` and want to support its continued development, consider buying me a coffee (or a beer 🍺), or becoming a GitHub Sponsor!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_a_Beer-fdd734?&logo=buy-me-a-coffee&logoColor=black&style=for-the-badge)](https://www.buymeacoffee.com/joseluis9595) [![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-30363d?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/joseluis9595)

Your support means a lot and helps keep the project alive and growing. Thank you! 🙌
