import { LayoutOptions, PageTree } from '@rocket/engine';
import { TemplateResult, nothing } from 'lit';

type TemplateValue =
  | TemplateResult
  | ((data: any) => TemplateResult)
  | string
  | ((data: any) => string)
//  | nothing  // allowing nothing here prevents setting data to any for functions?
  | ((data: any) => nothing);

type LayoutValue = TemplateResult | string;

// type number = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';

type TemplateValueKey<Str extends string> = `${Str}__${number}`;

export interface LayoutSidebarOptions extends LayoutOptions {
  [key: TemplateValueKey<'sidebar'>]: TemplateValue;

  siteName: string;
  logoSrc: string;
  logoAlt: string;
  gitSiteUrl: string;
  gitBranch: string;
  description: string;
  socialLinks: {
    alt?: string;
    image?: string;
    name: string;
    url?: string;
  }[];
  footerMenu: {
    name: string;
    children: {
      text: string;
      href: string;
    }[];
  }[];
  titleWrapperFn: (title: string) => string;
  pageTree: PageTree;

  head__10: TemplateValue;
  /**
   * Defines the icons according to
   * https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
   */
  head__20: TemplateValue;
  head__30: TemplateValue;
  head__40: TemplateValue;

  header__10: TemplateValue;
  header__20: TemplateValue;
  header__50: TemplateValue;
  header__60: TemplateValue;

  sidebar__10: TemplateValue;
  sidebar__100: TemplateValue;

  content__600: TemplateValue;
  content__650: TemplateValue;

  footer__100: TemplateValue;

  bottom__50: TemplateValue;
  bottom__60: TemplateValue;
}

export interface LayoutHomeOptions extends LayoutSidebarOptions {
  background: LayoutValue;
  slogan: LayoutValue;
  callToActionItems: { text: LayoutValue; href: string }[];
  reasonHeader: LayoutValue;
  reasons: {
    header: LayoutValue;
    text: LayoutValue;
  }[];
}
