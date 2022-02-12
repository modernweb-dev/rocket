import { DevServerConfig } from '@web/dev-server';
// import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';
import { ImagePreset, RocketPreset } from './preset';
export { ImagePreset, RocketPreset };

import { Command } from 'commander';
import { RocketCli } from '../src/RocketCli.js';

interface RocketStartConfig {
  createSocialMediaImages?: boolean;
}

type PresetKeys =
  | 'setupDevServerAndBuildPlugins'
  | 'setupDevServerPlugins'
  | 'setupBuildPlugins'
  | 'setupCliPlugins'
  | 'setupEnginePlugins';

export interface RocketCliOptions extends Pick<RocketPreset, PresetKeys> {
  presets?: Array<RocketPreset>;
  // pathPrefix?: string;
  serviceWorkerName?: string;
  inputDir?: string;
  outputDir?: string;
  emptyOutputDir?: boolean;
  absoluteBaseUrl?: string;
  watch?: boolean;
  open?: boolean;
  imagePresets?: {
    [key: string]: ImagePreset;
  };

  start?: RocketStartConfig;

  // advanced
  devServer?: DevServerConfig;
  build?: any; // TODO: improve
  plugins?: RocketPlugin[];

  // rarely used
  configFile?: string;
  outputDevDir?: string;
}

export type RocketPlugin = {
  setupCommand?(program?: Command, cli: RocketCli): void;
  stop?(): void;
};

export type MetaPluginOfRocket = MetaPlugin<RocketPlugin>;
