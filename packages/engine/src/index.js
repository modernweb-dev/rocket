import '@lit-labs/ssr/lib/install-global-dom-shim.js';
export { html, nothing } from 'lit';
/** @typedef {import('lit').TemplateResult} TemplateResult */

export { renderJoiningGroup } from './helpers/renderJoiningGroup.js';
export { Layout } from './layouts/Layout.js';
export { LayoutRaw } from './layouts/LayoutRaw.js';
export { sourceRelativeFilePathToOutputRelativeFilePath } from './urlPathConverter.js';
export { PageTree } from './web-menu/PageTree.js';
export { AdjustAssetUrls } from './transformers/AdjustAssetUrls.js';

// menus
export { Menu } from './web-menu/menus/Menu.js';
export { ArticleOverviewMenu } from './web-menu/menus/ArticleOverviewMenu.js';
export { BreadcrumbMenu } from './web-menu/menus/BreadcrumbMenu.js';
export { IndexMenu } from './web-menu/menus/IndexMenu.js';
export { NextMenu } from './web-menu/menus/NextMenu.js';
export { PreviousMenu } from './web-menu/menus/PreviousMenu.js';
export { SiteMenu } from './web-menu/menus/SiteMenu.js';
export { TableOfContentsMenu } from './web-menu/menus/TableOfContentsMenu.js';
export { ChildListMenu } from './web-menu/menus/ChildListMenu.js';

/** @typedef {import('../types/layout.js').LayoutOptions} LayoutOptions */
/** @typedef {import('../types/main.js').MetaPluginOfEngine} MetaPluginOfEngine */
