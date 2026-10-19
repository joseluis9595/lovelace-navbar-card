---
title: Desktop
---

Specific configuration for desktop mode.

<figure markdown="span">
    ![Floating navbar on desktop](../../img/configuration/navbar-card_desktop.png#only-light){ width="456" }
    ![Floating navbar on desktop](../../img/configuration/navbar-card_desktop_dark.png#only-dark){ width="456" }
</figure>

| Name                           | Type                                          | Default   | Description                                                                                                             |
| ------------------------------ | --------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `mode`                         | `docked` \| `floating`                        | `floating` | Choose visualization mode on desktop devices. `floating` for centered navbar with margins, `docked` for edge-to-edge  |
| `show_labels`                  | boolean \| `popup_only` \| `routes_only`      | `false`   | Whether or not to display labels under each route                                                                       |
| `show_popup_label_backgrounds` | boolean                                       | `false`   | Whether or not to display label backgrounds for popup items                                                             |
| `min_width`                    | number                                        | `768`     | Screen width, in pixels, from which the navbar is displayed as its desktop variant                                       |
| `position`                     | `top` \| `bottom` \| `left` \| `right`        | `bottom`  | Position of the navbar on desktop devices                                                                              |
| `hidden`                       | boolean \| [JSTemplate](../advanced/js-templates.md) | `false`   | Set to true to hide the navbar on desktop devices                                                                       |

---

## Example of `show_popup_label_backgrounds` off and on

<figure markdown="span">
    ![Desktop popup labels without and with backgrounds](../../img/configuration/navbar-card_desktop_popuplabels.png#only-light){ width="888" }
    ![Desktop popup labels without and with backgrounds](../../img/configuration/navbar-card_desktop_popuplabels_dark.png#only-dark){ width="888" }
</figure>

---

## Example of `position: left` with `show_labels: true`

<figure markdown="span">
    ![Desktop navbar on the left with labels](../../img/configuration/navbar-card_desktop_position.png#only-light){ width="505" }
    ![Desktop navbar on the left with labels](../../img/configuration/navbar-card_desktop_position_dark.png#only-dark){ width="505" }
</figure>

---

## Example of `mode` floating (top) and docked (bottom)

<figure markdown="span">
    ![Desktop navbar floating and docked](../../img/configuration/navbar-card_desktop_mode.png#only-light){ width="425" }
    ![Desktop navbar floating and docked](../../img/configuration/navbar-card_desktop_mode_dark.png#only-dark){ width="425" }
</figure>
