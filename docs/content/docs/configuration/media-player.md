---
title: Media player
---

When enabled, this configuration displays a media player widget above or alongside the navbar. You can configure one or multiple players. With multiple players, a carousel appears with dot indicators and swipe/drag to switch between them. The widget is shown when any configured player is `playing` or `paused` (or when a custom `show` template evaluates to true).

<figure markdown="span">
    ![Media player above the navbar on a phone](../../img/configuration/navbar-card_media-player.png#only-light){ width="470" }
    ![Media player above the navbar on a phone](../../img/configuration/navbar-card_media-player_dark.png#only-dark){ width="470" }
</figure>

## Options

| Option                   | Type                                                           | Default       | Description                                                                                     |
| ------------------------ | -------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `players`                | array of [players](#player-options)                            | -             | List of media player configurations. Each player has its own `entity` and optional overrides.    |
| `show`                   | boolean \| [JSTemplate](../advanced/js-templates.md)                   | -             | Widget-level visibility. When set, overrides each player's visibility for the whole widget.        |
| `album_cover_background` | boolean                                                        | `false`       | Display the album cover as blurred background for all players                                   |
| `desktop_position`       | string                                                         | `bottom-center` | Position of the media player widget on desktop: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`. On mobile, the widget is always displayed at the bottom of the view. |

## Player options

Each item in `players` supports:

| Option              | Type                                                           | Default                          | Description                                                                                     |
| ------------------- | -------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `entity`            | string \| [JSTemplate](../advanced/js-templates.md)                   | Required                         | Entity ID of the media_player                                                                   |
| `show`              | boolean \| [JSTemplate](../advanced/js-templates.md)                   | `true` when `playing` or `paused`| Per-player visibility. When configured, this player is shown when the template evaluates to true. |
| `icon`              | string \| [JSTemplate](../advanced/js-templates.md)                   | -                                | Icon to display instead of the album cover. Without an icon or a cover, `mdi:music` is shown.   |
| `title`             | string \| [JSTemplate](../advanced/js-templates.md)                   | `media_title` attribute          | Title text displayed in the media player.                                                       |
| `subtitle`          | string \| [JSTemplate](../advanced/js-templates.md)                   | `media_artist` attribute         | Subtitle text displayed in the media player.                                                    |
| `tap_action`        | [HA Action](https://www.home-assistant.io/dashboards/actions/) | `more-info` for entity           | Tap action for this player.                                                                     |
| `hold_action`       | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                | Hold action for this player.                                                                    |
| `double_tap_action` | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                | Double tap action for this player.                                                              |

---

## Examples

### Multiple players (carousel)

```yaml
media_player:
  album_cover_background: true
  players:
    - entity: media_player.spotify
    - entity: media_player.sonos
      icon: mdi:speaker
    - entity: media_player.kitchen
```

<figure markdown="span">
    ![Media player carousel](../../img/configuration/navbar-card_media-player-carousel.png#only-light){ width="470" }
    ![Media player carousel](../../img/configuration/navbar-card_media-player-carousel_dark.png#only-dark){ width="470" }
</figure>

### Desktop position

```yaml
type: custom:navbar-card
desktop:
  position: left
media_player:
  desktop_position: top-right
  players:
    - entity: media_player.living_room
```

<figure markdown="span">
    ![Media player at the top right, with the navbar on the left](../../img/configuration/navbar-card_media-player-position.png#only-light){ width="505" }
    ![Media player at the top right, with the navbar on the left](../../img/configuration/navbar-card_media-player-position_dark.png#only-dark){ width="505" }
</figure>

### Dynamic entity with template

```yaml
media_player:
  album_cover_background: true
  players:
    - entity: |
        [[[
          const state = states['sensor.area_select'].state;
          switch (state) {
            case 'Office': return 'media_player.office';
            case 'Kitchen': return 'media_player.kitchen';
            case 'Main bedroom': return 'media_player.main_bedroom';
            case 'Living room': return 'media_player.living_room';
            default: return 'media_player.whole_home';
          }
        ]]]
      tap_action:
        action: navigate
        navigation_path: /lovelace/media
      hold_action:
        action: more-info
```

### Widget-level show (hide entire widget)

```yaml
media_player:
  players:
    - entity: media_player.test_media_player
  show: "[[[ return !navbar.isDesktop ]]]"  # Only on mobile
  desktop_position: bottom-right
```

### Per-player show (filter which players appear)

```yaml
media_player:
  players:
    - entity: media_player.spotify
      show: "[[[ return states['media_player.spotify'].state == 'playing' ]]]"
    - entity: media_player.sonos
      show: "[[[ return states['media_player.sonos'].state == 'playing' ]]]"
```
