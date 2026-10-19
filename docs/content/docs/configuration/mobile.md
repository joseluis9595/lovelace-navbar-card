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
