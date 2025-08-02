# Navbar Card

[![Version](https://img.shields.io/github/v/release/joseluis9595/lovelace-navbar-card)](#)
[![Last commit](https://img.shields.io/github/last-commit/joseluis9595/lovelace-navbar-card)](#)
![Downloads](https://img.shields.io/github/downloads/joseluis9595/lovelace-navbar-card/total)
[![HA Community forum](https://img.shields.io/badge/Home%20Assistant-Community%20Forum-319fee?logo=home-assistant)](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917)
[![Buy me a beer](https://img.shields.io/badge/Support-Buy%20me%20a%20beer-fdd734?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/joseluis9595)

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


| Name       | Type                  | Default    | Description                                                  |
| ---------- | --------------------- | ---------- | ------------------------------------------------------------ |
| `routes`   | [Routes](#routes)     | `Required` | Defines the array of routes to be shown in the navbar        |
| `desktop`  | [Desktop](#desktop)   | -          | Options specific to desktop mode                             |
| `mobile`   | [Mobile](#mobile)     | -          | Options specific to mobile mode                              |
| `template` | [Template](#template) | -          | Template name                                                |
| `styles`   | [Styles](#styles)     | -          | Custom CSS styles for the card                               |
| `haptic`   | [Haptic](#haptic)     | -          | Fine tune when the haptic events should be fired in the card |

### Routes

Routes represents an array of clickable icons that redirects to a given path. Each item in the array should contain the following configuration:

| Name                | Type                                 | Default     | Description                                                                                                                                                |
| ------------------- | ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`               | string                               | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                                                                                           |
| `icon`              | string \| [JSTemplate](#jstemplate) | -           | Material icon to display as this entry icon. Either `icon` or `image` is required.                                                                         |
| `icon_selected`     | string \| [JSTemplate](#jstemplate) | -           | Icon to be displayed when `url` matches the current browser URL                                                                                            |
| `image`             | string \| [JSTemplate](#jstemplate) | -           | URL of an image to display as this entry icon. Either `icon` or `image` is required.                                                                       |
| `image_selected`    | string \| [JSTemplate](#jstemplate) | -           | Image to be displayed when `url` matches the current browser URL                                                                                           |
| `badge`             | [Badge](#badge)                      | -           | Badge configuration                                                                                                                                        |
| `label`             | string \| [JSTemplate](#jstemplate)  | -           | Label to be displayed under the given route if `show_labels` is true                                                                                       |
| `tap_action`        | [tap_action](#actions)               | -           | Custom tap action configuration.                                                                                                                           |
| `hold_action`       | [hold_action](#actions)              | -           | Custom hold action configuration.                                                                                                                          |
| `double_tap_action` | [double_tap_action](#actions)        | -           | Custom double_tap action configuration.                                                                                                                    |
| `popup`             | [Popup items](#popup-items)          | -           | List of routes to display in a popup menu                                                                                                                  |
| `hidden`            | boolean \| [JSTemplate](#jstemplate) | -           | Controls whether to render this route or not                                                                                                               |
| `selected`          | boolean \| [JSTemplate](#jstemplate) | -           | Controls whether to display this route as selected or not. If not defined, the selected status will be computed as `route.url == window.location.pathname` |

> **Note**: `url` is required unless `tap_action`, `hold_action`, `double_tap_action` or `popup` is present.

> **Note**: If `tap_action` is defined, `url` is ignored.

<br>

> **Tip**: Some suggestions when using the `image` property:
>
> 1. Place your custom images in the `<ha-config-folder>/www` directory
> 2. Use images with a transparent background for best results
> 3. Keep image dimensions squared for best results

#### Actions

Apart from the [standard Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) (navigate, call-service, etc.), `navbar-card` supports some additional custom actions:

| Action          | Description                                                | Required Parameters |
| --------------- | ---------------------------------------------------------- | ------------------- |
| `open-popup`    | Opens the popup menu defined in the route                  | None                |
| `toggle-menu`   | Opens the native HA side menu                              | None                |
| `navigate-back` | Navigates back to the previous page in the browser history | None                |

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
    hold_action:
      action: toggle-menu # Will open the native HA side menu
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


| Name          | Type                                | Default     | Description                                                                       |
| ------------- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `url`         | string                              | `Required*` | The path to a Lovelace view. Ignored if `tap_action` is defined.                  |
| `icon`        | string \| [JSTemplate](#jstemplate) | `Required`  | Material icon to display as this entry icon                                       |
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

<img width="400" height="120" alt="navbar-card_desktop" src="https://github.com/user-attachments/assets/3f110a2d-3078-41ff-b357-459c69785fe8" />

| Name          | Type                                     | Default  | Description                                                                |
| ------------- | ---------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `show_labels` | boolean \| `popup_only` \| `routes_only` | `false`  | Whether or not to display labels under each route                          |
| `min_width`   | number                                   | `768`    | Screen size from which the navbar will be displayed as its desktop variant |
| `position`    | `top` \| `bottom` \| `left` \| `right`   | `bottom` | Position of the navbar on desktop devices                                  |
| `hidden`      | boolean \| [JSTemplate](#jstemplate)     | `false`  | Set to true to hide the navbar on desktop devices                          |

---

### Mobile

Specific configuration for mobile mode.

<img width="400" height="96" alt="navbar-card_mobile" src="https://github.com/user-attachments/assets/cefed0af-3c52-4ab2-90fa-0e277a35df4d" />

| Name          | Type                                     | Default | Description                                       |
| ------------- | ---------------------------------------- | ------- | ------------------------------------------------- |
| `show_labels` | boolean \| `popup_only` \| `routes_only` | `false` | Whether or not to display labels under each route |
| `hidden`      | boolean \| [JSTemplate](#jstemplate)     | `false` | Set to true to hide the navbar on mobile devices  |

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

- `.navbar-popup`: Main container for the popup.

- `.navbar-popup-backdrop`: Backdrop styles for the popup.

- `.popup-item`: Styles applied to the container of each popup-item. This object contains both the "button" with the icon, and the label.
  - `.popup-item.label-[top | bottom | left | right]`: Specific styles for different positions of the label.
  - `.popup-item .label`: Styles applied to the label of each popup item.
  - `.popup-item .button`: Button for each popup item, containing just the icon.

<br>

---

<br>

## 🛠️ Dashboard adjustements

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

[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_a_Beer-fdd734?&logo=buy-me-a-coffee&logoColor=black&style=for-the-badge)](https://www.buymeacoffee.com/joseluis9595)  [![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-30363d?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/joseluis9595)

Your support means a lot and helps keep the project alive and growing. Thank you! 🙌

