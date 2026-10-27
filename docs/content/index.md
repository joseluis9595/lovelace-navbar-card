---
hide:
  - navigation
  - toc
---

<div class="nc-hero" markdown>

<div class="nc-hero__text" markdown>

# Navbar Card

**`navbar-card`** is a custom Lovelace card that adds a navigation bar to your Home Assistant dashboards.
{ .nc-hero__lead }

Inspired by [Adaptive Mushroom](https://community.home-assistant.io/t/adaptive-mushroom/640308) and [Material Design](https://m3.material.io/). Minimal, responsive, and easy to configure.

[Get started](docs/getting-started/installation.md){ .md-button .md-button--primary }
[Browse examples](docs/examples.md){ .md-button }

</div>

<div class="nc-hero__image" markdown>

![Navbar Card on a phone](img/home/navbar-card_home.png#only-light){ width="470" }
![Navbar Card on a phone](img/home/navbar-card_home_dark.png#only-dark){ width="470" }

</div>

</div>

## Why Navbar Card?

<div class="grid cards nc-features" markdown>

-   :material-compass-outline:{ .lg } **Unified navigation**

    ---

    Across all your dashboards, with popups and badges for each route.

    [:octicons-arrow-right-24: Routes](docs/configuration/routes.md)

-   :material-monitor-cellphone:{ .lg } **Responsive layout**

    ---

    Automatically adapts to screen size, on desktop and mobile.

    [:octicons-arrow-right-24: Desktop](docs/configuration/desktop.md) · [Mobile](docs/configuration/mobile.md)

-   :material-content-copy:{ .lg } **Reusable templates**

    ---

    Set up a navbar once and reuse it on all your dashboards.

    [:octicons-arrow-right-24: Navbar templates](docs/advanced/navbar-templates.md)

-   :material-gesture-tap:{ .lg } **Customizable actions**

    ---

    Tap, hold and double tap actions for every route and popup item.

    [:octicons-arrow-right-24: Custom actions](docs/advanced/custom-actions.md)

-   :material-palette-outline:{ .lg } **Icons and styles**

    ---

    Colors, sizes and shapes through CSS variables and classes.

    [:octicons-arrow-right-24: Styles](docs/configuration/styles.md)

-   :material-music-circle-outline:{ .lg } **Media player**

    ---

    A media player widget above or alongside the navbar.

    [:octicons-arrow-right-24: Media player](docs/configuration/media-player.md)

</div>

## Quick start

<div class="nc-quickstart" markdown>

<div markdown>

1. [**Install**](docs/getting-started/installation.md) the card through HACS.
2. [**Add**](docs/getting-started/quickstart.md) it to your dashboard.
3. [**Configure**](docs/configuration/overview.md) your routes, or start from an [**example**](docs/examples.md).

</div>

```yaml
type: custom:navbar-card
desktop:
  position: left
  show_labels: true
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/devices
    icon: mdi:devices
    label: Devices
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
```

</div>

## Community

<div class="grid cards nc-features" markdown>

-   :simple-homeassistant:{ .lg } **Community forum**

    ---

    Questions, ideas and showcases on the Home Assistant forum.

    [:octicons-arrow-right-24: Join the thread](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917)

-   :fontawesome-brands-github:{ .lg } **GitHub**

    ---

    Report bugs, request features or contribute.

    [:octicons-arrow-right-24: Repository](https://github.com/joseluis9595/lovelace-navbar-card)

-   :material-glass-mug-variant:{ .lg } **Support**

    ---

    If you enjoy using Navbar Card, you can find ways to support the project here.

    [:octicons-arrow-right-24: Support the project](docs/help/support.md)

</div>
