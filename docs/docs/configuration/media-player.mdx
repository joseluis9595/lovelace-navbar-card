---
id: media-player
title: Media player
---

import { AlignedImage } from '@site/src/components';

:::info
This feature is still in **BETA**. Some features might not work as expected
:::

When enabled, this configuration displays a `media_player` widget above the `navbar-card`. Currently, it is shown only in mobile mode. By default, it is shown only when the `media_player` state is `paused` or `playing`, but you can manually configure when it should be displayed using the `show` option.

<AlignedImage imageURL={'/img/configuration/navbar-card_media-player.png'} alt="Media player image" alignment="center" />

| Option                   | Type                                                           | Default                                                  | Description                                                                                    |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `entity`                 | string \| [JSTemplate](../types/js-template)                   | -                                                        | Entity ID of the media_player                                                                  |
| `show`                   | boolean \| [JSTemplate](../types/js-template)                  | `true` when media_player is either `playing` or `paused` | Manually configure when the media player widget should be displayed                            |
| `album_cover_background` | boolean                                                        | `false`                                                  | Enable this option to display the album cover as blurred background of the media player widget |
| `tap_action`             | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant tap action configuration.                                                       |
| `hold_action`            | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant hold action configuration.                                                      |
| `double_tap_action`      | [HA Action](https://www.home-assistant.io/dashboards/actions/) | -                                                        | Home Assistant double_tap action configuration.                                                |

<br/>

---

#### Example

```yaml
type: custom:navbar-card
  ...
media_player:
  show: true
  album_cover_background: true
  entity: |
    [[[
      const state = states['sensor.area_select'].state;
      let entity;

      switch (state) {
        case 'Office':
          entity = 'media_player.office';
          break;
        case 'Kitchen':
          entity = 'media_player.kitchen';
          break;
        case 'Main bedroom':
          entity = 'media_player.main_bedroom';
          break;
        case 'Living room':
          entity = 'media_player.living_room';
          break;
        default:
          // fallback if not in a room with a defined player
          entity = 'media_player.whole_home';
      }

      return entity;
    ]]]
  tap_action:
    action: navigate
    navigation_path: /lovelace/media
  hold_action:
    action: more-info
```
