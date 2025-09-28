---
id: installation
title: Installation
description: Learn how to install the Navbar Card in your Home Assistant setup
---

# Installation Guide

There are several ways to install the Navbar Card. Choose the method that works best for you.

## Option 1: Install via HACS (Recommended)

The easiest way to install and keep the Navbar Card updated is through HACS (Home Assistant Community Store).

### Using My Home Assistant

Click the button below to automatically add the repository to HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=joseluis9595&repository=lovelace-navbar-card&category=plugin)

### Manual HACS Installation

1. Open **HACS** in your Home Assistant instance
2. Go to the **Frontend** section
3. Click the **⋮** menu in the top right
4. Select **Custom repositories**
5. Add the repository:
   - URL: `https://github.com/joseluis9595/lovelace-navbar-card`
   - Category: `Lovelace`
6. Click **Add**
7. Search for "Navbar Card" in HACS
8. Click **Download**
9. Restart Home Assistant

:::tip Automatic Updates
When installed through HACS, you'll automatically get notified when updates are available!
:::

<br/>

---

## Option 2: Manual Installation

If you prefer to install the card manually or don't use HACS, follow these steps:

1. Download the latest release:
   - Go to the [latest release page](https://github.com/joseluis9595/lovelace-navbar-card/releases/latest)
   - Download `navbar-card.js`

2. Copy to Home Assistant:
   - Move the downloaded file to your Home Assistant configuration directory:
     ```bash
     <config>/www/
     ```
   - If the `www` folder doesn't exist, create it first

3. Add the resource:
   - Go to **Settings** → **Dashboards**
   - Click **⋮** (three dots menu) in the top right
   - Select **Resources**
   - Click the **+ Add Resource** button
   - Enter:
     - **URL**: `/local/navbar-card.js`
     - **Resource type**: `JavaScript Module`
   - Click **Create**

4. Restart Home Assistant Frontend:
   - Refresh your browser cache
   - If issues persist, restart Home Assistant
