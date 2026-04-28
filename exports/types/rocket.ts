/* eslint-disable @typescript-eslint/no-explicit-any */
import { DevServerConfig } from '@web/dev-server';
import { TemplateResult } from 'lit';
import { PageData } from '../PageData.js';

declare global {
  interface CustomElementRegistry {
    __definitions: Map<string, any>;
    __reverseDefinitions: Map<CustomElementConstructor, string>;
  }
}

export type RocketConfig = {
  /**
   * Modifies the default dev server config
   * @param config The default dev server config
   * @returns The modified config
   */
  adjustDevServerConfig?: (config: DevServerConfig) => DevServerConfig;
  /**
   * List of globs to search for pages
   * @default []
   */
  includeGlobs: string[];
  /**
   * List of files to exclude from page search, matches filenames using regex, globs are not supported.
   * node_modules are always excluded.
   * @default []
   */
  excludeRegex?: (string | RegExp)[];
  /**
   * Adapter for deployment targets that need server-rendered pages.
   */
  adapter?: RocketAdapter;
  /**
   * Canonical absolute origin for the deployed site. Required when Site Discoverability emits
   * generated outputs with public absolute URLs or Site Head Metadata is enabled.
   */
  siteOrigin?: string;
  /**
   * Browser and social identity metadata emitted by Rocket-owned document helpers.
   */
  siteHeadMetadata?: SiteHeadMetadataConfig;
  /**
   * Trusted SVG Icon Libraries available to `rocket-icon` during server rendering.
   */
  iconLibraries?: IconLibrariesConfig;
  /**
   * Default Icon Library used when `rocket-icon` omits its `library` attribute.
   */
  defaultIconLibrary?: string;
  /**
   * Crawler-facing generated outputs emitted during `rocket build`.
   */
  siteDiscoverability?: SiteDiscoverabilityConfig;
  /**
   * Public URL preservation and change rules for the site.
   */
  urlLifecycle?: UrlLifecycleConfig;
};

export type PackageIconLibrarySource = {
  type: 'package';
  packageName: string;
  files: string;
};

export type PathIconLibrarySource = {
  type: 'path';
  files: string;
};

export type IconLibrarySource = PackageIconLibrarySource | PathIconLibrarySource;

export type IconLibraryConfig =
  | IconLibrarySource
  | IconLibrarySource[]
  | {
      sources: IconLibrarySource | IconLibrarySource[];
    };

export type IconLibrariesConfig = Record<string, IconLibraryConfig>;

export type NormalizedIconLibraryConfig = {
  sources: IconLibrarySource[];
};

export type IconReferenceConfig = {
  /**
   * Icon Library used to resolve this Icon Reference. Omit to use the active Default Icon Library.
   */
  library?: string;
  /**
   * Icon name inside the resolved Icon Library.
   */
  name: string;
};

export type ResolvedRocketConfig = RocketConfig & {
  adjustDevServerConfig: (config: DevServerConfig) => DevServerConfig;
  excludeRegex: (string | RegExp)[];
};

export type RocketAdapterBuildContext = {
  pages: PageRegistry;
  staticPages: PageRegistry;
  serverPages: PageRegistry;
  outDir: string;
  projectRoot: string;
  config: ResolvedRocketConfig;
  defaultSocialPreviewImages?: Map<string, string>;
};

export type RocketAdapter = {
  name: string;
  build: (context: RocketAdapterBuildContext) => void | Promise<void>;
};

export type SiteDiscoverabilityConfig = {
  /**
   * Emit `sitemap.xml` during `rocket build`.
   *
   * @default false
   */
  sitemap?: boolean;
  /**
   * Emit `robots.txt` during `rocket build`.
   *
   * @default false
   */
  robots?: boolean;
};

export type SiteHeadMetadataConfig = {
  /**
   * Site name used as the home Page title and suffix for non-home Page titles.
   */
  siteName: string;
  /**
   * Fallback Page description when Page Metadata has no `description`.
   */
  defaultDescription: string;
  /**
   * Language tag emitted as the document `html lang` value.
   */
  language: string;
  /**
   * Site Author-provided Favicon Asset references. Rocket emits references only and does not
   * create, transform, or verify these files.
   */
  icons?: SiteHeadMetadataIconsConfig;
  /**
   * Browser theme color emitted as `<meta name="theme-color">`.
   */
  themeColor?: string;
  /**
   * Default Social Preview Image generation for Pages without explicit images.
   */
  socialPreview?: SiteHeadMetadataSocialPreviewConfig;
};

export type SiteHeadMetadata = Omit<SiteHeadMetadataConfig, 'socialPreview'> & {
  /**
   * Formatted document and social title for the current Page.
   */
  title: string;
  /**
   * Page-specific description or the configured fallback description.
   */
  description: string;
  /**
   * Absolute canonical URL for the current concrete Page path.
   */
  canonicalUrl: string;
  /**
   * Page-specific HTML indexing metadata.
   */
  indexing?: SiteHeadMetadataIndexing;
  /**
   * Selected Social Preview Image for the current Page.
   */
  socialPreview?: SiteHeadMetadataSocialPreview;
};

export type SiteHeadMetadataIconsConfig = {
  /**
   * `.ico` Favicon Asset emitted with `rel="icon"` and `sizes="any"`.
   */
  ico?: string;
  /**
   * SVG Favicon Asset emitted with `rel="icon"` and `type="image/svg+xml"`.
   */
  svg?: string;
  /**
   * Apple touch icon asset emitted with `rel="apple-touch-icon"`.
   */
  appleTouchIcon?: string;
};

export type SiteHeadMetadataIndexing = 'index' | 'noindex';

export type SiteHeadMetadataSocialPreviewConfig = {
  /**
   * Generate Default Social Preview Images during static builds.
   *
   * @default 'static'
   */
  delivery?: 'static';
  /**
   * Render function used to create Default Social Preview Image HTML before browser capture.
   */
  template?: SocialPreviewTemplate;
};

export type SocialPreviewTemplate = (data: SocialPreviewTemplateData) => string;

export type SocialPreviewTemplateData = {
  site: {
    name: string;
    defaultDescription: string;
    language: string;
    themeColor?: string;
  };
  page: {
    pathname: string;
    /**
     * Page Metadata title, without the site name suffix Rocket uses for HTML document titles.
     */
    title: string;
    /**
     * Full HTML document title for the Page.
     */
    documentTitle: string;
    description: string;
    canonicalUrl: string;
    language: string;
  };
};

export type SiteHeadMetadataSocialPreview = {
  /**
   * Absolute public image URL emitted for social previews.
   */
  image: string;
};

export type PageSiteHeadMetadataConfig = {
  /**
   * Page-specific HTML robots indexing metadata. `noindex` emits an HTML robots tag; `index`
   * leaves the rendered HTML without a robots tag because indexing is the default.
   */
  indexing?: SiteHeadMetadataIndexing;
  /**
   * Page-specific Social Preview Image configuration.
   */
  socialPreview?: PageSiteHeadMetadataSocialPreviewConfig;
};

export type PageSiteHeadMetadataSocialPreviewConfig = {
  /**
   * Explicit Social Preview Image source. Accepts Page-relative paths, site-root paths, and
   * absolute public `http:`/`https:` URLs.
   */
  image?: string;
};

export type UrlLifecycleConfig = {
  /**
   * Exact-path Redirect rules checked before Page matching.
   */
  redirects?: RedirectConfig[];
};

export type RedirectStatus = 301 | 302 | 307 | 308;

export type RedirectConfig = {
  /**
   * Internal absolute source path. Matched exactly with no trailing-slash normalization.
   */
  source: string;
  /**
   * Internal absolute path or absolute `http:`/`https:` URL sent in the `Location` header.
   */
  target: string;
  /**
   * HTTP redirect status.
   *
   * @default 308
   */
  status?: RedirectStatus;
};

export type PageDiscoverabilityConfig = {
  /**
   * Include this Page in `sitemap.xml` when the Sitemap is globally enabled.
   *
   * @default true
   */
  sitemap?: boolean;
  /**
   * Emit a Page-specific `Disallow` directive in `robots.txt` when the Robots File is globally
   * enabled. This is a crawler directive, not HTML `noindex` metadata.
   *
   * @default 'allow'
   */
  robots?: 'allow' | 'disallow';
};

export type JavaScriptPageResult = Response | string | object | null | undefined;

export type JsPageContext<AdapterContext = unknown> = {
  params: Record<string, string | undefined>;
  pageData: PageData;
  adapterContext: AdapterContext;
};

export type JsPage = (
  req: Request,
  context: JsPageContext,
) => JavaScriptPageResult | Promise<JavaScriptPageResult>;

export type Module = {
  config: PageConfig;
  pagination?: PagePaginationDeclaration;
  components?: Components;
  _$title$?: string;
  _$menuLinkText$?: string;
  _$demoNames$?: string[];
  _$customElementTags$?: string[];
  _$pageLocalCustomElementTags$?: string[];
};

export type Layout<T> = (pageData: PageData, data: T) => string | TemplateResult;

export type PageTree = {
  name: string;
  url: string;
  file: string;
  module: Module;
  linkText: string;
  menuNoLink?: true;
  iconName?: string;
  children: PageTree[];
};

export type PageMetadataCustomValue =
  | string
  | number
  | boolean
  | null
  | PageMetadataCustomValue[]
  | {
      [key: string]: PageMetadataCustomValue;
    };

export type PageMetadataCustom = Record<string, PageMetadataCustomValue>;

export type PageMetadataConfig = {
  title?: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  authors?: string[];
  custom?: PageMetadataCustom;
};

export type PageMetadata = {
  title: string;
  linkText?: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  authors?: string[];
  custom?: PageMetadataCustom;
};

export type Page = {
  file: string;
  module: Module;
  metadata: PageMetadata;
  demoNames?: string[];
};

export type PageRegistry = Map<string, Page>;

export type PageCollectionEntry = {
  path: string;
  url: string;
  metadata: PageMetadata;
  file: string;
  page: Page;
};

export type PagePaginationConfig = {
  pageSize: number;
  collection: PageCollectionEntry[];
};

export type PagePaginationDeclaration =
  | PagePaginationConfig
  | ((pageData: PageData) => PagePaginationConfig);

export type PagePagination = {
  items: PageCollectionEntry[];
  currentPage: number;
  totalPages: number;
  basePath: string;
  nextPath?: string;
  previousPath?: string;
};

export type PageRegistrySortDirection = 'asc' | 'desc';

export type PageRegistryQueryOptions = {
  tags?: string | string[];
  author?: string;
  authors?: string | string[];
  pathPrefix?: string;
  sortBy?: 'date';
  sortDirection?: PageRegistrySortDirection;
};

export type PageRegistryQuery = {
  query: (options?: PageRegistryQueryOptions) => PageCollectionEntry[];
};

type hydrationType =
  | 'onClientLoad'
  | 'onClick'
  | 'onFocus'
  | 'onHover'
  | 'onMedia'
  | 'onVisible'
  | 'onIdle'
  | 'onDelay';

type hydrationStrategy = `hydrate:${hydrationType}${string}`;

type loadingStrategy = hydrationStrategy | 'client' | 'server';

export type Components = Record<
  string,
  {
    file: string;
    className: string;
    loading: loadingStrategy;
  }
>;

export type PageConfig = {
  path: string;
  metadata?: PageMetadataConfig;
  render?: 'static' | 'server';
  discoverability?: PageDiscoverabilityConfig;
  /**
   * Extra Icon References to include in the Page Icon Manifest for browser-created icons.
   */
  iconReferences?: IconReferenceConfig[];
  siteHeadMetadata?: PageSiteHeadMetadataConfig;
  menu?:
    | false
    | {
        order?: number;
        linkText?: string;
        iconName?: string;
        parent?: string;
        noLink?: true;
      };
};

export type Headline = {
  id: string;
  text: string;
  level: number;
};

export type HeadlineTree = Headline & {
  children: HeadlineTree[];
};

export type TableOfContents = Partial<Headline> & {
  children: HeadlineTree[];
};

export type FooterLink = {
  text: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type Feature = {
  icon: string; // can be SVG string
  title: string;
  description: string;
};

export type HeroMainData = {
  logoWithText?: string;
  logoNoText?: string;
  sloganTop?: string;
  sloganBottom?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  documentationLink: string;
  documentationText?: string;
  setupLink: string;
  setupText?: string;
  githubLink?: string;
  githubText?: string;
  installLabel?: string;
  installCommand?: string;
  badges?: HomeBadge[];
};

export type HomeNavLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type HeaderData = {
  logo: string[];
  homeLink: string;
  socials: {
    url: string;
    name: string;
    label?: string;
  }[];
  navLinks: HomeNavLink[];
};

export type HomeBadge = {
  text: string;
  icon: string;
  href?: string;
};

export type HomeCard = {
  icon?: string;
  title: string;
  description: string;
  tags?: string[];
  tone?: string;
};

export type QuickStartData = {
  title: string;
  subtitle?: string;
  command: string | string[];
  description?: string;
};

export type WorkflowStep = {
  icon?: string;
  title: string;
  description?: string;
  tone?: string;
};

export type WorkflowData = {
  title: string;
  steps: WorkflowStep[];
};

export type HeroData = {
  headerData: HeaderData;
  footerData: FooterSection[];
  featuresData?: Feature[];
  heroMainData: HeroMainData;
  whyRocketData?: HomeCard[];
  quickStartData?: QuickStartData;
  workflowData?: WorkflowData;
  secondaryLinksData?: FooterLink[];
};

export type AtlasDocAsideTip = {
  title?: string;
  description: string;
  iconName?: string;
};

export type DocData = {
  headerData: HeaderData;
  footerData: FooterSection[];
  /**
   * Number of automatic `rocket-icon` hosts in the Atlas docs navigation that
   * should be server-rendered before remaining navigation icons are deferred to
   * the browser. Defaults to 35.
   */
  navigationIconServerBudget?: number;
};
