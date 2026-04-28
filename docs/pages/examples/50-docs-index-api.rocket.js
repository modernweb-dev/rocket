/** @typedef {import('@rocket/js/types.js').PageTree} PageTree */
/** @typedef {{ title: string; url: string; section: string }} DocsIndexPage */

/** @type {import('@rocket/js/types.js').JsPage} */
export default async (_request, { pageData }) => {
  const pages = pageEntries(pageData.pageTree.children);

  return {
    title: 'Rocket Docs Index',
    source: pageData.url,
    count: pages.length,
    pages,
  };
};

/**
 * @param {PageTree[]} nodes
 * @param {string[]} sectionPath
 * @returns {DocsIndexPage[]}
 */
function pageEntries(nodes, sectionPath = []) {
  /** @type {DocsIndexPage[]} */
  const entries = [];

  for (const node of nodes) {
    const title = node.linkText || node.name;
    const childSectionPath = sectionPath.length ? sectionPath : [title];

    if (node.url && !node.menuNoLink) {
      entries.push({
        title,
        url: node.url,
        section: sectionPath[0] || title,
      });
    }

    entries.push(...pageEntries(node.children, childSectionPath));
  }

  return entries;
}

export const config = {
  path: '/examples/api/docs-index.json',
  metadata: {
    title: 'Docs Index API',
    description: 'Expose a JSON index generated from the Rocket documentation page tree.',
  },
  menu: false,
};
