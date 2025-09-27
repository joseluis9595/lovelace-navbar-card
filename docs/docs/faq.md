---
id: faq
title: Frequently Asked Questions
---

[![Home Assistant Community Forum](https://img.shields.io/badge/Home%20Assistant-Community%20Forum-319fee?logo=home-assistant)](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917) [![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-181717?logo=github)](https://github.com/joseluis9595/lovelace-navbar-card/issues)

Can't find the answer you're looking for? Feel free to ask for help either on the [Home Assistant Community Forum](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917) or on [GitHub Issues](https://github.com/joseluis9595/lovelace-navbar-card/issues).

---

<details>
<summary>Do I need to copy and paste the configuration every time?</summary>

No. You can use [**templates**](./configuration/template) to define a common configuration and reuse it across multiple dashboards.  
Any change to the template will automatically apply to every `navbar-card` using it in the current dashboard.

</details>

<details>
<summary>Where do I put the template configuration?</summary>

Templates go under the `navbar-templates` key in your main Lovelace YAML configuration. Go to your dashboard, click on the three dots in the top right corner and select "Edit YAML". There, add your template configuration as so:

Example:

```yaml
navbar-templates:
  your_template_name:
    # Your navbar config
    ...
views:
  # Your normal lovelace configuration
  ...
```

</details>
