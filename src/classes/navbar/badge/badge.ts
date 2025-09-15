  private _renderBadge(route: RouteItem | PopupItem, isRouteActive: boolean) {
    // Early return if no badge configuration
    if (!route.badge) {
      return html``;
    }

    // Cache template evaluations
    let showBadge = false;
    if (route.badge.show !== undefined) {
      showBadge = processTemplate<boolean>(this._hass, this, route.badge.show);
    } else if (route.badge.template) {
      // TODO deprecate this
      showBadge = processBadgeTemplate(this._hass, route.badge.template);
    }

    if (!showBadge) {
      return html``;
    }

    const count =
      processTemplate<number | null>(this._hass, this, route.badge.count) ??
      null;
    const hasCount = count != null;

    const backgroundColor =
      processTemplate<string>(this._hass, this, route.badge.color) ?? 'red';
    const textColor = processTemplate<string>(
      this._hass,
      this,
      route.badge.textColor,
    );

    // Only create Color object if textColor is not provided, using cached version
    const contrastingColor =
      textColor ?? Color.from(backgroundColor).contrastingColor().hex();

    return html`<div
      class="badge ${isRouteActive ? 'active' : ''} ${hasCount
        ? 'with-counter'
        : ''}"
      style="background-color: ${backgroundColor}; color: ${contrastingColor}">
      ${count}
    </div>`;
  }