// Enhances option tables (see the "Tables" section in components.css):
// - labels each cell with its column header, so rows can stack on phones
// - gives each row an anchor, linked from its name: options are named like
//   their config key, after their section below the first table (#icon,
//   #badge-icon, under the #badge-options heading), so the card editor can
//   link to them
// - shows a "Required" default as a pill next to the option name
// document$ fires on every page load, including instant navigation.
document$.subscribe(() => {
  const ids = new Set(
    [...document.querySelectorAll('[id]')].map(element => element.id),
  );

  /** Highlights the linked row (Material's in-page navigation skips :target) */
  const highlight = id => {
    for (const row of document.querySelectorAll('tr.nc-target')) {
      row.classList.remove('nc-target');
    }
    document.getElementById(id)?.classList.add('nc-target');
  };

  /** Id of the heading above a table */
  const sectionOf = table => {
    let element = table.closest('.md-typeset__scrollwrap') ?? table;
    while ((element = element.previousElementSibling)) {
      if (/^H[2-4]$/.test(element.tagName)) return element.id;
    }
    return '';
  };

  let optionTables = 0;
  for (const table of document.querySelectorAll('.md-typeset table:not([class])')) {
    const headers = [...table.querySelectorAll('thead th')].map(th =>
      th.textContent.trim(),
    );
    const defaultColumn = headers.indexOf('Default');
    const prefix =
      headers.includes('Type') && optionTables++ > 0
        ? `${sectionOf(table).replace(/-options$/, '')}-`
        : '';
    for (const row of table.querySelectorAll('tbody tr')) {
      [...row.children].forEach((cell, i) => {
        cell.dataset.label = headers[i] ?? '';
        if (cell.textContent.trim() === '-') cell.dataset.empty = '';
      });

      // A "Required" default becomes a pill next to the option name
      const defaultCell = row.cells[defaultColumn];
      const required = defaultCell?.textContent.trim().match(/^Required\*?$/);
      if (required && !row.querySelector('.nc-required')) {
        const pill = document.createElement('span');
        pill.className = 'nc-required';
        pill.textContent = required[0];
        row.cells[0].append(pill);
        defaultCell.textContent = '-';
        defaultCell.dataset.empty = '';
      }

      // Long names (show_popup_label_backgrounds) may break after _ . or -,
      // never mid-word; <wbr> adds no characters when the name is copied
      const nameCode = row.cells[0]?.querySelector('code');
      if (nameCode && !nameCode.querySelector('wbr')) {
        const parts = nameCode.textContent.split(/(?<=[_.-])/);
        nameCode.replaceChildren(
          ...parts.flatMap((part, i) =>
            i ? [document.createElement('wbr'), part] : [part],
          ),
        );
      }

      // Rows named by a code value (options, variables, classes) get an anchor
      const name = row.cells[0]?.querySelector('code')?.textContent;
      if (!name || row.id) continue;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const id = prefix + slug;
      if (!slug || ids.has(id)) continue;
      ids.add(id);
      row.id = id;
      // The option name itself links to the row
      const code = row.cells[0].querySelector('code');
      const link = document.createElement('a');
      link.className = 'nc-option-link';
      link.href = `#${id}`;
      link.title = 'Link to this option';
      link.addEventListener('click', () => highlight(id));
      code.replaceWith(link);
      link.append(code);
    }
  }

  // The rows only got their ids now, so jump to the one in the URL ourselves,
  // again once images above it have loaded and moved it down
  const jump = () => {
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target?.tagName !== 'TR') return;
    target.scrollIntoView();
    highlight(target.id);
  };
  jump();
  if (document.readyState !== 'complete') {
    addEventListener('load', jump, { once: true });
  }
});
