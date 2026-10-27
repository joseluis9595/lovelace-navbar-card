---
title: Dashboard tweaks
---

# Dashboard tweaks

## Cards hidden behind the navbar

If you're using Navbar Card, you might notice it could collide with other cards on your dashboard. Navbar Card now includes an [**automatic padding feature**](../configuration/layout.md#auto-padding-options) that handles this for you, eliminating the need for manual CSS adjustments.

This feature is enabled by default, but you can customize it using the `layout.auto_padding` configuration. [More info here](../configuration/layout.md#auto-padding-options)

??? note "Manual padding (legacy)"

    If you prefer to handle padding manually or need more control, you can disable automatic padding and use CSS instead:

    ```yaml
    type: custom:navbar-card
    layout:
      auto_padding:
        enabled: false # Disable automatic padding
    ```

    Then use [card-mod](https://github.com/thomasloven/lovelace-card-mod) with a [custom theme](https://www.home-assistant.io/integrations/frontend/#themes) to add manual padding:

    ```yaml
    your_theme:
      card-mod-theme: your_theme
      card-mod-root-yaml: |
        .: |
          /* Add padding to the left (or other sides, depending on your navbar position) for desktop screens */
          @media (min-width: 768px) {
            :not(.edit-mode) > #view {
              padding-left: 100px !important;
            }
          }

          /* Add bottom padding for mobile screens to prevent cards from overlapping with the navbar */
          @media (max-width: 767px) {
            :not(.edit-mode) > hui-view:after {
              content: "";
              display: block;
              height: 80px;
              width: 100%;
              background-color: transparent; 
            }
          }
    ```

## Hide the native tabs

Another useful styling detail is removing the native `ha-tabs` element on the top of the screen. We want to hide the `ha-tabs` element, but keep the edit, search and assist buttons visible.
To do so, once again, using [card-mod](https://github.com/thomasloven/lovelace-card-mod) with a [custom theme](https://www.home-assistant.io/integrations/frontend/#themes) is quite easy. Pick your Home Assistant version:

=== "2025.10 and newer"

    ```yaml
    your_theme:
      app-header-background-color: transparent
      app-header-text-color: var(--primary-text-color)

      card-mod-theme: your_theme
      card-mod-root-yaml: |
        .: |
          .toolbar > ha-tab-group {
            pointer-events: none;
            opacity: 0;
          }
    ```

=== "2025.1 – 2025.9"

    ```yaml
    your_theme:
      app-header-background-color: transparent
      app-header-text-color: var(--primary-text-color)

      card-mod-theme: your_theme
      card-mod-root-yaml: |
        .: |
          .toolbar > sl-tab-group {
            pointer-events: none;
            opacity: 0;
          }
    ```

=== "Before 2025.1"

    ```yaml
    your_theme:
      app-header-background-color: transparent
      app-header-text-color: var(--primary-text-color)

      card-mod-theme: your_theme
      card-mod-root-yaml: |
        .: |
          ha-tabs {
            pointer-events: none;
            opacity: 0;
          }
    ```
