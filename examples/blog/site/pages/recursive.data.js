// everything you export here will be automatically injected into all pages

import { LayoutPage } from '../src/layouts/LayoutPage.js';

export { html } from 'lit';

export const layout = new LayoutPage();

export const components = {
  'blog-author': '@example/blog/components/BlogAuthor::BlogAuthor',
  'blog-header': '@example/blog/components/BlogHeader::BlogHeader',
  'blog-post': '@example/blog/components/BlogPost::BlogPost',
  'blog-post-preview': '@example/blog/components/BlogPostPreview::BlogPostPreview',
  'site-footer': '@example/blog/components/SiteFooter::SiteFooter',
};
