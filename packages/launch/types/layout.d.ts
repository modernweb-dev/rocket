import { LayoutOptions, PageTree, TemplateValue, LayoutValue } from '@rocket/engine';

type TemplateValueKey<Str extends string> = `${Str}__${number}`;

export interface LayoutSidebarOptions extends LayoutOptions {
  [key: TemplateValueKey<'sidebar'>]: TemplateValue;
  [key: TemplateValueKey<'drawer'>]: TemplateValue;

  siteName: string;
  themeColor: string;
  logoSmall: TemplateValue;
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
      text: LayoutValue;
      href: string;
    }[];
  }[];
  titleWrapperFn: (title: string) => string;
  pageTree: PageTree;

  headerHideLogo: boolean;
  headerNoBackground: boolean;
  headerNotSticky: boolean;
  headerDarkBackground: boolean;

  /**
   * Sets primary html metadata like
   * - charset
   * - viewport
   * - title
   * - ...
   */
  head__10: TemplateValue;
  /**
   * Defines the icons/favicon according to
   * https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
   */
  head__20: TemplateValue;
  /**
   * Social media meta tags
   */
  head__30: TemplateValue;
  /**
   * defines stylesheets (+ font loading)
   */
  head__40: TemplateValue;

  /**
   * linked logo
   */
  header__10: TemplateValue;
  /**
   * burger menu button for mobile drawer
   */
  header__20: TemplateValue;
  /**
   * site navigation
   */
  header__50: TemplateValue;
  /**
   * social media links
   */
  header__60: TemplateValue;

  /**
   * linked logo in the mobile drawer
   */
  sidebar__10: TemplateValue;

  /**
   * index menu (main navigation) on the left
   */
  sidebar__100: TemplateValue;

  /**
   * previous /  next navigation after main content
   */
  content__600: TemplateValue;
  /**
   * edit on github link
   */
  content__650: TemplateValue;

  /**
   * footer navigation
   */
  footer__100: TemplateValue;

  /**
   * load drawer and init burger menu
   */
  bottom__50: TemplateValue;
  /**
   * register service worker only during production build
   */
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
