type AnyFn = (...args: any[]) => any;

export interface MetaPlugin<F = AnyFn> {
  name: string;
  plugin: F extends (options?: infer O) => unknown ? F : any;
  options?: /* prettier-ignore */ (
      F extends (eleventyConfig: any, options?: infer O) => void ? O
    : F extends (options: infer O) => unknown ? O
    : any
  );
}

export interface MetaPluginWrapable extends MetaPlugin {
  __noWrap?: boolean;
}

export type AddPluginOptions<T> = MetaPlugin<T> & {
  how?: 'after' | 'before' | 'fixed';
  location?: 'top' | 'bottom' | string;
};

export type AddPluginFn = (plugins: MetaPlugin[]) => MetaPlugin[];

export type AddPluginType = <F>(metaPluginAndOptions: AddPluginOptions<F>) => AddPluginFn;
