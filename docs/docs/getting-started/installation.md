---
id: installation
title: Installation
---

<details open>
  <summary>Open in HACS (recommended)</summary>

<br/>

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=joseluis9595&repository=lovelace-navbar-card&category=plugin)

</details>

<details>
  <summary>HACS manual configuration</summary>

<br/>

1. Go to HACS in your Home Assistant instance.
2. On the top right, click "Custom repositories".
3. Enter the repository URL: https://github.com/joseluis9595/lovelace-navbar-card.git
4. Search for "Navbar Card".
5. Click Install!

</details>

<details>
  <summary>Manual installation without HACS</summary>

<br/>

1. Download [navbar-card.js](https://github.com/joseluis9595/lovelace-navbar-card/releases/latest/download/navbar-card.js) from the latest release.
2. Move this file to home assistant's `<config>/www` folder.
3. In home assistant, go to `Settings > Dashboards`.
4. On the top right corner, click `Resources`.
5. Add a new resource with the following:
   - **URL**: `/local/navbar-card.js`
   - **Resource type**: JavaScript module
6. Go to your dashboard, refresh your page and add your new navbar-card!

</details>
