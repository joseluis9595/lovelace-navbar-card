---
title: Examples
hide:
  - navigation
---

# Examples

Click any example to preview it and copy its YAML configuration.

## Basics, routes & badges

<div class="nc-gallery" markdown>

[![Basic Example](../img/examples/basic-example.png#only-light){ loading=lazy }![Basic Example](../img/examples/basic-example_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Basic Example</span><span class="nc-card__desc">A simple navigation bar with the most common routes and options, and one useful popup menu</span>](#basic-example){ .nc-card }

[![Display route only for a given user](../img/examples/display-route-only-for-a-given-user.png#only-light){ loading=lazy }![Display route only for a given user](../img/examples/display-route-only-for-a-given-user_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Display route only for a given user</span><span class="nc-card__desc">Navigation bar with a "settings" route only displayed for the user "jose"</span>](#display-route-only-for-a-given-user){ .nc-card }

[![Manually control when a route is selected](../img/examples/manually-control-when-a-route-is-selected.png#only-light){ loading=lazy }![Manually control when a route is selected](../img/examples/manually-control-when-a-route-is-selected_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Manually control when a route is selected</span><span class="nc-card__desc">Navigation bar with a route with no `url` property, so we'll manually choose when it should be selected</span>](#manually-control-when-a-route-is-selected){ .nc-card }

[![Route with rounded user's image](../img/examples/route-with-rounded-user-image.png#only-light){ loading=lazy }![Route with rounded user's image](../img/examples/route-with-rounded-user-image_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Route with rounded user's image</span><span class="nc-card__desc">Navigation bar with a "more" route with the current user's image rounded</span>](#route-with-rounded-users-image){ .nc-card }

[![Badge with number of lights on](../img/examples/lights-on-badge.png#only-light){ loading=lazy }![Badge with number of lights on](../img/examples/lights-on-badge_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Badge with number of lights on</span><span class="nc-card__desc">Navigation bar with a badge showing the number of lights that are currently on</span>](#badge-with-number-of-lights-on){ .nc-card }

</div>

## Styling

<div class="nc-gallery" markdown>

[![Custom Primary Color](../img/examples/custom-primary-color.png#only-light){ loading=lazy }![Custom Primary Color](../img/examples/custom-primary-color_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Custom Primary Color</span><span class="nc-card__desc">Navigation bar with a custom red primary color</span>](#custom-primary-color){ .nc-card }

[![Custom Background Color](../img/examples/custom-background-color.png#only-light){ loading=lazy }![Custom Background Color](../img/examples/custom-background-color_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Custom Background Color</span><span class="nc-card__desc">Navigation bar with a black background</span>](#custom-background-color){ .nc-card }

[![Custom Selected Color](../img/examples/route-selected-colors.png#only-light){ loading=lazy }![Custom Selected Color](../img/examples/route-selected-colors_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Custom Selected Color</span><span class="nc-card__desc">Navigation bar with a custom different selected color for each route</span>](#custom-selected-color){ .nc-card }

[![Desktop specific styles](../img/examples/desktop-specific-styles.png#only-light){ loading=lazy }![Desktop specific styles](../img/examples/desktop-specific-styles_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Desktop specific styles</span><span class="nc-card__desc">Navigation bar with no rounded corners only in desktop mode</span>](#desktop-specific-styles){ .nc-card }

[![iOS glass effect](../img/examples/ios-glassmorphism-style.png#only-light){ loading=lazy }![iOS glass effect](../img/examples/ios-glassmorphism-style_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">iOS glass effect</span><span class="nc-card__desc">Navigation bar with a iOS glassmorphism style</span>](#ios-glass-effect){ .nc-card }

[![Neumorphic style](../img/examples/neumorphic-style.gif){ loading=lazy }<span class="nc-card__title">Neumorphic style</span><span class="nc-card__desc">Navigation bar with a neumorphic style</span>](#neumorphic-style){ .nc-card }

[![Label on the selected route](../img/examples/label-on-selected-route.png#only-light){ loading=lazy }![Label on the selected route](../img/examples/label-on-selected-route_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Label on the selected route</span><span class="nc-card__desc">Icon-only routes on mobile, with the label shown next to the selected icon</span>](#label-on-selected-route){ .nc-card }

</div>

## Media player

<div class="nc-gallery" markdown>

[![Media player displayed only on desktop](../img/examples/media-player-desktop.png#only-light){ loading=lazy }![Media player displayed only on desktop](../img/examples/media-player-desktop_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Media player displayed only on desktop</span><span class="nc-card__desc">Navigation bar with a media player displayed only on desktop, placed at the bottom right</span>](#media-player-displayed-only-on-desktop){ .nc-card }

[![Control when the media player is displayed](../img/examples/media-player-5-mins.png#only-light){ loading=lazy }![Control when the media player is displayed](../img/examples/media-player-5-mins_dark.png#only-dark){ loading=lazy }<span class="nc-card__title">Control when the media player is displayed</span><span class="nc-card__desc">Display media player only when it is playing or it's been paused for less than 5 minutes using the "show" property</span>](#control-when-the-media-player-is-displayed){ .nc-card }

</div>

<!-- Example details: hidden, opened in a panel by javascripts/examples.js -->

<div class="nc-example" id="basic-example" markdown>
<p class="nc-example__title">Basic Example</p>

A simple navigation bar with the most common routes and options, and one useful popup menu

![Basic Example](../img/examples/basic-example.png#only-light){ loading=lazy .nc-example__image }
![Basic Example](../img/examples/basic-example_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/basic-example.yaml"
```

</div>

<div class="nc-example" id="display-route-only-for-a-given-user" markdown>
<p class="nc-example__title">Display route only for a given user</p>

Navigation bar with a "settings" route only displayed for the user "jose"

![Display route only for a given user](../img/examples/display-route-only-for-a-given-user.png#only-light){ loading=lazy .nc-example__image }
![Display route only for a given user](../img/examples/display-route-only-for-a-given-user_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/display-route-only-for-a-given-user.yaml"
```

</div>

<div class="nc-example" id="manually-control-when-a-route-is-selected" markdown>
<p class="nc-example__title">Manually control when a route is selected</p>

Navigation bar with a route with no `url` property, so we'll manually choose when it should be selected

![Manually control when a route is selected](../img/examples/manually-control-when-a-route-is-selected.png#only-light){ loading=lazy .nc-example__image }
![Manually control when a route is selected](../img/examples/manually-control-when-a-route-is-selected_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/manually-control-when-a-route-is-selected.yaml"
```

</div>

<div class="nc-example" id="route-with-rounded-users-image" markdown>
<p class="nc-example__title">Route with rounded user's image</p>

Navigation bar with a "more" route with the current user's image rounded

![Route with rounded user's image](../img/examples/route-with-rounded-user-image.png#only-light){ loading=lazy .nc-example__image }
![Route with rounded user's image](../img/examples/route-with-rounded-user-image_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/route-with-rounded-users-image.yaml"
```

</div>

<div class="nc-example" id="badge-with-number-of-lights-on" markdown>
<p class="nc-example__title">Badge with number of lights on</p>

Navigation bar with a badge showing the number of lights that are currently on

![Badge with number of lights on](../img/examples/lights-on-badge.png#only-light){ loading=lazy .nc-example__image }
![Badge with number of lights on](../img/examples/lights-on-badge_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/badge-with-number-of-lights-on.yaml"
```

</div>

<div class="nc-example" id="custom-primary-color" markdown>
<p class="nc-example__title">Custom Primary Color</p>

Navigation bar with a custom red primary color

![Custom Primary Color](../img/examples/custom-primary-color.png#only-light){ loading=lazy .nc-example__image }
![Custom Primary Color](../img/examples/custom-primary-color_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/custom-primary-color.yaml"
```

</div>

<div class="nc-example" id="custom-background-color" markdown>
<p class="nc-example__title">Custom Background Color</p>

Navigation bar with a black background

![Custom Background Color](../img/examples/custom-background-color.png#only-light){ loading=lazy .nc-example__image }
![Custom Background Color](../img/examples/custom-background-color_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/custom-background-color.yaml"
```

</div>

<div class="nc-example" id="custom-selected-color" markdown>
<p class="nc-example__title">Custom Selected Color</p>

Navigation bar with a custom different selected color for each route

![Custom Selected Color](../img/examples/route-selected-colors.png#only-light){ loading=lazy .nc-example__image }
![Custom Selected Color](../img/examples/route-selected-colors_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/custom-selected-color.yaml"
```

</div>

<div class="nc-example" id="desktop-specific-styles" markdown>
<p class="nc-example__title">Desktop specific styles</p>

Navigation bar with no rounded corners only in desktop mode

![Desktop specific styles](../img/examples/desktop-specific-styles.png#only-light){ loading=lazy .nc-example__image }
![Desktop specific styles](../img/examples/desktop-specific-styles_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/desktop-specific-styles.yaml"
```

</div>

<div class="nc-example" id="ios-glass-effect" markdown>
<p class="nc-example__title">iOS glass effect</p>

Navigation bar with a iOS glassmorphism style

![iOS glass effect](../img/examples/ios-glassmorphism-style.png#only-light){ loading=lazy .nc-example__image }
![iOS glass effect](../img/examples/ios-glassmorphism-style_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/ios-glass-effect.yaml"
```

</div>

<div class="nc-example" id="neumorphic-style" markdown>
<p class="nc-example__title">Neumorphic style</p>

Navigation bar with a neumorphic style

![Neumorphic style](../img/examples/neumorphic-style.gif){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/neumorphic-style.yaml"
```

</div>

<div class="nc-example" id="label-on-selected-route" markdown>
<p class="nc-example__title">Label on the selected route</p>

Icon-only routes on mobile, with the label shown next to the selected icon

![Label on the selected route](../img/examples/label-on-selected-route.png#only-light){ loading=lazy .nc-example__image }
![Label on the selected route](../img/examples/label-on-selected-route_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/label-on-selected-route.yaml"
```

</div>

<div class="nc-example" id="media-player-displayed-only-on-desktop" markdown>
<p class="nc-example__title">Media player displayed only on desktop</p>

Navigation bar with a media player displayed only on desktop, placed at the bottom right

![Media player displayed only on desktop](../img/examples/media-player-desktop.png#only-light){ loading=lazy .nc-example__image }
![Media player displayed only on desktop](../img/examples/media-player-desktop_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/media-player-displayed-only-on-desktop.yaml"
```

</div>

<div class="nc-example" id="control-when-the-media-player-is-displayed" markdown>
<p class="nc-example__title">Control when the media player is displayed</p>

Display media player only when it is playing or it's been paused for less than 5 minutes using the "show" property

![Control when the media player is displayed](../img/examples/media-player-5-mins.png#only-light){ loading=lazy .nc-example__image }
![Control when the media player is displayed](../img/examples/media-player-5-mins_dark.png#only-dark){ loading=lazy .nc-example__image }

```yaml
--8<-- "examples/control-when-the-media-player-is-displayed.yaml"
```

</div>
