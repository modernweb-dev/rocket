import { LayoutOptions, PageTree, TemplateValue } from '@rocket/engine';

export interface LayoutMainOptions extends LayoutOptions {
  pageTree: PageTree;
  titleWrapperFn: (title: string) => string;
  description: string;
  siteName: string;

  /**
   * defines stylesheets (+ font loading)
   */
  head__100: TemplateValue;

  footer__10: TemplateValue;

  header__50: TemplateValue;
}

export interface LayoutHomeOptions extends LayoutOptions {
  pageTree: PageTree;
  titleWrapperFn: (title: string) => string;
  description: string;
  siteName: string;

  /**
   * defines stylesheets (+ font loading)
   */
  head__100: TemplateValue;

  footer__10: TemplateValue;

  header__50: TemplateValue;
}
