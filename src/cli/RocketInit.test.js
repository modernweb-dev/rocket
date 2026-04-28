import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { RocketCli } from './RocketCli.js';
import { RocketInit } from './RocketInit.js';

describe('Test RocketInit', () => {
  it('01: creates the minimal Rocket shape and package scripts', () => {
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
        'docs/pages/index.rocket.md',
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
        /# Rocket Site/,
      );
      assert.match(
        readFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), 'utf8'),
        /name: rocket/,
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
      writeFileSync(path.join(projectRoot, 'docs/pages/index.rocket.md'), '# Existing');
      mkdirSync(path.join(projectRoot, '.agents/skills/rocket'), { recursive: true });
      writeFileSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md'), '# Existing Skill');

      const result = new RocketInit().init();

      assert.deepEqual(result.created, []);
      assert.deepEqual(result.skipped, [
        'rocket-config.js',
        'docs/pages/index.rocket.md',
        '.agents/skills/rocket/SKILL.md',
      ]);
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
      assert.equal(existsSync(path.join(projectRoot, 'docs/pages/index.rocket.md')), true);
      assert.equal(existsSync(path.join(projectRoot, '.agents/skills/rocket/SKILL.md')), true);
    });
  });

  it('05: creates files without package.json and reports npx next steps', () => {
    withTempProject(() => {
      const result = new RocketInit().init();

      assert.deepEqual(result.created, [
        'rocket-config.js',
        'docs/pages/index.rocket.md',
        '.agents/skills/rocket/SKILL.md',
      ]);
      assert.equal(result.packageJson, undefined);
      assert.equal(result.missingRocketDependency, false);
      assert.deepEqual(result.nextSteps, ['npx rocket start', 'npx rocket build']);
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
