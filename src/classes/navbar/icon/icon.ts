  private _getRouteIcon(route: RouteItem | PopupItem, isActive: boolean) {
    const icon = processTemplate<string>(this._hass, this, route.icon);
    const image = processTemplate<string>(this._hass, this, route.image);
    const iconSelected = processTemplate<string>(
      this._hass,
      this,
      route.icon_selected,
    );
    const imageSelected = processTemplate<string>(
      this._hass,
      this,
      route.image_selected,
    );

    return image
      ? html`<img
          class="image ${isActive ? 'active' : ''}"
          src="${isActive && imageSelected ? imageSelected : image}"
          alt="${route.label || ''}" />`
      : html`<ha-icon
          class="icon ${isActive ? 'active' : ''}"
          icon="${isActive && iconSelected ? iconSelected : icon}"></ha-icon>`;
  }