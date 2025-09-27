---
id: quickstart
title: Quickstart
---

## Add navbar-card to your dashboard

Once `navbar-card` is installed, you can add it to any Lovelace dashboard just like any other card:

1. Open your dashboard in **edit mode**.
2. Click **“Add card”**.
3. Search for **navbar-card** and select it.

![Add navbar-card to your dashboard](/img/quickstart/navbar-card_tutorial_1-add-card.gif)

By default, the card will be **auto-populated with common routes** (e.g. Home, Settings, Map), so you can start using it immediately.

---

## Customize the card

You can edit the card directly in the **visual editor** or switch to **YAML mode**.

Minimal YAML example:

```yaml
type: custom:navbar-card
items:
  - name: Home
    icon: mdi:home
    path: /lovelace/home
  - name: Devices
    icon: mdi:lightbulb
    path: /lovelace/devices
  - name: Settings
    icon: mdi:cog
    path: /config/dashboard
```

---

## Video tutorials

Some very useful videos made by the community to get you started.

#### First steps by [@jlbln](https://www.youtube.com/@HADashboards):

<iframe 
    width="560"
    height="315"
    src="https://www.youtube.com/embed/qZ3aoDeG3e8"
    title=""
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowFullScreen
    >
</iframe>

#### Visual editor overview by [@jlbln](https://www.youtube.com/@HADashboards):

<iframe 
    width="560"
    height="315"
    src="https://www.youtube.com/embed/2ZY7gu6bnxA"
    title=""
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowFullScreen
    >
</iframe>
