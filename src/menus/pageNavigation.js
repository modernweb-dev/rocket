import { css, html, nothing } from 'lit';

/**
 * @typedef {{
 *   url: string;
 *   linkText: string;
 *   sectionLabel?: string;
 * }} PageNavigationNode
 */

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 * @param {string} currentPath
 * @returns {{ previous: PageNavigationNode | null; next: PageNavigationNode | null }}
 */
export function pageNavigationLinks(pageTree, currentPath) {
  return {
    previous: previousPageNode(pageTree, currentPath),
    next: nextPageNode(pageTree, currentPath),
  };
}

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 * @param {string} currentPath
 * @returns {PageNavigationNode | null}
 */
export function previousPageNode(pageTree, currentPath) {
  return findAdjacentPageNode(pageTree, currentPath, -1);
}

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 * @param {string} currentPath
 * @returns {PageNavigationNode | null}
 */
export function nextPageNode(pageTree, currentPath) {
  return findAdjacentPageNode(pageTree, currentPath, 1);
}

/**
 * @param {PageNavigationNode | null} page
 * @param {'previous' | 'next'} direction
 */
export function renderPageNavigationCard(page, direction) {
  if (!page) {
    return nothing;
  }

  const isNext = direction === 'next';
  const label = isNext ? 'Next Page' : 'Previous Page';
  const icon = html`<span class="page-card-icon" aria-hidden="true">
    ${isNext
      ? html`<svg class="page-card-arrow" viewBox="0 0 36 16" focusable="false" aria-hidden="true">
          <path d="M5 8h25m-7-6 7 6-7 6" />
        </svg>`
      : html`<svg class="page-card-arrow" viewBox="0 0 36 16" focusable="false" aria-hidden="true">
          <path d="M31 8H6m7-6-7 6 7 6" />
        </svg>`}
  </span>`;
  const text = html`<span class="page-card-text">
    <span class="page-card-label">${label}</span>
    <strong class="page-card-title">${page.linkText}</strong>
    ${page.sectionLabel
      ? html`<span class="page-card-section">${page.sectionLabel}</span>`
      : nothing}
  </span>`;

  return html`<a
    class="page-card ${direction}"
    href=${page.url}
    aria-label=${`${label}: ${page.linkText}`}
  >
    ${isNext ? html`${text}${icon}` : html`${icon}${text}`}
  </a>`;
}

export const pageNavigationStyles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
    color: var(--docs-text-color, #111827);
    --rocket-page-nav-border-color: var(--docs-line-color, #dbe3ec);
    --rocket-page-nav-hover-border-color: hsl(358 88% 47% / 24%);
    --rocket-page-nav-next-hover-border-color: hsl(358 88% 47% / 34%);
    --rocket-page-nav-icon-background: var(--docs-surface-soft-color, #f8fafc);
    --rocket-page-nav-icon-color: var(--docs-muted-color, #64748b);
    --rocket-page-nav-icon-hover-color: var(--primary-color, #e10d14);
  }

  * {
    box-sizing: border-box;
  }

  .page-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 6.25rem;
    height: 100%;
    padding: 1rem 1.15rem;
    border: 1px solid var(--rocket-page-nav-border-color);
    border-radius: 8px;
    color: inherit;
    background: var(--docs-surface-color, #ffffff);
    box-shadow:
      0 1px 1px hsl(var(--shadow-color-dark, 217 32% 17%) / 4%),
      0 14px 30px -28px hsl(var(--shadow-color-dark, 217 32% 17%) / 38%);
    text-decoration: none;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;
  }

  .page-card:hover {
    border-color: var(--rocket-page-nav-hover-border-color);
    background: #ffffff;
    box-shadow:
      0 6px 14px -12px hsl(var(--shadow-color-dark, 217 32% 17%) / 28%),
      0 24px 42px -30px hsl(var(--shadow-color-dark, 217 32% 17%) / 46%);
    transform: translateY(-2px);
  }

  .page-card:hover .page-card-icon {
    color: var(--rocket-page-nav-icon-hover-color);
    border-color: hsl(358 88% 47% / 12%);
    background: var(--docs-surface-red-color);
  }

  .page-card.next:hover {
    border-color: var(--rocket-page-nav-next-hover-border-color);
  }

  .page-card:focus-visible {
    border-color: var(--rocket-page-nav-next-hover-border-color);
    outline: 3px solid hsl(358 88% 47% / 18%);
    outline-offset: 3px;
  }

  .page-card-icon {
    display: grid;
    place-items: center;
    flex: 0 0 3.5rem;
    width: 3.5rem;
    height: 2.75rem;
    border: 1px solid hsl(358 88% 47% / 7%);
    border-radius: 999px;
    color: var(--rocket-page-nav-icon-color);
    background: var(--rocket-page-nav-icon-background);
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      color 0.18s ease;
  }

  .page-card-arrow {
    width: 2.05rem;
    height: 1rem;
    overflow: visible;
  }

  .page-card-arrow path {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.75;
  }

  .page-card-text {
    display: grid;
    flex: 1 1 auto;
    min-width: 0;
    gap: 0.22rem;
  }

  .page-card.next {
    text-align: right;
  }

  .page-card.next .page-card-text {
    justify-items: end;
  }

  .page-card-label,
  .page-card-section {
    color: var(--docs-muted-color, #64748b);
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .page-card-label {
    font-weight: 650;
  }

  .page-card-title {
    color: var(--docs-text-dark-color, #0b1220);
    font-size: 1rem;
    font-weight: 750;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  @media (prefers-reduced-motion: reduce) {
    .page-card {
      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease,
        background-color 0.18s ease;
    }

    .page-card:hover {
      transform: none;
    }
  }
`;

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 * @param {string} currentPath
 * @param {-1 | 1} direction
 * @returns {PageNavigationNode | null}
 */
function findAdjacentPageNode(pageTree, currentPath, direction) {
  const nodes = flattenPageTree(pageTree);
  const currentIndex = nodes.findIndex(node => node.url === currentPath);

  if (currentIndex === -1) {
    return null;
  }

  for (
    let index = currentIndex + direction;
    index >= 0 && index < nodes.length;
    index += direction
  ) {
    const node = nodes[index];
    if (!node.menuNoLink) {
      return {
        url: node.url,
        linkText: node.linkText,
        ...(node.sectionLabel ? { sectionLabel: node.sectionLabel } : {}),
      };
    }
  }

  return null;
}

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 * @returns {Array<PageNavigationNode & { menuNoLink?: true }>}
 */
function flattenPageTree(pageTree) {
  /** @type {Array<PageNavigationNode & { menuNoLink?: true }>} */
  const nodes = [];
  addPageTreeNodes(pageTree, 0, undefined, nodes);
  return nodes;
}

/**
 * @param {import('@rocket/js/types.js').PageTree} node
 * @param {number} depth
 * @param {string | undefined} sectionLabel
 * @param {Array<PageNavigationNode & { menuNoLink?: true }>} nodes
 */
function addPageTreeNodes(node, depth, sectionLabel, nodes) {
  const nodeSectionLabel =
    depth > 1 && sectionLabel && sectionLabel !== node.linkText ? sectionLabel : undefined;

  nodes.push({
    url: node.url,
    linkText: node.linkText,
    ...(nodeSectionLabel ? { sectionLabel: nodeSectionLabel } : {}),
    ...(node.menuNoLink ? { menuNoLink: node.menuNoLink } : {}),
  });

  const childSectionLabel = depth === 0 ? undefined : sectionLabel || node.linkText;
  for (const child of node.children) {
    addPageTreeNodes(child, depth + 1, childSectionLabel, nodes);
  }
}
