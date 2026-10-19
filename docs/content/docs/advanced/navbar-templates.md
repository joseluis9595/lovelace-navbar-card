---
title: Navbar templates
---

!!! info "Want a single field to change dynamically, like a badge count? See [JavaScript templates](js-templates.md)."

Templates allow you to predefine a custom configuration for Navbar Card and reuse it in every navbar of a dashboard. This approach saves time and simplifies maintenance: any change to the template automatically applies to all cards using it.

## Defining templates

To define templates, open your dashboard in edit mode (pencil icon in the top right), click the three dots in the top right corner and select "Raw configuration editor". There, add your template configuration as so:

```yaml
navbar-templates:
   your_template_name:
      # Your navbar config
      routes:
         - label: Home
           icon: mdi:home
           url: /lovelace/home
         ...
# Your normal lovelace configuration
views:
...
```

## Referencing templates

You can reference a template from your card using the `template` property:

```yaml
type: custom:navbar-card
template: your_template_name
```

## Overriding props

Card properties defined directly in the card will take priority over those inherited from the template.

For example, if you want to use a template called `your_template_name` but have one specific dashboard with a different primary color, your configurations might look like this:

- Default Navbar for Most Views:

```yaml
type: custom:navbar-card
template: your_template_name
```

- Customized Navbar for a Specific View:

```yaml
type: custom:navbar-card
template: your_template_name
styles: |
  .navbar {
    --navbar-primary-color: red;
  }
```

## Visual editor

Right now, using the visual editor only applies properties to the card itself, not the template. This means that if you want to change a property of the template, you need to follow the steps mentioned in the [Defining Templates](#defining-templates) section.
