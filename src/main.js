/** Runs on: server */
import { register } from 'node:module';
import { startDevServer } from '@web/dev-server';
import customRocketPlugin from './wds-plugin.js';
import { MessageChannel } from 'node:worker_threads';
import { customElements } from '@lit-labs/ssr-dom-shim';
import { readConfig } from './config.js';

const configFilePath = process.argv[2] || undefined;
const startOptions = readStartOptions(process.argv[3]);

customElements.define = (name, ctor) => {
  customElements.__definitions.set(name, {
    ctor,
    // @ts-ignore
    observedAttributes: ctor.observedAttributes ?? [],
  });
};

const config = await readConfig(configFilePath);

const { port1, port2 } = new MessageChannel();

// register must be AFTER the config is read
register('./markdownHook.js', {
  parentURL: import.meta.url,
  data: { port: port1 },
  transferList: [port1],
});

/** @type {import("@web/dev-server").DevServerConfig} */
let devServerConfig = {
  plugins: [
    customRocketPlugin(config.includeGlobs, config.excludeRegex, port2, {
      siteHeadMetadata: config.siteHeadMetadata,
      siteOrigin: config.siteOrigin,
      siteDiscoverability: config.siteDiscoverability,
      urlLifecycle: config.urlLifecycle,
      iconLibraries: config.iconLibraries,
      defaultIconLibrary: config.defaultIconLibrary,
      watch: startOptions.watch,
    }),
  ],
  open: startOptions.open ?? true,
  nodeResolve: { exportConditions: ['browser'] },
  watch: startOptions.watch ?? true,
  port: startOptions.port ?? 8888,
};

devServerConfig = config.adjustDevServerConfig(devServerConfig);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const server = await startDevServer({
  config: devServerConfig,
  readCliArgs: false,
  readFileConfig: false,
});

/**
 * @param {string | undefined} value
 * @returns {{ port?: number; open?: boolean; watch?: boolean }}
 */
function readStartOptions(value) {
  if (!value) {
    return {};
  }
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }
  return /** @type {{ port?: number; open?: boolean; watch?: boolean }} */ (parsed);
}
