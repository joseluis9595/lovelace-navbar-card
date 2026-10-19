---
title: FAQ
description: Find answers to common questions about Navbar Card, including templates, configuration, customization, and troubleshooting
---

# Frequently asked questions

## General questions

??? question "Do I need to copy and paste the configuration every time?"

    No! You can use [**navbar templates**](../advanced/navbar-templates.md) to define a common configuration and reuse it in every navbar of a dashboard. Any changes to the template automatically apply to every `navbar-card` using it in the current dashboard.

??? question "Where do I put the template configuration?"

    Templates go under the `navbar-templates` key in your main Lovelace YAML configuration:

    1. Open your dashboard
    2. Click the pencil icon in the top right to edit it
    3. Click the three dots menu (⋮) in the top right
    4. Click "Raw configuration editor"
    5. Add your template at the top of the file:

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

??? question "How do I customize the appearance?"

    Navbar Card can be styled with CSS variables or direct CSS through the `styles` option. See the [**Styles**](../configuration/styles.md) for all classes and variables.

??? question "How do I make the navbar responsive?"

    Navbar Card is responsive by default, but you can customize behavior for different screen sizes:

    ```yaml
    type: custom:navbar-card
    desktop:
      position: left
      min_width: 1024 # Switch to desktop mode at 1024px
      show_labels: true
    mobile:
      show_labels: false
    ```

    The card will automatically switch between desktop and mobile layouts based on screen size.

## Advanced features

??? question "Can I add dynamic content?"

    Yes! Use JavaScript templates to create dynamic content. See [**JavaScript templates**](../advanced/js-templates.md) for more examples.

??? question "How do I add custom actions?"

    Navbar Card supports various action types when interacting with a route or popup item. You can either configure the tap action, hold action or double tap action to your liking. Head over to the [**Custom actions**](../advanced/custom-actions.md) page for more information.

## Troubleshooting

??? question "My cards are hidden behind the navbar"

    See [Cards hidden behind the navbar](../advanced/dashboard-tweaks.md#cards-hidden-behind-the-navbar).

??? question "How do I hide Home Assistant's native tabs?"

    See [Hide the native tabs](../advanced/dashboard-tweaks.md#hide-the-native-tabs).

??? question "The navbar isn't showing up"

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

---

## Can't find the answer you're looking for?

If you're still having issues, head over to the [Contact](contact.md) page.
