# Navbar Card
Navbar Card is a custom Lovelace card that simplifies navigation within your Home Assistant dashboard. This card provides a sleek, responsive navigation bar that appears at the bottom of the screen on mobile devices and on the side for desktop users.

## 🚀 Installation
### Via HACS (recommended)
1. Go to HACS in Home Assistant.
2. Search for "Navbar Card".
3. Click Install!


### Adding the Card to Your Dashboard
To get started, edit your dashboard, click on "New card", and add the following configuration:

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    icon: mdi:devices
  - url: /lovelace/temperature
    icon: mdi:thermometer
  - url: /lovelace/control
    icon: mdi:creation-outline
    icon_selected: mdi:creation
  - url: /lovelace/system
    icon: mdi:cog-outline
    icon_selected: mdi:cog
```

## ⚙️ Configuration
- routes: Define your navigation items.
  - url: The path to a Lovelace view.
  - icon: The default icon.
  - icon_selected: (Optional) The icon displayed when the view is active.

#### Example Configuration
```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    icon: mdi:devices
  - url: /lovelace/system
    icon: mdi:cog-outline
    icon_selected: mdi:cog
```