import { RollupOptions } from 'rollup';

interface BuildingRollupOptions extends RollupOptions {
  developmentMode?: boolean;
  rootDir?: string;
  absoluteBaseUrl?: string;
  setupPlugins?: function[];
}
