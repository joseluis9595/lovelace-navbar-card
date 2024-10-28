
# Navbar Card
![navbar-card](https://github.com/user-attachments/assets/df2a9a5d-51ec-4786-8f54-36ece2aa6f9a)

Navbar Card is a custom Lovelace card that simplifies navigation within your Home Assistant dashboard. This card provides a sleek, responsive navigation bar that appears at the bottom of the screen on mobile devices and on the side for desktop users.

[![Version](https://img.shields.io/github/v/release/joseluis9595/lovelace-navbar-card)](#)
[![Last commit](https://img.shields.io/github/last-commit/joseluis9595/lovelace-navbar-card)](#)
![Downloads](https://img.shields.io/github/downloads/joseluis9595/lovelace-navbar-card/total)

## 🚀 Installation
### Via HACS (recommended)
1. Go to HACS in Home Assistant.
2. Search for "Navbar Card".
3. Click Install!


## ⚙️ Configuration

### Main options

| Name              | Type              | Default    | Description                                                                |
| ----------------- | ----------------- | ---------- | -------------------------------------------------------------------------- |
| `routes`          | [Routes](#routes) | `Required` | Defines the array of routes to be shown in the navbar                      |
| `desktopMinWidth` | number            | `768`      | Screen size from which the navbar will be displayed as its desktop variant |

### Routes
Routes represents an array of clickable icons that redirects to a given path. Each item in the array should contain the following configuration:

| Name            	| Type    | Default    	| Description                                                     	|
|-----------------	|-------	|------------	|-----------------------------------------------------------------	|
| `url`           	| string 	| `Required` 	| The path to a lovelace view                                     	|
| `icon`          	| string 	| `Required` 	| Material icon to display as this entry icon                     	|
| `icon_selected` 	| string 	| -          	| Icon to be displayed when `url` matches the current browser url 	|

### Example Configuration
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
