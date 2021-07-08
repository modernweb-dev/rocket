type AnyFn = (...args: any[]) => any;

export interface MetaPlugin<F = AnyFn> {
  name: string;
  plugin: F extends (options?: infer O) => P ? F : any;
  options?: F extends (options: infer O) => P ? O : any;
}

export interface MetaPluginWrapable extends MetaPlugin {
  __noWrap?: boolean;
}

interface AddPluginOptions {
  how?: 'after' | 'before' | 'fixed';
  location?: 'top' | 'bottom' | string;
}

type AddPluginFn = (plugins: MetaPlugin[]) => MetaPlugin[];

export type AddPluginType = <F>(
  metaPluginAndOptions: MetaPlugin<F> & AddPluginOptions,
) => AddPluginFn;
