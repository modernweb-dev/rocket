import { AddPluginFn } from 'plugins-manager';
import { RocketCliOptions } from './main.js';

type ImageFormat = 'avif' | 'webp' | 'jpg' | 'jpeg' | 'png' | 'svg';

export interface ImagePreset {
  widths: number[];
  formats: ImageFormat[];
  sizes: string;
  ignore: ({ src: string }) => boolean;
}

type ImagePresetHook = (preset: { [key: string]: ImagePreset }) => { [key: string]: ImagePreset };

export interface RocketPreset {
  adjustImagePresets?: ImagePresetHook;
  adjustSettings?: (settings: RocketCliOptions) => RocketCliOptions;

  // TODO: improve all setup functions
  setupDevServerAndBuildPlugins?: AddPluginFn[];
  setupBuildPlugins?: AddPluginFn[];
  setupDevServerPlugins?: AddPluginFn[];
  setupCliPlugins?: AddPluginFn[];
  setupEnginePlugins?: AddPluginFn[];
}
