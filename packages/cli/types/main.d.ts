import { DevServerConfig } from '@web/dev-server';
import { MetaPlugin } from 'plugins-manager';
// import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';
import { ImagePreset, FullRocketPreset } from './preset.js';
export { ImagePreset, FullRocketPreset as RocketPreset };

import { Command } from 'commander';
import { RocketCli } from '../src/RocketCli.js';

type PresetKeys =
  | 'setupDevServerAndBuildPlugins'
  | 'setupDevServerPlugins'
  | 'setupDevServerMiddleware'
  | 'setupBuildPlugins'
  | 'setupCliPlugins'
  | 'setupEnginePlugins';

export interface FullRocketCliOptions extends Pick<FullRocketPreset, PresetKeys> {
  presets: Array<FullRocketPreset>;
  // pathPrefix: string;
  serviceWorkerName: string;
  serviceWorkerSourcePath: string;
  cwd: string;
  inputDir: URL | string;
  outputDir: URL | string;
  clearOutputDir: boolean;
  absoluteBaseUrl: string;
  watch: boolean;
  open: boolean;
  // imagePresets: {
  //   [key: string]: ImagePreset;
  // };

  longFileHeaderWidth: number;
  longFileHeaderComment: string;

  adjustDevServerOptions: (options: DevServerConfig) => DevServerConfig;
  adjustBuildOptions: (options: any) => any;

  // advanced
  plugins: RocketCliPlugin[];

  buildOptimize: boolean;
  buildOpenGraphImages: boolean;
  buildAutoStop: boolean;

  // rarely used
  configFile: string;
  outputDevDir: URL | string;
}

export type RocketCliOptions = Partial<FullRocketCliOptions>;

export class RocketCliPlugin {
  setupCommand?(program: Command, cli: RocketCli): void;
  stop?({ hard: boolean } = {}): void;
}

export type MetaPluginOfRocketCli = MetaPlugin<RocketCliPlugin>;
