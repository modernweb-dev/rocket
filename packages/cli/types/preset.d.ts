import { MetaPluginOfEngine } from '@rocket/engine';
import { addPlugin } from 'plugins-manager';
import { MetaPluginOfRocketCli, FullRocketCliOptions } from './main.js';
import { Plugin as DevServerPlugin } from '@web/dev-server-core';

type ImageFormat = 'avif' | 'webp' | 'jpg' | 'jpeg' | 'png' | 'svg';

export interface ImagePreset {
  widths: number[];
  formats: ImageFormat[];
  sizes: string;
  // ignore: ({ src: string }) => boolean;
}

type ImagePresetHook = (preset: { [key: string]: ImagePreset }) => { [key: string]: ImagePreset };

export type MetaPluginOfDevServer = MetaPlugin<DevServerPlugin>;

export interface RocketPreset {
  adjustImagePresets?: ImagePresetHook;
  adjustOptions?: (options: FullRocketCliOptions) => FullRocketCliOptions;

  // TODO: improve all setup functions
  setupDevServerAndBuildPlugins: MetaPluginOfDevServer[];
  setupBuildPlugins: typeof addPlugin[];
  setupDevServerPlugins: MetaPluginOfDevServer[];
  setupDevServerMiddleware: any[];
  setupCliPlugins: MetaPluginOfRocketCli[];
  setupEnginePlugins: MetaPluginOfEngine[];
}
