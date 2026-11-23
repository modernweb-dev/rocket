const SLOT = '<!--rocket-css-slot-->';
const MARKED_LINK = '<link data-rocket-css';
const STYLESHEET_LINK = /<link\b[^>]*\brel=["']?stylesheet\b[^>]*>/gi;

/**
 * Keeps the source order of stylesheets in a static build.
 *
 * Vite removes the stylesheet links it bundles and injects the bundled CSS at the end of the
 * head, while links it can't resolve at build time (Public Assets, external URLs) stay where they
 * were. A site theme from `public/` that the source loads after the Atlas Layout CSS would then
 * load before it and lose the cascade. These plugins put the bundled CSS back where the first
 * bundled stylesheet was.
 *
 * The 'pre' plugin marks every source stylesheet and its position; the 'post' plugin runs after
 * Vite injected the bundled CSS and moves it into the position of the first link Vite removed.
 *
 * @returns {import('vite').Plugin[]}
 */
export function stylesheetOrderPlugins() {
  return [
    {
      name: 'rocket:stylesheet-order-mark',
      transformIndexHtml: {
        order: 'pre',
        handler: html => transformHead(html, markStylesheets),
      },
    },
    {
      name: 'rocket:stylesheet-order-restore',
      transformIndexHtml: {
        order: 'post',
        handler: html => transformHead(html, restoreStylesheetOrder),
      },
    },
  ];
}

/**
 * @param {string} head
 */
export function markStylesheets(head) {
  return head.replace(
    STYLESHEET_LINK,
    link => `${SLOT}${MARKED_LINK}${link.slice('<link'.length)}`,
  );
}

/**
 * @param {string} head
 */
export function restoreStylesheetOrder(head) {
  /** @type {string[]} */
  const bundledLinks = [];
  const withoutBundled = head.replace(STYLESHEET_LINK, link => {
    if (link.startsWith(MARKED_LINK)) {
      return link;
    }
    bundledLinks.push(link);
    return '';
  });

  const bundledSlot = findBundledSlot(withoutBundled);
  if (!bundledLinks.length || bundledSlot === -1) {
    return unmark(head);
  }
  return unmark(
    withoutBundled.slice(0, bundledSlot) +
      bundledLinks.join('') +
      withoutBundled.slice(bundledSlot + SLOT.length),
  );
}

/**
 * The first slot whose stylesheet link Vite removed marks where the bundled CSS belongs.
 *
 * @param {string} head
 */
function findBundledSlot(head) {
  let index = head.indexOf(SLOT);
  while (index !== -1) {
    if (!head.startsWith(MARKED_LINK, index + SLOT.length)) {
      return index;
    }
    index = head.indexOf(SLOT, index + SLOT.length);
  }
  return -1;
}

/**
 * @param {string} head
 */
function unmark(head) {
  return head.replaceAll(SLOT, '').replaceAll(MARKED_LINK, '<link');
}

/**
 * @param {string} html
 * @param {(head: string) => string} transform
 */
function transformHead(html, transform) {
  const headEnd = html.search(/<\/head\s*>/i);
  if (headEnd === -1) {
    return html;
  }
  return transform(html.slice(0, headEnd)) + html.slice(headEnd);
}
