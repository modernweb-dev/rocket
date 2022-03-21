// everything you export here will be automatically injected into all pages

import { LayoutPage } from '../src/layouts/LayoutPage.js';

export { html } from 'lit';

export const layout = new LayoutPage();

export const components = {
  'blog-author': () => import('../src/components/BlogAuthor.js').then(m => m.BlogAuthor),
  'blog-header': () => import('../src/components/BlogHeader.js').then(m => m.BlogHeader),
  'blog-post': () => import('../src/components/BlogPost.js').then(m => m.BlogPost),
  'blog-post-preview': () =>
    import('../src/components/BlogPostPreview.js').then(m => m.BlogPostPreview),
  'site-footer': () => import('../src/components/SiteFooter.js').then(m => m.SiteFooter),
};
