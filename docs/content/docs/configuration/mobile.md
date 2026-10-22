---
title: Mobile
---

Specific configuration for mobile mode.

<figure markdown="span">
    ![Docked navbar on a phone](../../img/configuration/navbar-card_mobile.png#only-light){ width="470" }
    ![Docked navbar on a phone](../../img/configuration/navbar-card_mobile_dark.png#only-dark){ width="470" }
</figure>

| Name                           | Type                                          | Default  | Description                                                                                                             |
| ------------------------------ | --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `mode`                         | `docked` \| `floating`                        | `docked` | Choose visualization mode on mobile devices. `docked` for default experience, `floating` for desktop-like visualization |
| `show_labels`                  | boolean \| `popup_only` \| `routes_only`      | `false`  | Whether or not to display labels under each route                                                                       |
| `show_popup_label_backgrounds` | boolean                                       | `false`  | Whether or not to display label backgrounds for popup items                                                             |
| `safe_area`                    | boolean                                       | `false`  | Adds space below the navbar so it doesn't overlap the phone's gesture or navigation bar                                 |
| `scrollable`                   | boolean                                       | `false`  | Lets the navbar scroll sideways when it has more routes than fit, keeping the selected route centred. See [Scrollable navbar](#scrollable-navbar) |
| `autohide`                     | `false` \| `slide` \| `minimize` \| `toggle`  | `false`  | Gets the navbar out of the way of your dashboard. See [Auto-hide](#auto-hide)                                           |
| `hidden`                       | boolean \| [JSTemplate](../advanced/js-templates.md) | `false`  | Set to true to hide the navbar on mobile devices                                                                        |

---

## Example of `mode` docked (left) and floating (right)

<figure markdown="span">
    ![Mobile navbar docked and floating](../../img/configuration/navbar-card_mobile_mode.png#only-light){ width="916" }
    ![Mobile navbar docked and floating](../../img/configuration/navbar-card_mobile_mode_dark.png#only-dark){ width="916" }
</figure>

---

## Example of `show_labels` off and on

<figure markdown="span">
    ![Mobile navbar without and with labels](../../img/configuration/navbar-card_mobile_labels.png#only-light){ width="916" }
    ![Mobile navbar without and with labels](../../img/configuration/navbar-card_mobile_labels_dark.png#only-dark){ width="916" }
</figure>

---

## Example of `show_popup_label_backgrounds` off and on

<figure markdown="span">
    ![Mobile popup labels without and with backgrounds](../../img/configuration/navbar-card_popuplabels.png#only-light){ width="916" }
    ![Mobile popup labels without and with backgrounds](../../img/configuration/navbar-card_popuplabels_dark.png#only-dark){ width="916" }
</figure>

---

## Example of `safe_area` off (left) and on (right)

Sometimes Navbar Card collides with the native gesture bar on Android/iOS. Enable `mobile.safe_area: true` to give a little more breathing room.

<figure markdown="span">
    ![Mobile navbar with safe_area off (left) and on (right)](../../img/configuration/navbar-card_safe-area.png#only-light){ width="916" }
    ![Mobile navbar with safe_area off (left) and on (right)](../../img/configuration/navbar-card_safe-area_dark.png#only-dark){ width="916" }
</figure>

---

## Scrollable navbar

With more routes than fit on a phone, set `scrollable: true`. Each route keeps a fixed width (a quarter of the screen by default) and the navbar scrolls sideways. When a view opens, its route is scrolled to the middle of the navbar, so you can always see where you are, and the edges fade while there are more routes to scroll to.

```yaml
type: custom:navbar-card
mobile:
  scrollable: true
routes:
  # ...as many routes as you like
```

<figure markdown="span">
    ![Eight routes squeezed in (left) and scrolling with the selected route centred (right)](../../img/configuration/navbar-card_scrollable.png#only-light){ width="916" }
    ![Eight routes squeezed in (left) and scrolling with the selected route centred (right)](../../img/configuration/navbar-card_scrollable_dark.png#only-dark){ width="916" }
</figure>

To show more or fewer routes at a time, change `--navbar-scrollable-route-width` (`25%` shows four); see [CSS variables](styles.md#css-variables).

---

## Auto-hide

`autohide` gives the dashboard more room on phones. It only applies in mobile mode.

| Value      | Behaviour                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slide`    | The navbar slides off the bottom while you scroll down, and comes back as soon as you scroll up or reach the end of the view                                   |
| `minimize` | While you scroll down, the navbar shrinks to a pill showing only the selected route, in the middle of the screen. Scroll up, or tap the pill, to expand it again |
| `toggle`   | Adds an arrow tab on top of the navbar. Tapping it folds the navbar away, leaving only the tab; tapping again brings it back. Remembered on each device         |

With `slide` and `minimize`, the navbar is always shown near the top of a view, while a popup is open, and after navigating to another view, and small scroll movements are ignored so it doesn't flicker. With `toggle`, only the tab changes it.

```yaml
type: custom:navbar-card
mobile:
  autohide: minimize
routes:
  # ...
```

<figure markdown="span">
    ![The arrow tab added by autohide: toggle](../../img/configuration/navbar-card_autohide-toggle.png#only-light){ width="470" }
    ![The arrow tab added by autohide: toggle](../../img/configuration/navbar-card_autohide-toggle_dark.png#only-dark){ width="470" }
</figure>

Timing and the size of the `toggle` tab can be adjusted with [CSS variables](styles.md#css-variables).
