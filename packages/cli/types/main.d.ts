import { DevServerConfig } from '@web/dev-server';
import { MetaPlugin } from 'plugins-manager';
// import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';
import { ImagePreset, RocketPreset } from './preset.js';
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
  serviceWorkerSourcePath?: string;
  cwd: string;
  inputDir: URL | string;
  outputDir: URL | string;
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
  plugins?: RocketCliPlugin[];

  buildOptimize: boolean;
  buildAutoStop: boolean;

  // rarely used
  configFile?: string;
  outputDevDir: URL | string;
}

export class RocketCliPlugin {
  setupCommand?(program: Command, cli: RocketCli): void;
  stop?({ hard: boolean } = {}): void;
}

export type MetaPluginOfRocketCli = MetaPlugin<RocketCliPlugin>;
