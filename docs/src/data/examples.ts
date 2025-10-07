export interface Example {
  title: string;
  description: string;
  code: string;
  screenshot: string;
  createdBy?: string;
}

export const examples: Example[] = [
  {
    title: 'Basic Example',
    description:
      'A simple navigation bar with the most common routes and options, and one useful popup menu',
    screenshot: '/img/examples/basic-example.png',
    code: `type: custom:navbar-card
layout:
  auto_padding:
    enabled: true
    desktop_px: 100
    mobile_px: 80
desktop:
  position: left
  min_width: 768
  show_labels: true
mobile:
  show_labels: false
routes:
  - icon: mdi:home-outline
    icon_selected: mdi:home-assistant
    url: /lovelace/home
    label: Home
  - icon: mdi:devices
    url: /lovelace/devices
    label: Devices
  - icon: mdi:thermometer
    url: /lovelace/weather
    label: Weather
  - icon: mdi:creation-outline
    icon_selected: mdi:creation
    url: /lovelace/control
    label: Control`,
  },
  {
    title: 'Custom Primary Color',
    description: 'Navigation bar with a custom red primary color',
    screenshot: '/img/examples/custom-primary-color.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
styles: |
  .navbar {
    --navbar-primary-color: red;
  }
`,
  },
  {
    title: 'Custom Background Color',
    description: 'Navigation bar with a black background',
    screenshot: '/img/examples/custom-background-color.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
styles: |
  .navbar-card {
    background-color: black;
  }
`,
  },
  {
    title: 'Desktop specific styles',
    description: 'Navigation bar with no rounded corners only in desktop mode',
    screenshot: '/img/examples/desktop-specific-styles.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
styles: |
  .navbar-card.desktop {
    border-radius: 0px;
  }
`,
  },
  {
    title: 'Display route only for a given user',
    description:
      'Navigation bar with a "settings" route only displayed for the user "jose"',
    screenshot: '/img/examples/display-route-only-for-a-given-user.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
    hidden: |
      [[[ return user.name != "jose"]]]
  - icon: mdi:information
    label: More
    url: /config/info
`,
  },
  {
    title: "Route with rounded user's image",
    description:
      'Navigation bar with a "more" route with the current user\'s image rounded',
    screenshot: '/img/examples/route-with-rounded-user-image.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - image: |
      [[[ 
        return hass.states["person.jose"].attributes.entity_picture
      ]]]
    label: More
    tap_action:
      action: open-popup
    popup:
      - icon: mdi:cog
        url: /config/dashboard
      - icon: mdi:hammer
        url: /developer-tools/yaml
      - icon: mdi:power
        tap_action:
          action: call-service
          service: homeassistant.restart
          service_data: {}
          confirmation:
            text: Are you sure you want to restart Home Assistant?
styles: |
  .image {
    border-radius: 16px !important;
  }
`,
  },
  {
    title: 'iOS glass effect',
    description: 'Navigation bar with a iOS glassmorphism style',
    screenshot: '/img/examples/ios-glassmorphism-style.png',
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
styles: |
  .navbar-card{
    background: rgba(255,255,255,0.5);
    --navbar-border-radius: 32px;
    backdrop-filter: blur(33px);
    '-webkit-backdrop-filter': blur(33px) !important; !important;
    border: none;
  }
`,
  },
];
