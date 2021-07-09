import { AddPluginFn } from 'plugins-manager';

type ImageFormat = 'avif' | 'webp' | 'jpg' | 'jpeg' | 'png' | 'svg';

export interface ImagePreset {
  widths: number[];
  formats: ImageFormat[];
  sizes: string;
}

type ImagePresetHook = (preset: { [key: string]: ImagePreset }) => { [key: string]: ImagePreset };

export interface RocketPreset {
  path: string;

  adjustImagePresets?: ImagePresetHook;

  /** Hook that runs before rocket starts 11ty. Can be sync or async */
  before11ty?: () => void | Promise<void>;

  // TODO: improve all setup functions
  setupUnifiedPlugins?: AddPluginFn[];
  setupDevAndBuildPlugins?: AddPluginFn[];
  setupBuildPlugins?: AddPluginFn[];
  setupDevPlugins?: AddPluginFn[];
  setupCliPlugins?: AddPluginFn[];
  setupEleventyPlugins?: AddPluginFn[];
  setupEleventyComputedConfig?: AddPluginFn[];
}
