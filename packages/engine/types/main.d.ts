import { Plugin, MetaPlugin } from 'plugins-manager';

export interface EngineOptions {
  docsDir: string;
  outputDir: string;
  watchDir: string;
  open: boolean;
  plugins: EnginePlugin[];
  defaultPlugins: MetaPluginOfEngine[];
  setupPlugins: MetaPlugin[];
  renderMode: 'development' | 'production';
}

export interface EnginePlugin extends Plugin {
  static publicFolder: string;
}

export type MetaPluginOfEngine = MetaPlugin<EnginePlugin>;
