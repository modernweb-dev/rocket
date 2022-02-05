/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import path from 'path';

import fs from 'fs-extra';
import { fileURLToPath } from 'url';

export class RocketInit {
  /**
   * @param {RocketCliOptions} config
   */
  async setupCommand(program, cli) {
    this.cli = cli;

    program
      .command('init')
      .option(
        '-o, --output-dir <path>',
        'path to where to put the source files [default to current directory]',
      )
      .action(async cliOptions => {
        // cli.setOptions(cliOptions);
        this.outputDir = cliOptions.outputDir ? path.resolve(cliOptions.outputDir) : process.cwd();

        await this.init();
      });
  }

  async init() {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const initFilesDir = path.join(moduleDir, 'init-files');
    const packageJsonPath = path.join(this.outputDir, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      await fs.writeJson(packageJsonPath, {});
    }

    await fs.copy(initFilesDir, this.outputDir, {
      errorOnExist: true,
      filter: file => !(file.endsWith('_gitignore') || file.endsWith('README.md')),
    });

    const packageJson = await fs.readJson(packageJsonPath);

    await fs.writeJson(
      packageJsonPath,
      {
        ...packageJson,
        type: 'module',
        scripts: {
          ...packageJson.scripts,
          start: 'DEBUG=engine:rendering rocket start --open',
          build: 'DEBUG=engine:rendering rocket build',
        },
      },
      { spaces: 2 },
    );

    const gitignorePath = path.join(this.outputDir, '.gitignore');
    await fs.ensureFile(gitignorePath);
    await fs.appendFile(
      gitignorePath,
      await fs.readFile(path.join(initFilesDir, '_gitignore'), 'utf8'),
    );

    const readmePath = path.join(this.outputDir, 'README.md');
    await fs.ensureFile(readmePath);
    await fs.appendFile(
      readmePath,
      await fs.readFile(path.join(initFilesDir, '_gitignore'), 'utf8'),
    );

    console.log('All files have been created 🎉');
    console.log('Start developing by running `npm start`');

    process.exit(0);
  }
}
