import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { startDevServer } from '@web/dev-server';
import { assertSupportedWrangler, cloudflare } from './cloudflare.js';

const cliPath = path.join(import.meta.dirname, '../cli/cli.js');
// Fixture apps live inside the Rocket checkout so they import `@rocket/js` and `wrangler` from it.
const tempRoot = path.join(import.meta.dirname, '../../temp');

describe('Test cloudflare adapter: rocket start', () => {
  /** @type {FixtureApp} */
  let app;
  /** @type {RocketProcess} */
  let rocket;

  before(async () => {
    app = makeFixtureApp();
    rocket = await startRocket(app.root);
  });

  after(async () => {
    await rocket?.stop();
    app?.remove();
  });

  it('01: hands run_worker_first paths to the Worker with method, headers and body intact', async () => {
    const response = await fetch(`${rocket.origin}/api/echo?q=1`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-fixture': 'yes' },
      body: JSON.stringify({ title: 'Buy milk' }),
    });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get('x-worker'), 'fixture');
    assert.deepEqual(await response.json(), {
      method: 'POST',
      url: `${rocket.origin}/api/echo?q=1`,
      contentType: 'application/json',
      fixtureHeader: 'yes',
      body: '{"title":"Buy milk"}',
    });
  });

  it('02: serves every other path from Rocket', async () => {
    const page = await fetch(`${rocket.origin}/`, { headers: { accept: 'text/html' } });
    assert.equal(page.status, 200);
    assert.match(await page.text(), /<main>Rocket home page<\/main>/);

    // `/api/*` does not match `/api` itself, so Rocket answers it (with its own 404).
    const outsidePattern = await fetch(`${rocket.origin}/api`, {
      headers: { accept: 'text/html' },
    });
    assert.doesNotMatch(await outsidePattern.text(), /Not found in Worker/);
  });

  it('03: passes the Worker status through, without following redirects', async () => {
    const redirect = await fetch(`${rocket.origin}/api/redirect`, { redirect: 'manual' });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get('location'), `${rocket.origin}/signed-in`);

    const noContent = await fetch(`${rocket.origin}/api/no-content`, { method: 'DELETE' });
    assert.equal(noContent.status, 204);
    assert.equal(await noContent.text(), '');

    const notFound = await fetch(`${rocket.origin}/api/unknown`);
    assert.equal(notFound.status, 404);
    assert.equal(await notFound.text(), 'Not found in Worker');
  });

  it('04: keeps several Set-Cookie headers apart', async () => {
    const response = await fetch(`${rocket.origin}/api/cookies`);
    assert.deepEqual(response.headers.getSetCookie(), ['a=1; Path=/', 'b=2; Path=/']);
  });

  it('05: gives the Worker its local values from .dev.vars only', async () => {
    const response = await fetch(`${rocket.origin}/api/env`);
    assert.deepEqual(await response.json(), { GREETING: 'from .dev.vars' });
  });

  it('06: answers 500 with the error when the Worker throws', async () => {
    const response = await fetch(`${rocket.origin}/api/throw`);
    assert.equal(response.status, 500);
    assert.match(await response.text(), /Worker request failed/);
  });

  it('07: answers 503 at once while the Worker has a startup error, and recovers on the next save', async () => {
    for (const broken of [
      'export default {{{',
      'throw new Error("Worker module failed"); export default {};',
    ]) {
      app.write('worker/index.js', broken);
      const failing = await waitForResponse(`${rocket.origin}/api/env`, res => res.status === 503);
      assert.equal(failing.headers.get('content-type'), 'text/plain; charset=utf-8');
      const text = await failing.text();
      assert.match(text, /Worker failed to start/);
      assert.match(text, /terminal/);

      app.write('worker/index.js', echoWorker);
      await waitForResponse(`${rocket.origin}/api/env`, res => res.status === 200);
    }
  });

  it('08: leaves no workerd process behind when rocket start stops', async () => {
    const workerdPids = workerdDescendants(rocket.pid);
    assert.ok(workerdPids.length > 0, 'expected rocket start to run workerd');

    await rocket.stop();

    await waitFor(async () => workerdPids.every(pid => !isRunning(pid)), 'workerd to exit', 5_000);
  });
});

describe('Test cloudflare adapter: dev server hook', () => {
  it('09: disposes the Worker when the dev server stops', async () => {
    const app = makeFixtureApp();
    try {
      const server = await startDevServerWithAdapter(app.root);
      const response = await fetch(`http://localhost:${server.config.port}/api/env`);
      assert.equal(response.status, 200);
      const workerdPids = workerdDescendants(process.pid);
      assert.ok(workerdPids.length > 0, 'expected the dev server to run workerd');

      await server.stop();

      await waitFor(
        async () => workerdPids.every(pid => !isRunning(pid)),
        'workerd to exit',
        5_000,
      );
    } finally {
      app.remove();
    }
  });

  it('10: starts the Worker on the next save after its first start fails with a build error', async () => {
    await assertRecoversFromFailedFirstStart('export default {{{');
  });

  it('11: starts the Worker on the next save after its first start fails at module load', async () => {
    await assertRecoversFromFailedFirstStart(
      'throw new Error("Worker module failed"); export default {};',
    );
  });
});

describe('Test cloudflare adapter: startup checks', () => {
  for (const [index, pattern] of /** @type {const} */ ([
    ['12a', '"/api"'],
    ['12b', '"!/api/docs/*"'],
    ['12c', '"/api/*/items"'],
    ['12d', '"/*.json"'],
    ['12e', 'true'],
  ])) {
    it(`${index}: rejects the unsupported run_worker_first pattern ${pattern} at startup`, async () => {
      const app = makeFixtureApp({
        files: { 'wrangler.jsonc': wranglerConfig({ runWorkerFirst: pattern }) },
      });
      try {
        await assert.rejects(
          stopIfStarted(startDevServerWithAdapter(app.root)),
          /run_worker_first .* only supports plain "\/prefix\/\*" patterns/,
        );
      } finally {
        app.remove();
      }
    });
  }

  it('13: rejects a Rocket Page that a Worker path would shadow', async () => {
    const app = makeFixtureApp();
    const pages = new Map([
      ['/', /** @type {any} */ ({ file: 'src/index.rocket.js' })],
      ['/api/tasks', /** @type {any} */ ({ file: 'src/tasks.rocket.js' })],
    ]);
    try {
      await assert.rejects(
        stopIfStarted(startDevServerWithAdapter(app.root, { pages })),
        /The Page \/api\/tasks \(src\/tasks\.rocket\.js\) is shadowed by "\/api\/\*" in assets\.run_worker_first/,
      );
    } finally {
      app.remove();
    }
  });

  it('13b: rejects a Redirect source that a Worker path would shadow', async () => {
    const app = makeFixtureApp();
    try {
      await assert.rejects(
        stopIfStarted(
          startDevServerWithAdapter(app.root, { redirects: [{ source: '/api/v1', target: '/' }] }),
        ),
        /The Redirect source \/api\/v1 is shadowed by "\/api\/\*" in assets\.run_worker_first/,
      );
    } finally {
      app.remove();
    }
  });

  it('14: makes rocket start fail with a clear error when a Page is shadowed', async () => {
    const app = makeFixtureApp({
      files: {
        'src/tasks.rocket.js': `
export const config = { path: '/api/tasks', metadata: { title: 'Tasks' }, menu: false };
export default () => '<main>Tasks page</main>';
`,
      },
    });
    try {
      const rocket = spawnRocket(app.root, ['--no-watch'], await freePort());
      const exitCode = await Promise.race([
        rocket.exited,
        new Promise(resolve => setTimeout(() => resolve('still running'), 15_000)),
      ]);
      await rocket.stop();
      assert.notEqual(exitCode, 'still running');
      assert.notEqual(exitCode, 0);
      assert.match(rocket.output(), /The Page \/api\/tasks \(src\/tasks\.rocket\.js\) is shadowed/);
    } finally {
      app.remove();
    }
  });
});

describe('Test cloudflare adapter: Wrangler support', () => {
  it('15: stops with a clear message for a Wrangler without unstable_startWorker', () => {
    const wranglerWithoutStartWorker = { unstable_readConfig() {} };

    assert.throws(
      () => assertSupportedWrangler(wranglerWithoutStartWorker, '5.0.0'),
      /^Error: Wrangler 5\.0\.0 is not supported by this Rocket version/,
    );
  });

  it('16: accepts the installed Wrangler', async () => {
    const wrangler = await import('wrangler');
    assert.doesNotThrow(() => assertSupportedWrangler(wrangler, '4.162.0'));
  });
});

describe('Test cloudflare adapter: rocket build', () => {
  it('17: writes .assetsignore into the build output so Vite metadata is not uploaded', async () => {
    const app = makeFixtureApp();
    try {
      const build = await runRocket(app.root, ['build']);

      assert.equal(build.code, 0, build.output);
      assert.equal(existsSync(path.join(app.root, 'dist/index.html')), true);
      assert.equal(readFileSync(path.join(app.root, 'dist/.assetsignore'), 'utf8'), '.vite\n');
    } finally {
      app.remove();
    }
  });

  it('18: reports an assets.directory that does not match the build output', async () => {
    const app = makeFixtureApp({
      files: { 'wrangler.jsonc': wranglerConfig({ directory: './public-site' }) },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.notEqual(build.code, 0);
      assert.match(
        build.output,
        /assets\.directory "\.\/public-site" in .*wrangler\.jsonc does not match Rocket's build output .*dist/,
      );
    } finally {
      app.remove();
    }
  });

  it('19: rejects server-rendered Pages, which Workers Static Assets cannot serve', async () => {
    const app = makeFixtureApp({
      files: {
        'src/live.rocket.js': `
export const config = { path: '/live', render: 'server', metadata: { title: 'Live' }, menu: false };
export default () => '<main>Live</main>';
`,
      },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.notEqual(build.code, 0);
      assert.match(
        build.output,
        /cloudflare\(\) adapter does not support Pages with render: 'server'.*\/live/,
      );
    } finally {
      app.remove();
    }
  });

  it('20: writes URL Lifecycle Redirects to _redirects instead of HTML fallback files', async () => {
    const app = makeFixtureApp({
      files: {
        'rocket-config.js': rocketConfigWithRedirects([
          { source: '/old-guide', target: '/', status: 301 },
          {
            source: '/external-docs',
            target: 'https://docs.example.com/?from=rocket',
            status: 302,
          },
          { source: '/latest', target: '/' },
        ]),
      },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.equal(build.code, 0, build.output);
      assert.equal(
        readFileSync(path.join(app.root, 'dist/_redirects'), 'utf8'),
        [
          '/old-guide / 301',
          '/external-docs https://docs.example.com/?from=rocket 302',
          '/latest / 308',
          '',
        ].join('\n'),
      );
      assert.equal(existsSync(path.join(app.root, 'dist/old-guide/index.html')), false);
    } finally {
      app.remove();
    }
  });

  it('21: writes no _redirects without configured Redirects', async () => {
    const app = makeFixtureApp();
    try {
      const build = await runRocket(app.root, ['build']);

      assert.equal(build.code, 0, build.output);
      assert.equal(existsSync(path.join(app.root, 'dist/_redirects')), false);
    } finally {
      app.remove();
    }
  });

  it('22: rejects a Redirect source that a Worker path would shadow', async () => {
    const app = makeFixtureApp({
      files: {
        'rocket-config.js': rocketConfigWithRedirects([{ source: '/api/v1', target: '/' }]),
      },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.notEqual(build.code, 0);
      assert.match(
        build.output,
        /The Redirect source \/api\/v1 is shadowed by "\/api\/\*" in assets\.run_worker_first/,
      );
    } finally {
      app.remove();
    }
  });

  it('23: rejects a Page that a Worker path would shadow', async () => {
    const app = makeFixtureApp({
      files: {
        'src/tasks.rocket.js': `
export const config = { path: '/api/tasks', metadata: { title: 'Tasks' }, menu: false };
export default () => '<main>Tasks page</main>';
`,
      },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.notEqual(build.code, 0);
      assert.match(build.output, /The Page \/api\/tasks \(src\/tasks\.rocket\.js\) is shadowed/);
    } finally {
      app.remove();
    }
  });

  for (const [index, source] of [
    ['24a', '/docs/*'],
    ['24b', '/docs/:slug'],
  ]) {
    it(`${index}: rejects the Redirect source ${source}, which Cloudflare reads as a pattern`, async () => {
      const app = makeFixtureApp({
        files: { 'rocket-config.js': rocketConfigWithRedirects([{ source, target: '/' }]) },
      });
      try {
        const build = await runRocket(app.root, ['build']);

        assert.notEqual(build.code, 0);
        assert.match(build.output, /reads as a pattern rather than an exact path/);
      } finally {
        app.remove();
      }
    });
  }

  it('25: rejects more Redirects than Cloudflare applies', async () => {
    const redirects = Array.from({ length: 2001 }, (_, index) => ({
      source: `/old-${index}`,
      target: '/',
    }));
    const app = makeFixtureApp({
      files: { 'rocket-config.js': rocketConfigWithRedirects(redirects) },
    });
    try {
      const build = await runRocket(app.root, ['build']);

      assert.notEqual(build.code, 0);
      assert.match(build.output, /2001 Redirects are configured, .* supports at most 2000/);
    } finally {
      app.remove();
    }
  });
});

/**
 * @param {import('@rocket/js/types.js').RedirectConfig[]} redirects
 */
function rocketConfigWithRedirects(redirects) {
  return `
import { cloudflare } from '@rocket/js/adapters/cloudflare.js';

export default {
  includeGlobs: ['src/**/*.rocket.js'],
  urlLifecycle: { redirects: ${JSON.stringify(redirects)} },
  adapter: cloudflare(),
};
`;
}

/**
 * Runs a Rocket CLI command to completion.
 *
 * @param {string} cwd
 * @param {string[]} args
 */
async function runRocket(cwd, args) {
  const cli = spawnCli(cwd, args);
  return { code: await cli.exited, output: cli.output() };
}

/**
 * @param {string} cwd
 * @param {string[]} args
 */
function spawnCli(cwd, args) {
  const child = spawn(process.execPath, [cliPath, ...args], {
    cwd,
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  /** @param {Buffer} chunk */
  const collect = chunk => {
    output += chunk;
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  /** @type {Promise<number | null>} */
  const exited = new Promise(resolve => child.once('exit', code => resolve(code)));
  return { child, exited, output: () => output };
}

/**
 * Lets a test that expects startup to fail end cleanly when it does start.
 *
 * @param {Promise<{ stop: () => Promise<unknown> }>} starting
 */
async function stopIfStarted(starting) {
  const server = await starting;
  await server.stop();
}

/**
 * @param {string} brokenWorker
 */
async function assertRecoversFromFailedFirstStart(brokenWorker) {
  const app = makeFixtureApp({ files: { 'worker/index.js': brokenWorker } });
  const server = await startDevServerWithAdapter(app.root, { watch: true });
  try {
    const origin = `http://localhost:${server.config.port}`;
    const failing = await waitForResponse(`${origin}/api/env`, res => res.status === 503);
    assert.match(await failing.text(), /Worker failed to start/);

    app.write('worker/index.js', echoWorker);
    const recovered = await waitForResponse(`${origin}/api/env`, res => res.status === 200);
    assert.deepEqual(await recovered.json(), { GREETING: 'from .dev.vars' });
  } finally {
    await server.stop();
    app.remove();
  }
}

/**
 * Starts a bare dev server in this process, adjusted by the `cloudflare()` adapter hook only.
 *
 * @param {string} projectRoot
 * @param {{ pages?: import('@rocket/js/types.js').PageRegistry; redirects?: import('@rocket/js/types.js').RedirectConfig[]; options?: { config?: string }; watch?: boolean }} [input]
 */
async function startDevServerWithAdapter(
  projectRoot,
  { pages = new Map(), redirects, options, watch = false } = {},
) {
  process.env.WRANGLER_SEND_METRICS = 'false';
  const adapter = cloudflare(options);
  const config = await /** @type {NonNullable<typeof adapter.adjustDevServerConfig>} */ (
    adapter.adjustDevServerConfig
  )(
    { port: await freePort(), rootDir: projectRoot, watch },
    {
      pages,
      projectRoot,
      config: {
        includeGlobs: [],
        excludeRegex: [],
        adjustDevServerConfig: _ => _,
        ...(redirects && { urlLifecycle: { redirects } }),
      },
    },
  );
  return startDevServer({
    config,
    readCliArgs: false,
    readFileConfig: false,
    autoExitProcess: false,
    logStartMessage: false,
  });
}

/**
 * @typedef {{ root: string; write: (file: string, content: string) => void; remove: () => void }} FixtureApp
 * @typedef {ReturnType<typeof spawnRocket>} RocketProcess
 */

const echoWorker = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/echo') {
      return Response.json(
        {
          method: request.method,
          url: request.url,
          contentType: request.headers.get('content-type'),
          fixtureHeader: request.headers.get('x-fixture'),
          body: await request.text(),
        },
        { status: 201, headers: { 'x-worker': 'fixture' } },
      );
    }
    if (url.pathname === '/api/redirect') {
      return Response.redirect(new URL('/signed-in', url), 302);
    }
    if (url.pathname === '/api/no-content') {
      return new Response(null, { status: 204 });
    }
    if (url.pathname === '/api/cookies') {
      const headers = new Headers();
      headers.append('set-cookie', 'a=1; Path=/');
      headers.append('set-cookie', 'b=2; Path=/');
      return new Response('ok', { headers });
    }
    if (url.pathname === '/api/throw') {
      throw new Error('Worker request failed');
    }
    if (url.pathname === '/api/env') {
      return Response.json({ GREETING: env.GREETING });
    }
    return new Response('Not found in Worker', { status: 404 });
  },
};
`;

/**
 * @param {{ directory?: string; runWorkerFirst?: string }} [options]
 */
function wranglerConfig({ directory = './dist', runWorkerFirst = '"/api/*"' } = {}) {
  const runWorkerFirstValue = runWorkerFirst === 'true' ? 'true' : `[${runWorkerFirst}]`;
  return `// Fixture Worker for the cloudflare() adapter tests
{
  "name": "rocket-cloudflare-fixture",
  "main": "worker/index.js",
  "compatibility_date": "2026-11-01",
  "assets": {
    "directory": "${directory}",
    "run_worker_first": ${runWorkerFirstValue},
  },
}
`;
}

/**
 * Writes a minimal Rocket + Worker app into the gitignored temp folder.
 *
 * @param {{ files?: Record<string, string> }} [options]
 * @returns {FixtureApp}
 */
function makeFixtureApp({ files = {} } = {}) {
  mkdirSync(tempRoot, { recursive: true });
  const root = mkdtempSync(path.join(tempRoot, 'rocket-cloudflare-'));
  /** @type {Record<string, string>} */
  const defaults = {
    'rocket-config.js': `
import { cloudflare } from '@rocket/js/adapters/cloudflare.js';

export default {
  includeGlobs: ['src/**/*.rocket.js'],
  adapter: cloudflare(),
};
`,
    'src/index.rocket.js': `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Rocket home page</main>';
}
`,
    'wrangler.jsonc': wranglerConfig(),
    'worker/index.js': echoWorker,
    '.dev.vars': 'GREETING=from .dev.vars\n',
    ...files,
  };
  /**
   * @param {string} file
   * @param {string} content
   */
  const write = (file, content) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  };
  for (const [file, content] of Object.entries(defaults)) {
    write(file, content);
  }
  return {
    root,
    write,
    remove: () => rmSync(root, { recursive: true, force: true }),
  };
}

/**
 * Runs `rocket start` in the fixture app and waits until Rocket answers.
 *
 * @param {string} cwd
 * @param {string[]} [args]
 * @returns {Promise<RocketProcess>}
 */
async function startRocket(cwd, args = []) {
  const rocket = spawnRocket(cwd, args, await freePort());
  await waitFor(async () => {
    if (rocket.child.exitCode !== null) {
      throw new Error(`rocket start exited with ${rocket.child.exitCode}:\n${rocket.output()}`);
    }
    const response = await fetch(rocket.origin, { headers: { accept: 'text/html' } }).catch(
      () => undefined,
    );
    return response?.ok;
  }, `rocket start to answer on ${rocket.origin}`);
  return rocket;
}

/**
 * @param {string} cwd
 * @param {string[]} [args]
 * @param {number} [port]
 */
function spawnRocket(cwd, args = [], port = 8888) {
  const { child, exited, output } = spawnCli(cwd, [
    'start',
    '--no-open',
    '--port',
    `${port}`,
    ...args,
  ]);
  return {
    child,
    pid: /** @type {number} */ (child.pid),
    origin: `http://localhost:${port}`,
    output,
    exited,
    async stop() {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGTERM');
        await exited;
      }
    },
  };
}

/**
 * @param {() => Promise<unknown>} check
 * @param {string} what
 * @param {number} [timeout]
 */
async function waitFor(check, what, timeout = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await check()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${what}`);
}

/**
 * Polls a URL until a response passes `accept`. Each request must answer within a second, so a
 * request that hangs counts as a miss.
 *
 * @param {string} url
 * @param {(response: Response) => boolean} accept
 * @returns {Promise<Response>}
 */
async function waitForResponse(url, accept) {
  /** @type {Response | undefined} */
  let accepted;
  await waitFor(async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) }).catch(
      () => undefined,
    );
    if (response && accept(response)) {
      accepted = response;
      return true;
    }
    await response?.body?.cancel();
    return false;
  }, `a matching response from ${url}`);
  return /** @type {Response} */ (accepted);
}

/**
 * @returns {Promise<number>}
 */
function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

/**
 * Process ids of `workerd` processes started below the given process.
 *
 * @param {number} rootPid
 * @returns {number[]}
 */
function workerdDescendants(rootPid) {
  const rows = execFileSync('ps', ['-A', '-o', 'pid=,ppid=,comm='], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map(line => line.trim().split(/\s+/))
    .map(([pid, ppid, ...comm]) => ({
      pid: Number(pid),
      ppid: Number(ppid),
      comm: comm.join(' '),
    }));
  const descendants = new Set([rootPid]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of rows) {
      if (descendants.has(row.ppid) && !descendants.has(row.pid)) {
        descendants.add(row.pid);
        grew = true;
      }
    }
  }
  return rows
    .filter(row => descendants.has(row.pid) && path.basename(row.comm) === 'workerd')
    .map(row => row.pid);
}

/**
 * @param {number} pid
 */
function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
