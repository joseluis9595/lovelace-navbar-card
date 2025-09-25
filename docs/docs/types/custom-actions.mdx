---
id: custom-actions
title: Custom actions
---

Apart from the [standard Home Assistant actions](https://www.home-assistant.io/dashboards/actions/) (navigate, call-service, etc.), `navbar-card` supports some additional custom actions for routes and popup items:

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
