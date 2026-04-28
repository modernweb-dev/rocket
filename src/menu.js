/** Runs on: imported-md-string */
import { html, nothing } from 'lit';
import { join } from 'lit/directives/join.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * @param {import('@rocket/js/types.js').PageRegistry} pages
 * @returns {import('@rocket/js/types.js').PageTree}
 */
export function treeFromPages(pages) {
  /** @type {import('@rocket/js/types.js').PageTree[]} */
  const children = [];
  /** @type {import('@rocket/js/types.js').PageTree | undefined} */
  let root = undefined;
  for (const [url, page] of pages.entries()) {
    const { file, module, metadata } = page;
    const { title, linkText } = metadata;
    if (url === '/') {
      // we can't exclude the root page, so at least make it no link
      const menuNoLink = module.config.menu === false ? true : module.config.menu?.noLink;
      root = {
        name: '',
        url,
        file,
        module,
        children,
        linkText: linkText || title,
        menuNoLink,
        ...menuIcon(module),
      };
      continue;
    }
    if (module.config.menu === false) {
      continue;
    }
    const parts = getMenuParts(url, module);
    let obj = children;
    /** @type {any} */
    let last = {};
    for (const part of parts) {
      if (part.startsWith(':')) {
        break;
      }
      const get = obj.find(leaf => leaf.name === part);
      if (!get) {
        /** @type {import('@rocket/js/types.js').PageTree[]} */
        const children = [];
        last = {
          name: part,
          url: '',
          file: '',
          module: { config: { path: '' } },
          children,
          linkText: pathPartToTitle(part),
          menuNoLink: true,
        };
        obj.push(last);
        obj = children;
      } else {
        last = get;
        obj = get.children;
      }
    }
    last.url = url;
    last.file = file;
    last.module = module;
    last.linkText = linkText || title;
    last.menuNoLink = module.config.menu?.noLink;
    const iconName = menuIcon(module).iconName;
    if (iconName) {
      last.iconName = iconName;
    } else {
      delete last.iconName;
    }
  }
  if (root) {
    sortRecursive(children);
    return root;
  }
  throw new Error('No root page was found');
}

/**
 * @param {import('@rocket/js/types.js').Module} module
 * @returns {{ iconName?: string }}
 */
function menuIcon(module) {
  const menu = module.config.menu;
  return typeof menu === 'object' && menu?.iconName ? { iconName: menu.iconName } : {};
}

/**
 * @param {string} url
 * @param {import('@rocket/js/types.js').Module} module
 * @returns {string[]}
 */
function getMenuParts(url, module) {
  const parts = url.split('/').filter(Boolean);
  const menu = module.config.menu;
  if (typeof menu !== 'object' || !menu?.parent) {
    return parts;
  }
  const parentParts = menu.parent.split('/').filter(Boolean);
  const leaf = parts.at(-1);
  return leaf ? [...parentParts, leaf] : parentParts;
}

/**
 * @param {string} part
 */
function pathPartToTitle(part) {
  return part
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * @param {import('@rocket/js/types.js').PageTree[]} children
 */
function sortRecursive(children) {
  children.sort((a, b) => {
    if (
      typeof a.module.config?.menu === 'object' &&
      a.module.config.menu?.order &&
      typeof b.module.config?.menu === 'object' &&
      b.module.config.menu?.order
    ) {
      return a.module.config.menu.order - b.module.config.menu.order;
    }
    return (a.linkText || a.name).localeCompare(b.linkText || b.name);
  });
  for (const child of children) {
    sortRecursive(child.children);
  }
}

/**
 * @param {import("@rocket/js/types.js").PageTree} tree
 * @param {string} listTagName
 * @param {(name: string, url: string, module: import("@rocket/js/types.js").Module, linkText: string) => import("lit").TemplateResult} itemFn
 */
export function treeToHtml(tree, listTagName, itemFn) {
  return html`${unsafeHTML(`<${listTagName}>`)}${join(
    tree.children.map(page => {
      let a = itemFn(page.name, page.url, page.module, page.linkText);
      if (page.children.length) {
        a = html`${a}${treeToHtml(page, listTagName, itemFn)}`;
      }
      return a;
    }),
    nothing,
  )}${unsafeHTML(`</${listTagName}>`)}`;
}

/**
 * @param {import('@rocket/js/types.js').PageTree} pageTree
 */
export function defaultHtmlMenu(pageTree) {
  return treeToHtml(
    pageTree,
    'ul',
    (_name, url, _module, linkText) =>
      html`<li>
        <a href=${url}>${linkText}</a>
      </li>`,
  );
}

/** Runs on: import-hook */
/**
 * @param {import('@rocket/js/types.js').Headline[]} headlines
 * @returns {import('@rocket/js/types.js').TableOfContents}
 */
export function headLinesToTree(headlines) {
  /** @type {import('@rocket/js/types.js').HeadlineTree[]} */
  let entries = [];
  const subHeadings = entries;
  let stack = [];
  let root = null;
  let level = 2;
  for (const headline of headlines) {
    if (headline.level === 1) {
      if (root === null) {
        root = headline;
      } else {
        throw new Error('Could not create table of contents, multiple h1 headlines were found');
      }
    } else if (headline.level <= level) {
      while (level > headline.level) {
        level--;
        entries = /** @type {import('@rocket/js/types.js').HeadlineTree[]} */ (stack.pop());
      }
      entries.push({ ...headline, children: [] });
    } else if (headline.level === level + 1 && entries.length) {
      entries[entries.length - 1].children.push({ ...headline, children: [] });
      level++;
      stack.push(entries);
      const last = entries.at(-1);
      if (!last) {
        throw new Error('Could not create table of contents, empty headline found');
      }
      entries = last.children;
    } else {
      throw new Error('Could not create table of contents, jump in headline level is too high');
    }
  }
  return { ...root, children: subHeadings };
}
