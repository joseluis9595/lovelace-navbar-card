---
id: faq
title: FAQ
description: Find answers to common questions about the Navbar Card, including templates, configuration, customization, and troubleshooting
---

# Frequently Asked Questions

[![Home Assistant Community Forum](https://img.shields.io/badge/Home%20Assistant-Community%20Forum-319fee?logo=home-assistant)](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917) [![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-181717?logo=github)](https://github.com/joseluis9595/lovelace-navbar-card/issues)

### General Questions

<details>
<summary>Do I need to copy and paste the configuration every time?</summary>

No! You can use [**templates**](../configuration/template) to define a common configuration and reuse it across multiple dashboards. Any changes to the template automatically apply to every `navbar-card` using it in the current dashboard.

Example template usage:

```yaml
type: custom:navbar-card
template: my_template
```

</details>

<details>
<summary>Where do I put the template configuration?</summary>

Templates go under the `navbar-templates` key in your main Lovelace YAML configuration:

1. Open your dashboard
2. Click the three dots menu (⋮) in the top right
3. Select "Edit Dashboard"
4. Click the three dots menu (⋮) in the top right once again
5. Click "Raw Configuration Editor"
6. Add your template at the top of the file:

```yaml
navbar-templates:
  my_template:
    desktop:
      show_labels: true
    mobile:
      show_labels: false
    routes:
      - icon: mdi:home
        url: /lovelace/home
        label: Home
views:
  # Your normal lovelace configuration
  ...
```

</details>

<details>
<summary>How do I customize the appearance?</summary>

Navbar Card offers several ways to customize its appearance:

1. **CSS Variables**

   ```yaml
   type: custom:navbar-card
   styles: |
     .navbar {
       --navbar-primary-color: #4CAF50;
       --navbar-border-radius: 16px;
     }
   ```

2. **Direct CSS**

   ```yaml
   type: custom:navbar-card
   styles: |
     .navbar-card {
       background: rgba(0,0,0,0.7);
       backdrop-filter: blur(10px);
     }
   ```

See the [**Styles Configuration**](../configuration/styles) for more options.

</details>

<details>
<summary>How do I make the navbar responsive?</summary>

Navbar Card is responsive by default, but you can customize behavior for different screen sizes:

```yaml
type: custom:navbar-card
desktop:
  position: left
  min_width: 1024 # Switch to desktop mode at 1024px
  show_labels: true
mobile:
  position: bottom
  show_labels: false
```

The card will automatically switch between desktop and mobile layouts based on screen size.

</details>

### Advanced Features

<details>
<summary>Can I add dynamic content?</summary>

Yes! Use JavaScript templates to create dynamic content:

```yaml
type: custom:navbar-card
routes:
  - icon: mdi:thermometer
    label: |
      [[[
        const temp = states['sensor.temperature'].state;
        return `Temperature: ${temp}°C`;
      ]]]
```

See [**JavaScript Templates**](../types/js-template) for more examples.

</details>

<details>
<summary>How do I add custom actions?</summary>

`navbar-card` supports various action types when interacting with a route or popup item. You can either configure the tap action, hold action or double tap action to your liking. Head over to the [**Custom Actions**](../types/custom-actions) page for more information.

</details>

### Troubleshooting

<details>
<summary>The navbar isn't showing up</summary>

Try these steps:

1. Verify installation:
   - Check HACS for successful installation
   - Confirm resource is added in Dashboard Resources
   - Clear browser cache and reload

2. Check configuration:
   - Validate YAML syntax
   - Ensure required fields are present
   - Check browser console for errors (F12)

3. Still not working?
   - Try a minimal configuration first
   - Check version compatibility
   - Report the issue on GitHub

</details>

<br/>

---

## Can't find the answer you're looking for?

If you're still having issues, head over to the [Contact](./contact) page.
