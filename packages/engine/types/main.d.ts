import { MetaPlugin } from 'plugins-manager';
import { Plugin as DevServerPlugin, Middleware as DevServerMiddleware } from '@web/dev-server-core';
import { DevServerConfig } from '@web/dev-server';

export interface EngineOptions {
  docsDir: string;
  outputDir: string;
  watchDir: string;
  open: boolean;
  clearOutputDir: boolean;
  plugins: EnginePlugin[];
  defaultPlugins: MetaPluginOfEngine[];
  setupPlugins: MetaPluginOfEngine[];
  renderMode: 'development' | 'production';

  devServerPlugins: DevServerPlugin[];
  setupDevServerPlugins: any[];
  setupDevServerMiddleware: any[];
  adjustDevServerOptions: (options: DevServerConfig) => DevServerConfig;
}

export class EnginePlugin {
  static publicFolder: string;
}

export type MetaPluginOfEngine = MetaPlugin<EnginePlugin>;

export type MetaPluginOfDevServer = MetaPlugin<DevServerPlugin>;

export { DevServerPlugin, DevServerMiddleware };

export interface renderWorkerResult {
  status: number;
  outputFilePath: string;
  fileContent: string;
  sourceFilePath: string;
  sourceRelativeFilePath: string;
  keepConvertedFiles: boolean;
  passOnError?: Error;
}
