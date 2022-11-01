import { Asset, ASSET_STATUS } from '../src/assets/Asset.js';
import { AssetManager } from '../src/assets/AssetManager.js';
import { HtmlPage } from '../src/assets/HtmlPage.js';
import { Plugin } from '../src/plugins/Plugin.js';
import { RequestInfo, RequestInit, Response } from 'node-fetch';

type fetchType = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

export interface Reference {
  start: string;
  end: string;
  url: string;
  attribute: string;
  tag: string;
  value: string;
  page: HtmlPage;
}

type AssetStatusKeys = keyof typeof ASSET_STATUS;
export type AssetStatus = typeof ASSET_STATUS[AssetStatusKeys];


export interface ParseElement {
  tagName: string;
  getAttribute(name: string): string | undefined;
}

export interface CheckContext {
  report: (issue) => void;
  item: unknown;
  getAsset: (url: string) => HtmlPage | Asset;
  isLocalUrl: (url: string) => boolean;
}

export interface AddToQueueHelpers {
  isLocalUrl: (url: string) => boolean;
}

export interface FullCheckWebsiteCliOptions {
  inputDir: string;
  originUrl: string;
  assetManager: AssetManager;
  issueManager: IssueManager;
  configFile: string;
  plugins: PluginInterface[];
  isLocalUrl?: (url: string) => boolean;
}

export type CheckWebsiteCliOptions = Partial<FullCheckWebsiteCliOptions>;


export interface PluginInterface extends Plugin {
  /**
   * The actual check logic for a single item.
   */
  async check(context: CheckContext): Promise<void>;
  onParseElement?(element: ParseElement, page: HtmlPage): void;
}

export interface FullAssetManagerOptions {
  originUrl: string;
  originPath: string;
  fetch: fetchType;
  plugins: PluginInterface[];
  isLocalUrl: (url: string) => boolean;
  onParseElementCallbacks: (((element: ParseElement, page: HtmlPage) => void) | undefined)[]
}

export type AssetManagerOptions = Partial<FullAssetManagerOptions>;


// For: assets/Asset.js

export interface FullAssetOptions {
  originUrl: string;
  originPath: string;
  fetch: fetchType;
  isLocalUrl: (url: string) => boolean;
  /**
   * Absolute path to the HTML file on the local filesystem
   */
  localPath: string;
  /**
   * Absolute path to the optional source file that generated the asset file
   */
  localSourcePath: string;
  assetManager: AssetManager | undefined;
}
export type AssetOptions = Partial<FullAssetOptions>;

export interface FullHtmlPageOptions extends FullAssetOptions {
  onParseElementCallbacks: ((element: ParseElement, page: HtmlPage) => void)[];
}
export type HtmlPageOptions = Partial<FullHtmlPageOptions>;



// OLD

export interface Link {
  value: string;
  attribute: string;
  htmlFilePath: string;
  line: number;
  character: number;
}

export interface Usage {
  attribute: string;
  value: string;
  anchor: string;
  file: string;
  line: number;
  character: number;
}

export interface LocalFile {
  filePath: string;
  usage: Usage[];
}

export interface Error {
  filePath: string;
  onlyAnchorMissing: boolean;
  usage: Usage[];
}

export interface Options {
  ignoreLinkPatterns: string[] | null;
  validateExternals: boolean;
  absoluteBaseUrl: string;
}

export interface CheckHtmlLinksCliOptions extends Options {
  inputDir: string;
  assetManager: AssetManager;
  originUrl: string;

  plugins: Plugin[];

  // old
  printOnError: boolean;
  rootDir: string;
  continueOnError: boolean;
  absoluteBaseUrl: string;
}
