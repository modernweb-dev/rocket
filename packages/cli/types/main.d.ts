import { DevServerConfig } from '@web/dev-server';
import { MetaPlugin } from 'plugins-manager';
// import { CheckHtmlLinksCliOptions } from 'check-html-links/dist-types/types/main';
import { ImagePreset, RocketPreset } from './preset.js';
export { ImagePreset, RocketPreset };

import { Command } from 'commander';
import { RocketCli } from '../src/RocketCli.js';

type PresetKeys =
  | 'setupDevServerAndBuildPlugins'
  | 'setupDevServerPlugins'
  | 'setupDevServerMiddleware'
  | 'setupBuildPlugins'
  | 'setupCliPlugins'
  | 'setupEnginePlugins';

export interface FullRocketCliOptions extends Pick<RocketPreset, PresetKeys> {
  presets: Array<RocketPreset>;
  // pathPrefix: string;
  serviceWorkerName: string;
  serviceWorkerSourcePath: string;
  cwd: string;
  inputDir: URL | string;
  outputDir: URL | string;
  emptyOutputDir: boolean;
  absoluteBaseUrl: string;
  watch: boolean;
  open: boolean;
  // imagePresets: {
  //   [key: string]: ImagePreset;
  // };

  adjustDevServerOptions: (options: DevServerConfig) => DevServerConfig;
  adjustBuildOptions: (options: any) => any;

  // advanced
  plugins: RocketCliPlugin[];

  buildOptimize: boolean;
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
