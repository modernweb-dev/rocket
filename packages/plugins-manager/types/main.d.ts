// using `{}` as the default type for Constructor is a well-established pattern which we'll adopt here
// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T = {}> = { new (...args: any[]): T };
type AnyFn = (...args: any[]) => any;
type Plugin = Constructor | AnyFn;

export type GetPluginOptions<T> = T extends Constructor
  ? ConstructorParameters<T>[0]
  : T extends AnyFn
  ? Parameters<T>[0]
  : Partial<T>;

export interface MetaPlugin<T> {
  plugin: Plugin;
  options: GetPluginOptions<T>;
}

export interface ManagerOptions {
  how?: 'after' | 'before' | 'fixed';
  location?: 'top' | 'bottom' | Plugin;
}

export type adjustPluginOptionsOptions<T> =
  | GetPluginOptions<T>
  | ((options: GetPluginOptions<T>) => GetPluginOptions<T>);
