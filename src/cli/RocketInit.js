/* eslint-disable no-console */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROCKET_CONFIG_PATH = 'rocket-config.js';
const INDEX_PAGE_PATH = 'docs/pages/index.rocket.md';
const ROCKET_AGENT_SKILL_PATH = '.agents/skills/rocket/SKILL.md';

const rocketConfigSource = `/** @type {import('@rocket/js/types.js').RocketConfig} */
export default {
  includeGlobs: ['docs/pages/**/*.rocket.{md,js}', 'src/**/*.rocket.{md,js}'],
};
`;

const indexPageSource = `\`\`\`js server
export const config = {
  path: '/',
  metadata: {
    title: 'Rocket Site',
    description: 'Documentation built with Rocket.',
  },
};

export { layout } from '@rocket/js/layout.js';
\`\`\`

# Rocket Site

This Page is rendered by Rocket.

## Next steps

- Edit this Page in \`docs/pages/index.rocket.md\`.
- Add general documentation Pages under \`docs/pages\`.
- Add component reference Pages next to the components they document.
- Run \`npm run build\` to verify the site.
`;

const rocketAgentSkillSource = `---
name: rocket
description: Use when editing Rocket Pages, config, layouts, component reference Pages, or build behavior in this project.
---

# Rocket

Use this skill when working on this project's Rocket site.

## Rules

- Read \`rocket-config.js\` before changing Pages.
- Rocket discovers Pages from \`includeGlobs\`.
- Every Page owns its public URL through \`config.path\`.
- Put general documentation Pages under \`docs/pages\`.
- Put component reference Pages next to the component they document.
- Prefer Markdown Pages for durable content.
- Use JavaScript Pages only for request-time or programmatic rendering.
- Keep Rocket changes buildable with \`npm run build\`.
`;

export class RocketInit {
  /**
   * @param {import('commander').Command} program
   */
  async setupCommand(program) {
    program
      .command('init')
      .description('create a minimal Rocket project shape')
      .action(() => {
        const result = this.init();
        reportInitResult(result);
      });
  }

  /**
   * @returns {RocketInitResult}
   */
  init() {
    const packageJsonUpdate = preparePackageJsonUpdate('package.json');
    /** @type {RocketInitResult} */
    const result = {
      created: [],
      skipped: [],
      packageJson: packageJsonUpdate?.summary,
      missingRocketDependency: Boolean(packageJsonUpdate?.missingRocketDependency),
      nextSteps: packageJsonUpdate?.nextSteps || ['npx rocket start', 'npx rocket build'],
    };

    if (packageJsonUpdate?.changed) {
      writeJsonFile('package.json', packageJsonUpdate.packageJson);
    }

    writeFileIfMissing(ROCKET_CONFIG_PATH, rocketConfigSource, result);
    writeFileIfMissing(INDEX_PAGE_PATH, indexPageSource, result);
    writeFileIfMissing(ROCKET_AGENT_SKILL_PATH, rocketAgentSkillSource, result);

    return result;
  }
}

/**
 * @typedef {{
 *   created: string[];
 *   skipped: string[];
 *   packageJson?: {
 *     path: string;
 *     updated: string[];
 *     skipped: string[];
 *   };
 *   missingRocketDependency: boolean;
 *   nextSteps: string[];
 * }} RocketInitResult
 */

/**
 * @param {string} filePath
 * @returns {{
 *   changed: boolean;
 *   packageJson: Record<string, any>;
 *   summary: NonNullable<RocketInitResult['packageJson']>;
 *   missingRocketDependency: boolean;
 *   nextSteps: string[];
 * } | undefined}
 */
function preparePackageJsonUpdate(filePath) {
  if (!existsSync(filePath)) {
    return undefined;
  }
  if (!statSync(filePath).isFile()) {
    throw new Error('package.json exists but is not a file');
  }

  const packageJson = JSON.parse(readFileSync(filePath, 'utf8'));
  if (!isPlainRecord(packageJson)) {
    throw new Error('package.json must contain a JSON object');
  }
  if (packageJson.type === 'commonjs') {
    throw new Error(
      `Rocket init expects an ESM project. Found package.json type "commonjs". ` +
        `Change package.json to "type": "module" before running rocket init.`,
    );
  }

  /** @type {string[]} */
  const updated = [];
  /** @type {string[]} */
  const skipped = [];

  if (!hasOwn(packageJson, 'type')) {
    packageJson.type = 'module';
    updated.push('type');
  } else if (packageJson.type === 'module') {
    skipped.push('type');
  }

  if (!hasOwn(packageJson, 'scripts')) {
    packageJson.scripts = {};
    updated.push('scripts');
  }
  if (isPlainRecord(packageJson.scripts)) {
    addRocketScript(packageJson.scripts, {
      genericName: 'start',
      fallbackName: 'rocket:start',
      command: 'rocket start',
      updated,
      skipped,
    });
    addRocketScript(packageJson.scripts, {
      genericName: 'build',
      fallbackName: 'rocket:build',
      command: 'rocket build',
      updated,
      skipped,
    });
  } else {
    skipped.push('scripts');
  }

  return {
    changed: updated.length > 0,
    packageJson,
    summary: {
      path: filePath,
      updated,
      skipped,
    },
    missingRocketDependency: !hasPackageDependency(packageJson, '@rocket/js'),
    nextSteps: rocketNextSteps(packageJson),
  };
}

/**
 * @param {Record<string, any>} scripts
 * @param {{
 *   genericName: string;
 *   fallbackName: string;
 *   command: string;
 *   updated: string[];
 *   skipped: string[];
 * }} options
 */
function addRocketScript(scripts, { genericName, fallbackName, command, updated, skipped }) {
  if (!hasOwn(scripts, genericName)) {
    scripts[genericName] = command;
    updated.push(`scripts.${genericName}`);
    return;
  }
  if (scripts[genericName] === command) {
    skipped.push(`scripts.${genericName}`);
    return;
  }
  if (!hasOwn(scripts, fallbackName)) {
    scripts[fallbackName] = command;
    updated.push(`scripts.${fallbackName}`);
    return;
  }
  skipped.push(`scripts.${genericName}`);
  skipped.push(`scripts.${fallbackName}`);
}

/**
 * @param {Record<string, any>} packageJson
 * @param {string} dependencyName
 * @returns {boolean}
 */
function hasPackageDependency(packageJson, dependencyName) {
  return ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].some(
    field => isPlainRecord(packageJson[field]) && hasOwn(packageJson[field], dependencyName),
  );
}

/**
 * @param {Record<string, any>} packageJson
 * @returns {string[]}
 */
function rocketNextSteps(packageJson) {
  if (!isPlainRecord(packageJson.scripts)) {
    return ['npx rocket start', 'npx rocket build'];
  }
  return [
    npmScriptCommand(packageJson.scripts, 'start', 'rocket:start', 'rocket start'),
    npmScriptCommand(packageJson.scripts, 'build', 'rocket:build', 'rocket build'),
  ];
}

/**
 * @param {Record<string, any>} scripts
 * @param {string} genericName
 * @param {string} fallbackName
 * @param {string} command
 */
function npmScriptCommand(scripts, genericName, fallbackName, command) {
  if (scripts[genericName] === command) {
    return genericName === 'start' ? 'npm start' : `npm run ${genericName}`;
  }
  if (scripts[fallbackName] === command) {
    return `npm run ${fallbackName}`;
  }
  return `npx rocket ${genericName}`;
}

/**
 * @param {string} filePath
 * @param {string} contents
 * @param {RocketInitResult} result
 */
function writeFileIfMissing(filePath, contents, result) {
  if (existsSync(filePath)) {
    result.skipped.push(filePath);
    return;
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
  result.created.push(filePath);
}

/**
 * @param {string} filePath
 * @param {Record<string, any>} value
 */
function writeJsonFile(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * @param {RocketInitResult} result
 */
function reportInitResult(result) {
  for (const filePath of result.created) {
    console.log(`Created ${filePath}`);
  }
  for (const filePath of result.skipped) {
    console.log(`Skipped ${filePath} (already exists)`);
  }
  if (result.packageJson?.updated.length) {
    console.log(`Updated ${result.packageJson.path}: ${result.packageJson.updated.join(', ')}`);
  } else if (result.packageJson) {
    console.log(`Skipped ${result.packageJson.path} (already configured)`);
  }
  if (result.missingRocketDependency) {
    console.log('Note: package.json does not list @rocket/js. Add it with: npm install @rocket/js');
  }
  console.log('');
  console.log('Next steps:');
  for (const step of result.nextSteps) {
    console.log(`  ${step}`);
  }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, any>}
 */
function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {Record<string, any>} record
 * @param {string} field
 */
function hasOwn(record, field) {
  return Object.prototype.hasOwnProperty.call(record, field);
}
