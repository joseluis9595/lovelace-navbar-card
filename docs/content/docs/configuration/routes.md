---
title: Routes
---

Routes are clickable navigation items that send you to another view or run an action. Each route supports the following configuration.

## Configuration options

| Name                | Type                                                             | Default     | Description                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`               | string                                                           | `Required*` | The path to a Lovelace view, opened on tap unless `tap_action` is defined. Also used to show the route as selected.                                        |
| `icon`              | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Material icon to display as this entry icon. Either `icon` or `image` is required.                                                                         |
| `icon_selected`     | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Icon to be displayed when `url` matches the current browser URL                                                                                            |
| `icon_color`        | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Custom color for the icon of this route.                                                                                                                   |
| `image`             | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | URL of an image to display as this entry icon. Either `icon` or `image` is required.                                                                       |
| `image_selected`    | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Image to be displayed when `url` matches the current browser URL                                                                                           |
| `badge`             | [Badge](#badge-options)                                                  | -           | Badge configuration                                                                                                                                        |
| `label`             | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Label to be displayed under the given route if `show_labels` is true                                                                                       |
| `selected`          | boolean \| [JSTemplate](../advanced/js-templates.md)                    | -           | Controls whether to display this route as selected or not. If not defined, the selected status will be computed as `route.url == window.location.pathname` |
| `selected_color`    | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Custom color for the icon and label when the route is selected                                                                                             |
| `tap_action`        | [CustomAction](../advanced/custom-actions.md)                          | -           | Custom tap action configuration.                                                                                                                           |
| `hold_action`       | [CustomAction](../advanced/custom-actions.md)                          | -           | Custom hold action configuration.                                                                                                                          |
| `double_tap_action` | [CustomAction](../advanced/custom-actions.md)                          | -           | Custom double_tap action configuration.                                                                                                                    |
| `popup`             | [Popup items](#popup-options) \| [JSTemplate](../advanced/js-templates.md) | -           | List of routes to display in a popup menu                                                                                                                  |
| `hidden`            | boolean \| [JSTemplate](../advanced/js-templates.md)                    | -           | Controls whether to render this route or not                                                                                                               |

!!! info

    `url` is required unless `tap_action`, `hold_action`, `double_tap_action` or `popup` is present. A `tap_action` replaces navigating to `url` on tap, but `url` is still used to show the route as selected.

!!! tip

    Some suggestions when using the `image` property:

    1. Place your custom images in the `<ha-config-folder>/www` directory
    2. Use images with a transparent background for best results
    3. Keep image dimensions squared for best results

## Badge { #badge-options }

A badge displays a small status indicator, count, text value, or icon over a navbar item. The badge remains hidden unless `show` is `true` or resolves to `true`.

<figure markdown="span">
    ![Navbar with dot, count, and icon badges](../../img/configuration/navbar-card_badges.png#only-light){ width="456" }
    ![Navbar with dot, count, and icon badges](../../img/configuration/navbar-card_badges_dark.png#only-dark){ width="456" }
</figure>

| Name         | Type                                                   | Default   | Description                                                     |
| ------------ | ------------------------------------------------------ | --------- | --------------------------------------------------------------- |
| `show`       | boolean \| [JSTemplate](../advanced/js-templates.md)          | false     | Controls whether to display the badge                           |
| `color`      | string \| [JSTemplate](../advanced/js-templates.md)           | red       | Background color of the badge                                   |
| `count`      | string \| number \| [JSTemplate](../advanced/js-templates.md) | -         | Text or number displayed inside the badge                       |
| `text_color` | string \| [JSTemplate](../advanced/js-templates.md)           | Automatic | Text color, calculated for contrast when omitted                |
| `icon`       | string \| [JSTemplate](../advanced/js-templates.md)           | -         | Home Assistant icon displayed inside the badge                  |
| `icon_color` | string \| [JSTemplate](../advanced/js-templates.md)           | Automatic | Icon color, falling back to `text_color` and automatic contrast |

If both `icon` and `count` are configured, a non-empty icon takes priority. If an icon template returns an empty value, the badge falls back to `count` or to the standard dot.

### Icon badge example

This example displays a red badge with an unlocked icon while the front door is unlocked:

```yaml
routes:
  - icon: mdi:door
    label: Front door
    url: /dashboard/security
    badge:
      show: |
        [[[ return states['lock.front_door'].state === 'unlocked'; ]]]
      icon: mdi:lock-open-variant
      color: red
      icon_color: white
```

<figure markdown="span">
    ![Navbar with an icon badge on the front door route](../../img/configuration/navbar-card_icon-badge.png#only-light){ width="536" }
    ![Navbar with an icon badge on the front door route](../../img/configuration/navbar-card_icon-badge_dark.png#only-dark){ width="536" }
</figure>

## Popup items { #popup-options }

For each route, a popup menu can be configured, to display a popup when clicked. This is activated using the `open-popup` action in `tap_action`, `hold_action` or `double_tap_action`.

<figure markdown="span">
    ![Navbar with the More popup open](../../img/configuration/navbar-card_popup.png#only-light){ width="456" }
    ![Navbar with the More popup open](../../img/configuration/navbar-card_popup_dark.png#only-dark){ width="456" }
</figure>

| Name                | Type                                          | Default     | Description                                                                                                                                              |
| ------------------- | --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`               | string                                        | `Required*` | The path to a Lovelace view, opened on tap unless `tap_action` is defined. Also used to show the item as selected.                                       |
| `icon`              | string \| [JSTemplate](../advanced/js-templates.md)  | -           | Material icon to display as this entry icon.                                                                                                             |
| `icon_selected`     | string \| [JSTemplate](../advanced/js-templates.md)  | -           | Icon to be displayed when `url` matches the current browser URL                                                                                          |
| `icon_color`        | string \| [JSTemplate](../advanced/js-templates.md)                     | -           | Custom color for the icon of this route.                                                                                                                   |
| `image`             | string \| [JSTemplate](../advanced/js-templates.md)  | -           | URL of an image to display as this entry icon.                                                                                                           |
| `image_selected`    | string \| [JSTemplate](../advanced/js-templates.md)  | -           | Image to be displayed when `url` matches the current browser URL                                                                                         |
| `badge`             | [Badge](#badge-options)                               | -           | Badge configuration                                                                                                                                      |
| `label`             | string \| [JSTemplate](../advanced/js-templates.md)  | -           | Label to be displayed under the given route if `show_labels` is true                                                                                     |
| `selected`          | boolean \| [JSTemplate](../advanced/js-templates.md) | -           | Controls whether to display this item as selected or not. If not defined, the selected status will be computed as `item.url == window.location.pathname` |
| `selected_color`    | string \| [JSTemplate](../advanced/js-templates.md)  | -           | Custom color for the icon and label when the item is selected                                                                                            |
| `tap_action`        | [CustomAction](../advanced/custom-actions.md)       | -           | Custom tap action configuration.                                                                                                                         |
| `hold_action`       | [CustomAction](../advanced/custom-actions.md)       | -           | Custom hold action configuration.                                                                                                                        |
| `double_tap_action` | [CustomAction](../advanced/custom-actions.md)       | -           | Custom double_tap action configuration.                                                                                                                  |
| `hidden`            | boolean \| [JSTemplate](../advanced/js-templates.md)                    | -           | Controls whether to render this route or not                                                                                                               |

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
