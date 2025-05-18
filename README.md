[![Version](https://img.shields.io/github/v/release/joseluis9595/lovelace-navbar-card)](#)
[![Last commit](https://img.shields.io/github/last-commit/joseluis9595/lovelace-navbar-card)](#)
![Downloads](https://img.shields.io/github/downloads/joseluis9595/lovelace-navbar-card/total)
[![HA Community forum](https://img.shields.io/badge/Home%20Assistant-Community%20Forum-319fee?logo=home-assistant)](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917)

# Navbar Card

![navbar-card](https://github.com/user-attachments/assets/df2a9a5d-51ec-4786-8f54-36ece2aa6f9a)

Navbar Card is a custom Lovelace card designed to simplify navigation within your Home Assistant dashboard, heavily inspired by the great work of [Adaptive Mushroom](https://community.home-assistant.io/t/adaptive-mushroom/640308). It provides a sleek, responsive navigation bar that displays as a full-width bar at the bottom on mobile devices. On desktop, it adapts into a flexible container that can be positioned on any side of the screen (top, bottom, left, or right) adjusting its orientation to fit seamlessly.

<br>

---

<br>

## 🚀 Installation

### Open in HACS (recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=joseluis9595&repository=lovelace-navbar-card&category=plugin)

### HACS manual configuration

1. Go to HACS in Home Assistant.
2. On the top right, click "Custom repositories".
3. Enter the repository URL: https://github.com/joseluis9595/lovelace-navbar-card.git
4. Search for "Navbar Card".
5. Click Install!

### Manual

1. Download [navbar-card.js](https://github.com/joseluis9595/lovelace-navbar-card/releases/latest/download/navbar-card.js) from the latest release.
2. Move this file to home assistant's `<config>/www` folder.
3. In home assistant, go to `Settings > Dashboards`.
4. On the top right corner, click `Resources`.
5. Add a new resource with the following:
   - **URL**: `/local/navbar-card.js`
   - **Resource type**: JavaScript module
6. Go to your dashboard, refresh your page and add your new navbar-card!

<br>

---

<br>

## ⚙️ Configuration

| Name       | Type                  | Default    | Description                                           |
| ---------- | --------------------- | ---------- | ----------------------------------------------------- |
| `routes`   | [Routes](#routes)     | `Required` | Defines the array of routes to be shown in the navbar |
| `desktop`  | [Desktop](#desktop)   | -          | Options specific to desktop mode                      |
| `mobile`   | [Mobile](#mobile)     | -          | Options specific to mobile mode                       |
| `template` | [Template](#template) | -          | Template name                                         |
| `styles`   | [Styles](#styles)     | -          | Custom CSS styles for the card                        |

### Routes

Routes represents an array of clickable icons that redirects to a given path. Each item in the array should contain the following configuration:

| Name             | Type                                 | Default     | Description                                                                                                                                                |
| ---------------- | ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | string                               | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                                                                                           |
| `icon`           | string                               | -           | Material icon to display as this entry icon. Either `icon` or `image` is required.                                                                         |
| `icon_selected`  | string                               | -           | Icon to be displayed when `url` matches the current browser URL                                                                                            |
| `image`          | string                               | -           | URL of an image to display as this entry icon. Either `icon` or `image` is required.                                                                       |
| `image_selected` | string                               | -           | Image to be displayed when `url` matches the current browser URL                                                                                           |
| `badge`          | [Badge](#badge)                      | -           | Badge configuration                                                                                                                                        |
| `label`          | string \| [JSTemplate](#jstemplate)  | -           | Label to be displayed under the given route if `show_labels` is true                                                                                       |
| `tap_action`     | [tap_action](#actions)               | -           | Custom tap action configuration, including 'open-popup' to display a popup menu.                                                                           |
| `hold_action`    | [hold_action](#actions)              | -           | Custom hold action configuration, including 'open-popup' to display a popup menu.                                                                          |
| `popup`          | [Popup items](#popup-items)          | -           | List of routes to display in a popup menu                                                                                                                  |
| `hidden`         | boolean \| [JSTemplate](#jstemplate) | -           | Controls whether to render this route or not                                                                                                               |
| `selected`       | boolean \| [JSTemplate](#jstemplate) | -           | Controls whether to display this route as selected or not. If not defined, the selected status will be computed as `route.url == window.location.pathname` |

> **Note**: `url` is required unless `tap_action` or `popup` is present. If `tap_action` is defined, `url` is ignored.

> **Note**: Some suggestions when using the `image` property:
>
> 1. Place your custom images in the `<ha-config-folder>/www` directory
> 2. Use images with a transparent background for best results
> 3. Keep image dimensions squared for best results

#### Actions

Apart from the [standard Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) (navigate, call-service, etc.), `navbar-card` supports a custom action to open popup menus:

| Action       | Description                               | Required Parameters |
| ------------ | ----------------------------------------- | ------------------- |
| `open-popup` | Opens the popup menu defined in the route | None                |

Example:

```yaml
tap_action:
  action: open-popup # Will open the popup menu defined for this route
```

Or:

```yaml
hold_action:
  action: open-popup # Will open the popup menu when the route is held
```

### Example with Open-Popup Action

```yaml
type: custom:navbar-card
desktop:
  position: bottom
  show_labels: true
mobile:
  show_labels: true
routes:
  - url: /lovelace/home
    icon: mdi:home
    icon_selected: mdi:home-variant
    label: Home
  - icon: mdi:cog
    label: Settings
    # Open settings page on tap
    url: /config/dashboard
    # But show a popup menu on hold
    hold_action:
      action: open-popup
    popup:
      - icon: mdi:account
        url: /config/person
        label: Users
      - icon: mdi:hammer
        url: /developer-tools/yaml
        label: Developer
      - icon: mdi:power
        url: /config/server_control
        label: Server
  - icon: mdi:dots-horizontal
    label: More
    # Open popup menu on tap
    tap_action:
      action: open-popup
    popup:
      - icon: mdi:cast
        url: /lovelace/media
        label: Media
      - icon: mdi:lightbulb
        url: /lovelace/lights
        label: Lights
```

#### Badge

Configuration to display a small badge on any of the navbar items.

![navbar-card-badge](https://github.com/user-attachments/assets/5f548ce3-82b5-422f-a084-715bc73846b0)

| Name    | Type                                 | Default | Description                                                     |
| ------- | ------------------------------------ | ------- | --------------------------------------------------------------- |
| `show`  | boolean \| [JSTemplate](#jstemplate) | false   | Boolean template indicating whether to display the badge or not |
| `color` | string                               | red     | Background color of the badge                                   |

#### Popup Items

For each route, a popup menu can be configured, to display a popup when clicked. This is activated using the `open-popup` action in either `tap_action` or `hold_action`.

| Name          | Type                                | Default     | Description                                                                       |
| ------------- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `url`         | string                              | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                  |
| `icon`        | string                              | `Required`  | Material icon to display as this entry icon                                       |
| `badge`       | [Badge](#badge)                     | -           | Badge configuration                                                               |
| `label`       | string \| [JSTemplate](#jstemplate) | -           | Label to be displayed under the given route if `show_labels` is true              |
| `tap_action`  | [tap_action](#actions)              | -           | Custom tap action configuration, including 'open-popup' to display a popup menu.  |
| `hold_action` | [hold_action](#actions)             | -           | Custom hold action configuration, including 'open-popup' to display a popup menu. |

> **Note**: `url` is required unless `tap_action` is present. If `tap_action` is defined, `url` is ignored.

#### JSTemplate

You can easily customize some properties of the navbar-card by writing your own JavaScript rules. To do this, you simply wrap the value of the field that supports JSTemplates in `[[[` and `]]]`, then write the JavaScript code that determines the property's value.

Apart from using plain javascript, you can access some predefined variables:

- `states` -> Contains the global state of all entities in HomeAssistant. To get the state of a specific entity, use: `states['entity_type.your_entity'].state`.
- `user` -> Information about the current logged user.

> **Tip**: You can use `console.log` in your JSTemplate to help debug your HomeAssistant states.

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
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
    hidden: |
      [[[ return user.name != "jose"; ]]]
```

---

### Desktop

Specific configuration for desktop mode.

| Name          | Type                                    | Default  | Description                                                                |
| ------------- | --------------------------------------  | -------- | -------------------------------------------------------------------------- |
| `show_labels` | boolean \| `popup_only` \| `routes_only`| `false`  | Whether or not to display labels under each route                          |
| `min_width`   | number                                  | `768`    | Screen size from which the navbar will be displayed as its desktop variant |
| `position`    | `top` \| `bottom` \| `left` \| `right`  | `bottom` | Position of the navbar on desktop devices                                  |
| `hidden`      | boolean \| [JSTemplate](#jstemplate)    | `false`  | Set to true to hide the navbar on desktop devices                          |

---

### Mobile

Specific configuration for mobile mode.

| Name          | Type                                    | Default | Description                                       |
| ------------- | ------------------------------------    | ------- | ------------------------------------------------- |
| `show_labels` | boolean \| `popup_only` \| `routes_only`| `false` | Whether or not to display labels under each route |
| `hidden`      | boolean \| [JSTemplate](#jstemplate)    | `false` | Set to true to hide the navbar on mobile devices  |

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

### Styles

Custom CSS styles can be applied to the Navbar Card to personalize its appearance and adapt it to your dashboard's design. Simply provide a CSS string targeting the relevant classes to style the navbar to your liking.

You can check out some examples [here](#examples-with-custom-styles) for inspiration.

#### Targetable Classes

Here is a breakdown of the CSS classes available for customization:

- `.navbar`: Base component for the navbar.
  - `.navbar.desktop`: Styling for the desktop version.
  - `.navbar.desktop.[top | bottom | left | right]`: Specific styles for different positions of the navbar.
  - `.navbar.mobile`: Styling for the mobile version.

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

- `.navbar-popup-backdrop`: Backdrop styles for the popup.

- `.popup-item`: Styles applied to the container of each popup-item. This object contains both the "button" with the icon, and the label.
  - `.popup-item.label-[top | bottom | left | right]`: Specific styles for different positions of the label.
  - `.popup-item .label`: Styles applied to the label of each popup item.
  - `.popup-item .button`: Button for each popup item, containing just the icon.

<br>

---

<br>

## 🛠️ Dashboard adjustements (Optional)

### Padding

If you're using the Navbar Card, you might notice it could collide with other cards on your dashboard. A simple way to fix this is by adding some padding to your Home Assistant views. The easiest way to do that is by using [card-mod](https://github.com/thomasloven/lovelace-card-mod) with a [custom theme](https://www.home-assistant.io/integrations/frontend/#themes).

Here's an example of how you can tweak your theme to adjust the layout for both desktop and mobile:

```yaml
your_theme:
  card-mod-theme: your_theme
  card-mod-root-yaml: |
    .: |
      /* Add padding to the left (or other sides, depending on your navbar position) for desktop screens */
      @media (min-width: 768px) {
        hui-sections-view {
          padding-left: 100px !important;
        }
      }

      /* Add bottom padding for mobile screens to prevent cards from overlapping with the navbar */
      @media (max-width: 767px) {
        hui-sections-view:after {
          content: "";
          display: block;
          height: 80px;
          width: 100%;
          background-color: transparent; 
        }
      }
```

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
        [[[ states['binary_sensor.docker_hub_update_available'].state === 'on' ]]]
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
  .navbar {
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
  .navbar.desktop{
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
    show: |
      [[[ return user.name == "jose"]]] 
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
    selected: true      # force `selected` field to true
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
