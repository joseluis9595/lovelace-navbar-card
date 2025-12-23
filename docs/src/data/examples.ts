export interface Example {
  title: string;
  description: string;
  code: string;
  screenshot: string;
  tags: EXAMPLE_TAG[];
  author?: string;
  authorUrl?: string;
}

export enum  EXAMPLE_TAG {
  BASIC = 'Basic',
  JS_TEMPLATES = 'JS Templates',
  MEDIA_PLAYER = 'Media Player',
  STYLING = 'Styling',
  BADGE = 'Badge',
  MOBILE = 'Mobile',
}

/*************************************/
/* CONFIGURATION EXAMPLES */
/*************************************/

export const examples: Example[] = [
  {
    title: 'Basic Example',
    description:
      'A simple navigation bar with the most common routes and options, and one useful popup menu',
    screenshot: '/img/examples/basic-example.png',
    tags: [EXAMPLE_TAG.BASIC],
    code: `type: custom:navbar-card
layout:
  auto_padding:
    enabled: true
    desktop_px: 100
    mobile_px: 80
    media_player_px: 100
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
    title: 'Display route only for a given user',
    description:
      'Navigation bar with a "settings" route only displayed for the user "jose"',
    screenshot: '/img/examples/display-route-only-for-a-given-user.png',
    tags: [EXAMPLE_TAG.JS_TEMPLATES],
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
    title: 'Manually control when a route is selected',
    description:
      "Navigation bar with a route with no `url` property, so we'll manually choose when it should be selected",
    screenshot: '/img/examples/manually-control-when-a-route-is-selected.png',
    tags: [EXAMPLE_TAG.JS_TEMPLATES],
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
  - icon: mdi:creation
    label: Automations
    tap_action:
      action: navigate
      url: /lovelace/home/control
    selected: |
        [[[ return window.location.pathname == "/lovelace/home/control" ]]]
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
`,
  },
  {
    title: 'Custom Selected Color',
    description:
      'Navigation bar with a custom different selected color for each route',
    screenshot: '/img/examples/route-selected-colors.png',
    tags: [EXAMPLE_TAG.BASIC, EXAMPLE_TAG.STYLING],
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
    selected_color: "#E57373"
    selected: true       # hardcoded to true for demo purposes
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
    selected_color: "#64B5F6"
    selected: true       # hardcoded to true for demo purposes
  - url: /config/automation/dashboard
    icon: mdi:creation
    label: Automations
    selected_color: "#81C784"
    selected: true       # hardcoded to true for demo purposes
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
    selected_color: "#FBC02D"
    selected: true       # hardcoded to true for demo purposes
  - icon: mdi:information
    label: More
    url: /config/info
    selected_color: "#BA68C8"
    selected: true       # hardcoded to true for demo purposes
`,
  },
  {
    title: 'Badge with number of lights on',
    description:
      'Navigation bar with a badge showing the number of lights that are currently on',
    screenshot: '/img/examples/lights-on-badge.png',
    tags: [EXAMPLE_TAG.JS_TEMPLATES, EXAMPLE_TAG.BADGE],
    code: `type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/home/devices
    icon: mdi:devices
    label: Devices
    badge:
      show: >-
        [[[
          // Store the light entities in a variable to avoid recomputing them on each render
          if (!this._lightEntities) {
            this._lightEntities = Object.keys(hass.states).filter(id => id.startsWith('light.'));
          }
          return this._lightEntities.filter(id => hass.states[id].state === 'on').length > 0;
        ]]]
      count: >-
        [[[
          // Store the light entities in a variable to avoid recomputing them on each render
          if (!this._lightEntities) {
            this._lightEntities = Object.keys(hass.states).filter(id => id.startsWith('light.'));
          }
          return this._lightEntities.filter(id => hass.states[id].state === 'on').length;
        ]]]
  - url: /lovelace/home/control
    icon: mdi:creation
    label: Automations
  - url: /config/dashboard
    icon: mdi:cog
    label: Settings
  - icon: mdi:information
    label: More
    url: /config/info
`,
  },
  {
    title: 'Custom Primary Color',
    description: 'Navigation bar with a custom red primary color',
    screenshot: '/img/examples/custom-primary-color.png',
    tags: [EXAMPLE_TAG.BASIC, EXAMPLE_TAG.STYLING],
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
    tags: [EXAMPLE_TAG.BASIC, EXAMPLE_TAG.STYLING],
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
    tags: [ EXAMPLE_TAG.STYLING ],
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
    title: "Route with rounded user's image",
    description:
      'Navigation bar with a "more" route with the current user\'s image rounded',
    screenshot: '/img/examples/route-with-rounded-user-image.png',
    tags: [EXAMPLE_TAG.JS_TEMPLATES, EXAMPLE_TAG.STYLING],
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
    tags: [EXAMPLE_TAG.STYLING],
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
    --navbar-border-radius: 36px;
    backdrop-filter: blur(33px);
    '-webkit-backdrop-filter': blur(33px) !important; !important;
    border: none;
  }
  .button {
    border-radius: 22px;
  }
`,
  },
  {
    title: 'Neumorphic style',
    description: 'Navigation bar with a neumorphic style',
    screenshot: '/img/examples/neumorphic-style.gif',
    tags: [EXAMPLE_TAG.STYLING],
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
styles: |-
  :host {
    --shadow-dark: color-mix(in srgb, var(--primary-text-color) 20%, transparent);
    --shadow-light: color-mix(in srgb, var(--card-background-color) 85%, white 15%);
    --background-color: color-mix(
      in srgb,
      var(--card-background-color) 92%,
      var(--primary-text-color) 8%
    );
  }


  ha-card {
    background: var(--background-color) !important;
    backdrop-filter: blur(16px);
    border: none !important;
    box-shadow: none !important;
  }

  ha-ripple {
    display: none !important;
  }

  .route {
    padding: 5px;
  }

  .button {
    background: var(--background-color);
    border-radius: 12px;
    box-shadow:
      3px 3px 6px var(--shadow-dark),
      -3px -3px 6px var(--shadow-light);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .button:hover,
  .button:active,
  .button.active {
    background: unset;
    box-shadow:
      inset 2px 2px 4px var(--shadow-dark),
      inset -2px -2px 4px var(--shadow-light);
    transform: translateY(1px);
  }
`,
  },
  {
    title: 'Media player desktop',
    description: 'Navigation bar with a media player on desktop placed at the bottom right',
    screenshot: '/img/examples/media-player-desktop.png',
    tags: [ EXAMPLE_TAG.MEDIA_PLAYER],
    code: `type: custom:navbar-card
desktop:
  position: left
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
    label: Control
  - icon: mdi:information
    label: More
    url: /config/info
media_player:
  entity: media_player.test_media_player
  album_cover_background: true
  show: "[[[return true]]]"
  desktop_position: bottom-right`
  },
  {
    title: 'Control when the media player is displayed',
    description: 'Display media player only when it is playing or it\'s been paused for less than 5 minutes using the "show" property',
    screenshot: '/img/examples/media-player-5-mins.png',
    tags: [ EXAMPLE_TAG.MEDIA_PLAYER, EXAMPLE_TAG.JS_TEMPLATES],
    code: `type: custom:navbar-card
desktop:
  position: left
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
    label: Control
  - icon: mdi:information
    label: More
    url: /config/info
media_player:
  entity: media_player.test_media_player
  album_cover_background: true
  show: |-
    [[[
      const mediaPlayerState = states['media_player.test_media_player'];
      const lastChanged = new Date(mediaPlayerState.last_changed);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Display media player if it's playing OR paused in the last 5 minutes
      return (
        mediaPlayerState.state == 'playing' ||
        (mediaPlayerState.state == 'paused' &&
          (now - lastChanged) <= fiveMinutes)
      );
    ]]]
  desktop_position: bottom-right
`
  }
];
