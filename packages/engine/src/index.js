// we load this before the global-dom-shim as otherwise prism thinks it's running in a browser 🙈
// we need to load the global-dom-shim as otherwise import { html } from 'lit'; breaks
import 'rehype-prism';
import '@lit-labs/ssr/lib/install-global-dom-shim.js';

export { renderJoiningGroup } from './helpers/renderJoiningGroup.js';
export { inlineFile } from './helpers/inlineFile.js';

export { gatherFiles } from './gatherFiles.js';

export { Layout } from './layouts/Layout.js';
export { LayoutRaw } from './layouts/LayoutRaw.js';
export { LayoutSitemap } from './layouts/LayoutSitemap.js';
export { sourceRelativeFilePathToOutputRelativeFilePath } from './file-header/urlPathConverter.js';
export { PageTree } from './web-menu/PageTree.js';
export { AdjustAssetUrls } from './transformers/AdjustAssetUrls.js';

export {
  urlToSourceFilePath,
  sourceRelativeFilePathToUrl,
} from './file-header/urlPathConverter.js';

// dev-server
export { devServerRegisterTab } from './dev-server/devServerRegisterTab.js';
export { devServerAdjustAssetUrls } from './dev-server/devServerAdjustAssetUrls.js';

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
/** @typedef {import('../types/layout.js').TemplateValue} TemplateValue */
/** @typedef {import('../types/layout.js').LayoutValue} LayoutValue */
/** @typedef {import('../types/main.js').MetaPluginOfEngine} MetaPluginOfEngine */
/** @typedef {import('../types/menu.js').NodeOfPage} NodeOfPage */
