import { html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { PopupItem } from '@/config';

export class Popup {
  constructor(
    private _navbarCard: NavbarCard,
    private readonly _popupItems: PopupItem[],

    // Cache for computed properties
    private _cachedPopupItems?: PopupItem[] = [],
  ) {
    _popupItems.forEach(item => {
      _cachedPopupItems.push(new popupItem(this._navbarCard._hass, this._navbarCard, item));
    });
  }

  private _shouldShowLabelBackground = (): boolean => {
    const enabled = this.isDesktop
      ? this._config?.desktop?.show_popup_label_backgrounds
      : this._config?.mobile?.show_popup_label_backgrounds;
    return !!enabled;
  };

  public open(): void {
    if (this._cachedPopupItems.length === 0) {
      console.warn('[navbar-card] No popup items to display.');
      return;
    }

    const anchorRect = target.getBoundingClientRect();

    const { style, labelPositionClassName, popupDirectionClassName } =
      this._getPopupStyles(
        anchorRect,
        !this.isDesktop
          ? 'mobile'
          : (this._config?.desktop?.position ?? DEFAULT_DESKTOP_POSITION),
      );

    this._popup = html`
      <div class="navbar-popup-backdrop"></div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this.isDesktop ? 'desktop' : 'mobile'}
          ${this._shouldShowLabelBackground() ? 'popuplabelbackground' : ''}
        "
        style="${style}">
        ${this._cachedPopupItems
          .map((popupItem) => popupItem.render())
          .filter(x => x != null)}
      </div>
    `;

    // Trigger animations after element is rendered
    requestAnimationFrame(() => {
      const popup = this.shadowRoot?.querySelector('.navbar-popup');
      const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');
      if (popup && backdrop) {
        popup.classList.add('visible');
        backdrop.classList.add('visible');
      }
    });
    // Add Escape key listener when popup is opened
    window.addEventListener('keydown', this._onPopupKeyDownListener);

    // Add click listener to backdrop after a short delay, to prevent a recurring issue
    // where the popup is closed right after being opened. This happens because the click
    // event that opens the popup, bubbles up the DOM up to this backdrop, even with
    // preventDefault or stopPropagation :(
    setTimeout(() => {
      const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          this._closePopup();
        });
      }
    }, 400);
  }

  public close(): void {
    const popup = this.shadowRoot?.querySelector('.navbar-popup');
    const backdrop = this.shadowRoot?.querySelector('.navbar-popup-backdrop');

    if (popup && backdrop) {
      popup.classList.remove('visible');
      backdrop.classList.remove('visible');

      // Wait for transitions to complete before removing
      setTimeout(() => {
        this._popup = null;
      }, 200);
    } else {
      this._popup = null;
    }
    // Remove Escape key listener when popup is closed
    window.removeEventListener('keydown', this._onPopupKeyDownListener);
  }
}
