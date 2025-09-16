import { css, CSSResult, html } from 'lit';
import { NavbarCard } from '@/navbar-card';
import { PopupItem } from '@components/navbar';
import {
    DesktopPosition,
    PopupItem as PopupItemDef,
} from '@types';

export class Popup {
    constructor(
        private _navbarCard: NavbarCard,
        private readonly _popupItemData: PopupItemDef[],

        private _popupItems: PopupItem[] = [],
    ) {
        _popupItemData.forEach((_itemData, _index) => {
            _popupItems.push(new PopupItem(this._navbarCard, _itemData, _index));
        });
    }

    get items(): PopupItem[] {
        return this._popupItems;
    }

    public open(target: HTMLElement): void {
        const anchorRect = target.getBoundingClientRect();

        const { style, labelPositionClassName, popupDirectionClassName } =
            this._getPopupStyles(
                anchorRect,
                !this._navbarCard.isDesktop
                    ? 'mobile'
                    : (this._navbarCard.config?.desktop?.position ??
                        DesktopPosition.bottom),
            );

        this._navbarCard.focussedPopup = html`
      <div class="navbar-popup-backdrop"></div>
      <div
        class="
          navbar-popup
          ${popupDirectionClassName}
          ${labelPositionClassName}
          ${this._navbarCard.isDesktop ? 'desktop' : 'mobile'}
          ${this._shouldShowLabelBackground() ? 'popuplabelbackground' : ''}
        "
        style="${style}">
        ${this.items
                .map(popupItem =>
                    popupItem.render(popupDirectionClassName, labelPositionClassName),
                )
                .filter(x => x != null)}
      </div>
    `;

        // Trigger animations after element is rendered
        requestAnimationFrame(() => {
            const popup = this._navbarCard.shadowRoot?.querySelector('.navbar-popup');
            const backdrop = this._navbarCard.shadowRoot?.querySelector('.navbar-popup-backdrop');
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
            const backdrop = this._navbarCard.shadowRoot?.querySelector('.navbar-popup-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                });
            }
        }, 400);
    }

    public close(): void {
        const popup = this._navbarCard.shadowRoot?.querySelector('.navbar-popup');
        const backdrop = this._navbarCard.shadowRoot?.querySelector('.navbar-popup-backdrop');

        if (popup && backdrop) {
            popup.classList.remove('visible');
            backdrop.classList.remove('visible');

            // Wait for transitions to complete before removing
            setTimeout(() => {
                this._navbarCard.focussedPopup = null;
            }, 200);
        } else {
            this._navbarCard.focussedPopup = null;
        }
        // Remove Escape key listener when popup is closed
        window.removeEventListener('keydown', this._onPopupKeyDownListener);
    }

    protected _shouldShowLabelBackground = (): boolean => {
        const enabled = this._navbarCard.isDesktop
            ? this._navbarCard.config?.desktop?.show_popup_label_backgrounds
            : this._navbarCard.config?.mobile?.show_popup_label_backgrounds;
        return !!enabled;
    };

    /**
     * Get the styles for the popup based on its position relative to the anchor element.
     */
    private _getPopupStyles(
        anchorRect: DOMRect,
        position: 'top' | 'left' | 'bottom' | 'right' | 'mobile',
    ): {
        style: CSSResult;
        labelPositionClassName: string;
        popupDirectionClassName: string;
    } {
        const { top, left, x, width, height } = anchorRect;
        const windowWidth = window.innerWidth;

        const positions: Record<typeof position, {style: CSSResult, label: string, dir: string } | null> = {
            top: {
                style: css`top: ${top + height}px; left: ${x}px;`,
                label: 'label-right',
                dir: 'open-bottom',
            },
            left: {
                style: css`top: ${top}px; left: ${x + width}px;`,
                label: 'label-bottom',
                dir: 'open-right',
            },
            right: {
                style: css`top: ${top}px; right: ${windowWidth - x}px;`,
                label: 'label-bottom',
                dir: 'open-left',
            },
            bottom: null,
            mobile: null,
        };

        if (positions[position]) {
            return {
                style: positions[position].style,
                labelPositionClassName: positions[position].label,
                popupDirectionClassName: positions[position].dir,
            };
        }

        // fallback for bottom/mobile
        const isRightSide = x > windowWidth / 2;
        return isRightSide
            ? {
                style: css`top: ${top}px; right: ${windowWidth - x - width}px;`,
                labelPositionClassName: 'label-left',
                popupDirectionClassName: 'open-up',
            }
            : {
                style: css`top: ${top}px; left: ${left}px;`,
                labelPositionClassName: 'label-right',
                popupDirectionClassName: 'open-up',
            };
    }

    private _onPopupKeyDownListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._navbarCard.focussedPopup) {
            e.preventDefault();
            this.close();
        }
    };
}
