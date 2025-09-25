---
id: template
title: Template
---

<!-- TODO JLAQ explain how to add templates to the dashboard in both yaml and visual editor -->

Templates allow you to predefine a custom configuration for `navbar-card` and reuse it across multiple dashboards. This approach saves time and simplifies maintenance — any change to the template will automatically apply to all cards using it.

#### Defining Templates

To define custom templates, add them under `navbar-templates` in your main Lovelace YAML configuration like this:

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

#### Referencing Templates

You can reference a template from your `navbar-card` using the template property:

```yaml
type: custom:navbar-card
template: your_template_name
```

#### Overriding props

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
