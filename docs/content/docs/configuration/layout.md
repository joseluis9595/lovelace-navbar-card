---
title: Layout
---

Options for how Navbar Card fits into your dashboard.

| Name                  | Type                          | Default | Description                                                                                            |
| --------------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `auto_padding`        | [Auto Padding](#auto-padding-options) | -       | Add padding to your Home Assistant dashboard to prevent overlaps                                      |
| `reflect_child_state` | `boolean`                     | `false` | Determines if each route item should be displayed as selected when any of its popup items is selected |
| `popup_style`         | `bubbles` \| `panel`          | `bubbles` | How popups look. `bubbles` shows each item as a floating button; `panel` shows all items as rows of icon and label in a single panel. See [Popup style](#popup-style) |

## Auto padding { #auto-padding-options }

Automatically adds padding to your Home Assistant dashboard to prevent cards and the [view footer](https://www.home-assistant.io/dashboards/sections/#editing-the-footer) from overlapping with Navbar Card. This eliminates the need for manual CSS padding adjustments in your Home Assistant theme. No padding is added while the navbar is hidden (`desktop.hidden` / `mobile.hidden`).

| Name              | Type    | Default | Description                                                                                                     |
| ----------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `enabled`         | boolean | `true`  | Whether to automatically add padding to prevent overlaps                                                        |
| `desktop_px`      | number  | `100`   | Padding in pixels for desktop mode, applied to the side set in `desktop.position`                              |
| `mobile_px`       | number  | `80`    | Padding in pixels for mobile mode, applied to the bottom of the view                                           |
| `media_player_px` | number  | `100`   | Extra padding reserved when the media player widget is visible (added to desktop top/bottom and mobile bottom) |

### Multiple navbars on the same view

When a view has more than one navbar-card, each side of the dashboard gets the largest padding of the navbars placed on it. For example, with one navbar using `desktop.position: bottom` and `desktop_px: 100`, and another one using `desktop.position: top` and `desktop_px: 60`, the dashboard gets 100px at the bottom and 60px at the top on desktop.

!!! warning

    For padding, the screen width where mobile switches to desktop is taken from the first navbar's `desktop.min_width`. If your navbars use different `min_width` values, set the same one in all of them.

---

## Popup style

`popup_style: panel` shows a popup as one panel with a row for each item (icon, then label), similar to a context menu. Labels are always shown in this style, whatever `show_labels` is set to. The page behind is dimmed slightly, and the navbar itself stays visible and usable while the popup is open.

```yaml
type: custom:navbar-card
layout:
  popup_style: panel
```

<figure markdown="span">
    ![Popup with popup_style bubbles (left) and panel (right)](../../img/configuration/navbar-card_popup-style.png#only-light){ width="916" }
    ![Popup with popup_style bubbles (left) and panel (right)](../../img/configuration/navbar-card_popup-style_dark.png#only-dark){ width="916" }
</figure>

---

## Example

```yaml
type: custom:navbar-card
layout:
  reflect_child_state: true
  auto_padding:
    enabled: true
    desktop_px: 100
    mobile_px: 80
    media_player_px: 100
``` 
