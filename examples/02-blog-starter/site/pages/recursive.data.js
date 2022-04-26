// everything you export here will be automatically injected into all pages

import { LayoutPage } from '../src/layouts/LayoutPage.js';

export { html } from 'lit';

export const layout = new LayoutPage();

export const components = {
  'blog-author': 'rocket-blog-starter/components/BlogAuthor::BlogAuthor',
  'blog-header': 'rocket-blog-starter/components/BlogHeader::BlogHeader',
  'blog-post': 'rocket-blog-starter/components/BlogPost::BlogPost',
  'blog-post-preview': 'rocket-blog-starter/components/BlogPostPreview::BlogPostPreview',
  'site-footer': 'rocket-blog-starter/components/SiteFooter::SiteFooter',
};
