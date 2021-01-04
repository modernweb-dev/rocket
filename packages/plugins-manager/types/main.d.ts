export interface MetaPlugin {
  name: string;
  plugin: any;
  options?: any;
}

export interface MetaPluginWrapable extends MetaPlugin {
  __noWrap?: boolean;
}
