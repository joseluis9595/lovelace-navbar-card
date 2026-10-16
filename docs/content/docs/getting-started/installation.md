---
title: Installation
description: Learn how to install Navbar Card in your Home Assistant setup
---

# Installation

There are several ways to install Navbar Card. Choose the method that works best for you.

=== "HACS (recommended)"

    The easiest way to install and keep Navbar Card updated. You'll automatically get notified when updates are available.

    1. Open the repository in HACS:

        [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=joseluis9595&repository=lovelace-navbar-card&category=plugin)

    2. Click **Download**
    3. Restart Home Assistant

    If the button doesn't work, open **HACS** → **⋮** → **Custom repositories** and add `https://github.com/joseluis9595/lovelace-navbar-card` with category `Dashboard`, then search for "Navbar Card" and continue from step 2.

=== "Manual"

    If you prefer to install the card manually or don't use HACS:

    1. Download `navbar-card.js` from the [latest release page](https://github.com/joseluis9595/lovelace-navbar-card/releases/latest)
    2. Copy it to `<config>/www/` in your Home Assistant configuration directory. If the `www` folder doesn't exist, create it first
    3. Go to **Settings** → **Dashboards** → **⋮** → **Resources**, click **+ Add Resource** and enter:
        - **URL**: `/local/navbar-card.js`
        - **Resource type**: `JavaScript Module`
    4. Refresh your browser cache. If issues persist, restart Home Assistant

Once it's installed, [add the card to your dashboard](quickstart.md).
