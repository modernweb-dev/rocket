import { DevServerConfig } from '@web/dev-server';
import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';
import { WatchOptions } from 'chokidar';
import { ImagePreset, RocketPreset } from './preset';
export { ImagePreset, RocketPreset };
import { Eleventy } from '@11ty/eleventy';

interface RocketStartConfig {
  createSocialMediaImages?: boolean;
}

type PresetKeys =
  | 'before11ty'
  | 'setupUnifiedPlugins'
  | 'setupDevAndBuildPlugins'
  | 'setupBuildPlugins'
  | 'setupDevPlugins'
  | 'setupCliPlugins'
  | 'setupEleventyPlugins'
  | 'setupEleventyComputedConfig';

export interface RocketCliOptions extends Pick<RocketPreset, PresetKeys> {
  presets?: Array<RocketPreset>;
  pathPrefix?: string;
  serviceWorkerName?: string;
  inputDir?: string;
  outputDir?: string;
  emptyOutputDir?: boolean;
  absoluteBaseUrl?: string;
  watch?: boolean;
  createSocialMediaImages?: boolean;
  imagePresets?: {
    [key: string]: ImagePreset;
  };

  chokidarConfig?: WatchOptions;

  checkLinks?: Partial<CheckHtmlLinksCliOptions>;

  start?: RocketStartConfig;

  // advanced
  rollup?: (config: any) => void; // TODO: improve
  devServer?: DevServerConfig;
  eleventy?: (eleventyConfig: any) => void; // TODO: improve
  plugins?: RocketPlugin[];

  // rarely used
  command?: string;
  configFile?: string;
  outputDevDir?: string;

  _inputDirCwdRelative?: string;
  _presetPaths?: string[];
  __before11tyFunctions?: (() => void | Promise<void>)[];
}

export type RocketPlugin = {
  // what can we do, typescript itself types the constructor as `Function`
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor: Function & { pluginName: string };
  commands: string[];
  setupCommand?(config?: RocketCliOptions): Required<RocketCliOptions>;
  setup?(opts: { config: RocketCliOptions; argv: string[]; eleventy: Eleventy }): Promise<void>;
  inspectRenderedHtml?(opts: {
    html: string;
    inputPath: string;
    outputPath: string;
    layout: string;
    title: string;
    url: string;
    data: any;
    eleventy: Eleventy;
  }): Promise<void>;
} & {
  // later ts versions can do this
  // [index: `${string}Command`]: () => void|Promise<void>;
  [index: string]: () => void | Promise<void>;
};
