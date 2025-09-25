---
id: faq
title: Frequently Asked Questions
---

#### I've added the card to my dashboard, do i need to copy and paste the configuration every time?

No, you can use templates to define a common configuration for your navbar-card and reuse it across multiple dashboards. This approach saves time and simplifies maintenance — any change to the template will automatically apply to all cards using it.

---

#### Where do I need to put the template configuration?

Under the `navbar-templates` key in your main Lovelace YAML configuration. Go to your dashboard, click on the three dots in the top right corner and select "Edit YAML". There, add your template configuration as so:

```yaml
navbar-templates:
  your_template_name:
    # Your navbar config
    ...
```

<br/>
