---
title: Layout
---

Options for how Navbar Card fits into your dashboard.

| Name                  | Type                          | Default | Description                                                                                            |
| --------------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `auto_padding`        | [Auto Padding](#auto-padding) | -       | Add padding to your Home Assistant dashboard to prevent overlaps                                      |
| `reflect_child_state` | `boolean`                     | `false` | Determines if each route item should be displayed as selected when any of its popup items is selected |

## Auto padding

Automatically adds padding to your Home Assistant dashboard to prevent cards from overlapping with Navbar Card. This eliminates the need for manual CSS padding adjustments in your Home Assistant theme. No padding is added while the navbar is hidden (`desktop.hidden` / `mobile.hidden`).

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
