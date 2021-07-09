type AnyFn = (...args: any[]) => any;

export interface MetaPlugin<F = AnyFn> {
  name: string;
  plugin: F extends (options?: infer O) => P ? F : any;
  options?: /* prettier-ignore */ (
      F extends (eleventyConfig: any, options?: infer O) => void ? O
    : F extends (options: infer O) => P ? O
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

type AddPluginFn = (plugins: MetaPlugin[]) => MetaPlugin[];

export type AddPluginType = <F>(metaPluginAndOptions: AddPluginOptions<F>) => AddPluginFn;
