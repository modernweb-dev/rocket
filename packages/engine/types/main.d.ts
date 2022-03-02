import { MetaPlugin } from 'plugins-manager';

export interface EngineOptions {
  docsDir: string;
  outputDir: string;
  watchDir: string;
  open: boolean;
  plugins: EnginePlugin[];
  defaultPlugins: MetaPluginOfEngine[];
  setupPlugins: MetaPluginOfEngine[];
  renderMode: 'development' | 'production';
}

export class EnginePlugin {
  static publicFolder: string;
}

export type MetaPluginOfEngine = MetaPlugin<EnginePlugin>;
