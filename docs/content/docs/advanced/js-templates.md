---
title: JavaScript templates
---

# JavaScript templates

!!! info "Want to reuse a whole configuration across cards? See [navbar templates](navbar-templates.md)."

JavaScript templates provide powerful customization capabilities for your Navbar Card. They allow you to create dynamic content, conditional rendering, and interactive features based on your Home Assistant state and user context.

Fields marked as `JSTemplate` in the [**configuration**](../configuration/overview.md) tables support JavaScript templates.

## Template syntax

To use JavaScript templates in your configuration:

1. In YAML editor, wrap your JavaScript code in `[[[` and `]]]`:

    ```yaml
    field: |
      [[[ your_javascript_code_here ]]]
    ```

2. In the visual editor, write the code without `[[[` and `]]]`:

    ```javascript
    your_javascript_code_here;
    ```

---

## Available context

Your JavaScript templates have access to these predefined variables:

| Variable | Content                                                                           | Description                     |
| -------- | --------------------------------------------------------------------------------- | ------------------------------- |
| `states` | [HA `states`](https://developers.home-assistant.io/docs/frontend/data#hassstates)   | Global state of all HA entities |
| `user`   | [HA `user` state](https://developers.home-assistant.io/docs/frontend/data#hassuser) | Current user information        |
| `hass`   | [HA `hass` object](https://developers.home-assistant.io/docs/frontend/data)       | Home Assistant instance         |
| `navbar` | `{isDesktop: boolean}`                                                            | Navbar Card internal state      |

### States object

The state and attributes of any entity, e.g. a badge shown while the kitchen light is on:

```yaml
badge:
  show: |
    [[[ return states['light.kitchen'].state === 'on'; ]]]
```

Attributes work the same way, e.g. `states['light.kitchen'].attributes.brightness`.

### User object

The current user (`user.name`, `user.id`, `user.is_admin`, `user.is_owner`), e.g. a route only admins can see:

```yaml
hidden: |
  [[[ return !user.is_admin; ]]]
```

### Navbar object

The card's own state (`navbar.isDesktop`), e.g. a label only shown on desktop:

```yaml
label: |
  [[[ return navbar.isDesktop ? 'Settings' : ''; ]]]
```

---

## Debugging tips

1. **Use Console Logging**. Open the browser console (F12) to debug your templates.

    ```javascript
    [[[
      console.log('States:', states);
      console.log('User:', user);
      console.log('Navbar:', navbar);
      return 'Debug Mode';
    ]]]
    ```

2. **Error Handling**. Use try/catch to handle errors in your templates.

    ```javascript
    [[[
      try {
        // Your code here
        return 'Success';
      } catch (error) {
        console.error('Template Error:', error);
        return 'Error';
      }
    ]]]
    ```
