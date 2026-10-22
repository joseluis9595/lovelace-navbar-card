// Examples gallery: clicking a card (or opening a #slug link) shows that
// example's hidden `.nc-example` block in a panel. The block is moved into the
// panel and back, so Material's copy button keeps working on the same node.
(() => {
  let overlay;
  let current;
  let placeholder;
  let lastFocus;
  // Whether opening the panel added a history entry, so Back closes it
  let pushed = false;

  const panel = () => {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'nc-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="nc-panel" role="dialog" aria-modal="true" tabindex="-1">' +
      '<button class="nc-panel__close" type="button" aria-label="Close">&times;</button>' +
      '<div class="nc-panel__body md-typeset"></div></div>';
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('.nc-panel__close')) close();
    });
    document.body.append(overlay);
    return overlay;
  };

  const open = (id, push = false) => {
    if (!id) return false;
    if (current) close(false);
    // Only pick blocks still on the page, never one already in the panel
    const el = document.querySelector(`.md-content .nc-example#${CSS.escape(id)}`);
    if (!el) return false;
    const o = panel();
    lastFocus = document.activeElement;
    placeholder = document.createComment('nc-example');
    el.replaceWith(placeholder);
    o.querySelector('.nc-panel__body').replaceChildren(el);
    current = el;
    o.hidden = false;
    document.documentElement.classList.add('nc-overlay-open');
    o.querySelector('.nc-panel').focus();
    if (location.hash !== `#${id}`) {
      if (push) history.pushState(null, '', `#${id}`);
      else history.replaceState(null, '', `#${id}`);
      pushed = push;
    }
    return true;
  };

  const close = (updateUrl = true) => {
    if (!current) return;
    // If Material swapped the page meanwhile, it already holds a fresh copy
    if (placeholder?.isConnected) placeholder.replaceWith(current);
    else current.remove();
    current = placeholder = null;
    overlay.hidden = true;
    document.documentElement.classList.remove('nc-overlay-open');
    if (updateUrl) {
      // Leave through the entry we added, so Back doesn't reopen the panel
      if (pushed) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    pushed = false;
    lastFocus?.focus?.({ preventScroll: true });
  };

  document.addEventListener('click', e => {
    const card = e.target.closest('a.nc-card');
    if (card && open(card.hash.slice(1), true)) e.preventDefault();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && current) close();
  });

  // Back/forward: close the panel when its hash goes away, open the new one
  const onHistory = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (current && current.id !== id) {
      pushed = false;
      close(false);
    }
    if (id && !current) open(id);
  };
  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);

  // Material's instant navigation swaps pages without a reload: drop any open
  // panel and honour the new page's hash on every page change.
  const onPage = () => {
    close(false);
    open(decodeURIComponent(location.hash.slice(1)));
  };
  if (window.document$) window.document$.subscribe(onPage);
  else document.addEventListener('DOMContentLoaded', onPage);
})();
