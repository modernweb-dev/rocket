import { Asset, ASSET_STATUS } from '../src/assets/Asset.js';
import { AssetManager } from '../src/assets/AssetManager.js';
import { HtmlPage } from '../src/assets/HtmlPage.js';
import { Plugin } from '../src/plugins/Plugin.js';

export interface Reference {
  start: string;
  end: string;
  url: string;
  urlNormalized: string;
  urlNormalizedWithHash: string;
  urlHash: string;
  attribute: string;
  tag: string;
  value: string;
  page: HtmlPage;
}

type AssetStatusKeys = keyof typeof ASSET_STATUS;
export type AssetStatus = typeof ASSET_STATUS[AssetStatusKeys];


export interface ParseElement {
  tagName: string;
  getAttribute(name: string): string | null;
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
  plugins: Plugin[];
  isLocalUrl?: (url: string) => boolean;
}

export type CheckWebsiteCliOptions = Partial<FullCheckWebsiteCliOptions>;


export interface PluginInterface extends Plugin {
  /**
   * The actual check logic for a single item.
   */
  async check(context: CheckContext): Promise<void>;
}

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
