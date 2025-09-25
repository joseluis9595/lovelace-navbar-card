---
id: js-template
title: JSTemplate
---

You can easily customize some properties of `navbar-card` by writing your own JavaScript rules. To do this, you simply wrap the value of the field that supports JSTemplates in `[[[` and `]]]`, then write the JavaScript code that determines the property's value.

:::note
`[[[` and `]]]` are only needed in the YAML editor. For the visual editor, simply write plain javascript in the code block without the template wrappers.
:::

Apart from using plain javascript, you can access some predefined variables:

- `states` -> Contains the global state of all entities in HomeAssistant. To get the state of a specific entity, use: `states['entity_type.your_entity'].state`.
- `user` -> Information about the current logged user.
- `navbar` -> Internal state of the navbar-card. Accessible fields are:
  - `isDesktop` -> Boolean indicating whether the card is in its desktop variant or not.

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
    hidden: |
      [[[ return navbar.isDesktop; ]]]
  - url: /lovelace/devices
    label: Devices
    icon: mdi:devices
    hidden: |
      [[[ return user.name != "jose"; ]]]
```

:::tip
You can use `console.log` in your JSTemplate to help debug your HomeAssistant states.
:::
