import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { RocketCli } from './RocketCli.js';
import { RocketInit } from './RocketInit.js';

describe('Test RocketInit', () => {
  it('01: creates the Atlas docs starter and package scripts', () => {
    withTempProject(projectRoot => {
      writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            name: 'starter',
            dependencies: {
              '@rocket/js': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );

      const result = new RocketInit().init();

      assert.deepEqual(result.created, [
        'rocket-config.js',
        'docs/pages/sharedData.js',
        'docs/pages/index.rocket.md',
        'docs/pages/docs.rocket.md',
        'docs/pages/javascript-demo.rocket.md',
        'docs/pages/request-demo.rocket.md',
        'docs/pages/site-status.rocket.js',
        '.agents/skills/rocket/SKILL.md',
      ]);
      assert.deepEqual(result.skipped, []);
      assert.equal(result.missingRocketDependency, false);
      assert.deepEqual(result.nextSteps, ['npm start', 'npm run build']);
      assert.deepEqual(readPackageJson(), {
        name: 'starter',
        dependencies: {
          '@rocket/js': '^0.1.0',
        },
        type: 'module',
        scripts: {
          start: 'rocket start',
          build: 'rocket build',
        },
      });
      assert.equal(
        readFileSync(path.join(projectRoot, 'rocket-config.js'), 'utf8'),
        `/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
};
`,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/index.rocket.md'), 'utf8'),
        /import \{ atlasHeroLayout, atlasHeroComponents \} from '@rocket\/js\/layouts\/atlasHero\.js';/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/index.rocket.md'), 'utf8'),
        /export const components = atlasHeroComponents;/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/docs.rocket.md'), 'utf8'),
        /import \{ atlasDocLayout, atlasDocComponents \} from '@rocket\/js\/layouts\/atlasDoc\.js';/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/docs.rocket.md'), 'utf8'),
        /iconName: 'book'/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/sharedData.js'), 'utf8'),
        /export const headerData/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/sharedData.js'), 'utf8'),
        /export const footerData/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/sharedData.js'), 'utf8'),
        /export const heroData/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/sharedData.js'), 'utf8'),
        /export const docData/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/javascript-demo.rocket.md'), 'utf8'),
        /path: '\/javascript-demo'/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/javascript-demo.rocket.md'), 'utf8'),
        /```js demo/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/request-demo.rocket.md'), 'utf8'),
        /```js request-demo url="\/api\/site-status\.json"/,
      );
      assert.doesNotMatch(
        readFileSync(path.join(projectRoot, 'docs/pages/request-demo.rocket.md'), 'utf8'),
        /url="[^"]*\?/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, 'docs/pages/site-status.rocket.js'), 'utf8'),
        /path: '\/api\/site-status\.json'/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), 'utf8'),
        /Read `rocket-config\.js` first/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), 'utf8'),
        /atlasDocLayout/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), 'utf8'),
        /Standalone Demo URL/,
      );
    });
  });

  it('02: preserves existing files and adds Rocket-specific scripts when generic scripts exist', () => {
    withTempProject(projectRoot => {
      writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            name: 'existing-app',
            type: 'module',
            scripts: {
              start: 'vite',
              build: 'vite build',
            },
            devDependencies: {
              '@rocket/js': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(path.join(projectRoot, 'rocket-config.js'), 'export default { custom: true };');
      mkdirSync(path.join(projectRoot, 'docs/pages'), { recursive: true });
      writeFileSync(path.join(projectRoot, 'docs/pages/sharedData.js'), 'export const data = {};');
      writeFileSync(path.join(projectRoot, 'docs/pages/index.rocket.md'), '# Existing');
      writeFileSync(path.join(projectRoot, 'docs/pages/docs.rocket.md'), '# Existing Docs');
      writeFileSync(
        path.join(projectRoot, 'docs/pages/javascript-demo.rocket.md'),
        '# Existing Demo',
      );
      writeFileSync(
        path.join(projectRoot, 'docs/pages/request-demo.rocket.md'),
        '# Existing Request Demo',
      );
      writeFileSync(
        path.join(projectRoot, 'docs/pages/site-status.rocket.js'),
        'export default {};',
      );
      mkdirSync(path.join(projectRoot, '.agents/skills/rocket'), { recursive: true });
      writeFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), '# Existing Skill');

      const result = new RocketInit().init();

      assert.deepEqual(result.created, []);
      assert.deepEqual(result.skipped, ['rocket-config.js', '.agents/skills/rocket/SKILL.md']);
      assert.deepEqual(result.nextSteps, ['npm run rocket:start', 'npm run rocket:build']);
      assert.deepEqual(readPackageJson().scripts, {
        start: 'vite',
        build: 'vite build',
        'rocket:start': 'rocket start',
        'rocket:build': 'rocket build',
      });
      assert.equal(
        readFileSync(path.join(projectRoot, 'rocket-config.js'), 'utf8'),
        'export default { custom: true };',
      );
      assert.equal(
        readFileSync(path.join(projectRoot, 'docs/pages/index.rocket.md'), 'utf8'),
        '# Existing',
      );
      assert.equal(
        readFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), 'utf8'),
        '# Existing Skill',
      );
    });
  });

  it('03: rejects CommonJS projects before writing files', () => {
    withTempProject(projectRoot => {
      writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            type: 'commonjs',
            scripts: {},
          },
          null,
          2,
        ),
      );

      assert.throws(
        () => new RocketInit().init(),
        /Rocket init expects an ESM project.*type "commonjs"/,
      );
      assert.equal(existsSync(path.join(projectRoot, 'rocket-config.js')), false);
      assert.equal(existsSync(path.join(projectRoot, 'docs')), false);
      assert.equal(existsSync(path.join(projectRoot, '.agents')), false);
    });
  });

  it('04: can run from the CLI before rocket-config.js exists', async () => {
    await withTempProjectAsync(async projectRoot => {
      writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            name: 'cli-project',
            dependencies: {
              '@rocket/js': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );

      const cli = new RocketCli({ argv: ['node', 'rocket', 'init'] });
      await cli.start();

      assert.equal(existsSync(path.join(projectRoot, 'rocket-config.js')), true);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/sharedData.js')), true);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/index.rocket.md')), true);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/docs.rocket.md')), true);
      assert.equal(
        existsSync(path.join(projectRoot, 'docs/pages/javascript-demo.rocket.md')),
        true,
      );
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/request-demo.rocket.md')), true);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/site-status.rocket.js')), true);
      assert.equal(existsSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md')), true);
    });
  });

  it('05: creates files without package.json and reports npx next steps', () => {
    withTempProject(() => {
      const result = new RocketInit().init();

      assert.deepEqual(result.created, [
        'rocket-config.js',
        'docs/pages/sharedData.js',
        'docs/pages/index.rocket.md',
        'docs/pages/docs.rocket.md',
        'docs/pages/javascript-demo.rocket.md',
        'docs/pages/request-demo.rocket.md',
        'docs/pages/site-status.rocket.js',
        '.agents/skills/rocket/SKILL.md',
      ]);
      assert.equal(result.packageJson, undefined);
      assert.equal(result.missingRocketDependency, false);
      assert.deepEqual(result.nextSteps, ['npx rocket start', 'npx rocket build']);
    });
  });

  it('06: reuses existing npm scripts that already run Rocket commands', () => {
    withTempProject(() => {
      writeFileSync(
        'package.json',
        JSON.stringify(
          {
            type: 'module',
            scripts: {
              start: 'rocket start --port 3000 --no-open',
              build: 'vite build',
            },
            dependencies: {
              '@rocket/js': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );

      const result = new RocketInit().init();

      assert.deepEqual(result.nextSteps, ['npm start', 'npm run rocket:build']);
      assert.deepEqual(readPackageJson().scripts, {
        start: 'rocket start --port 3000 --no-open',
        build: 'vite build',
        'rocket:build': 'rocket build',
      });
    });
  });

  it('07: avoids starter example Pages when a repo already has several Rocket Pages', () => {
    withTempProject(projectRoot => {
      writeFileSync(
        'package.json',
        JSON.stringify(
          {
            name: 'existing-rocket-site',
            dependencies: {
              '@rocket/js': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );
      mkdirSync('docs/pages', { recursive: true });
      writeFileSync('docs/pages/one.rocket.md', '# One');
      writeFileSync('docs/pages/two.rocket.md', '# Two');
      writeFileSync('docs/pages/three.rocket.md', '# Three');

      const result = new RocketInit().init();

      assert.deepEqual(result.created, ['rocket-config.js', '.agents/skills/rocket/SKILL.md']);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/sharedData.js')), false);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/index.rocket.md')), false);
      assert.equal(
        existsSync(path.join(projectRoot, 'docs/pages/javascript-demo.rocket.md')),
        false,
      );
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/request-demo.rocket.md')), false);
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/site-status.rocket.js')), false);
    });
  });
});

function readPackageJson() {
  return JSON.parse(readFileSync('package.json', 'utf8'));
}

/**
 * @param {(projectRoot: string) => void} callback
 */
function withTempProject(callback) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-init-'));
  const originalCwd = process.cwd();
  process.chdir(projectRoot);
  try {
    callback(projectRoot);
  } finally {
    process.chdir(originalCwd);
    rmSync(projectRoot, { recursive: true, force: true });
  }
}

/**
 * @param {(projectRoot: string) => Promise<void>} callback
 */
async function withTempProjectAsync(callback) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-init-'));
  const originalCwd = process.cwd();
  process.chdir(projectRoot);
  try {
    await callback(projectRoot);
  } finally {
    process.chdir(originalCwd);
    rmSync(projectRoot, { recursive: true, force: true });
  }
}
