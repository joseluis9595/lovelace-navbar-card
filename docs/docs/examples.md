---
id: examples
title: Examples
---

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


