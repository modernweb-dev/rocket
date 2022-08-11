/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Command } from 'commander';
import prompts from 'prompts';
import { underline, bold, gray, green, blue, yellow, red } from 'colorette';
import { mkdir, readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import degit from 'degit';
import { generateGithubActionsDeployment } from './deployment-generator.js';

const EXAMPLES_PATH = `modernweb-dev/rocket/examples/`;
const TARGET_BRANCH = `#main`;
const program = new Command();

const choices = await readFile(new URL('./choices.json', import.meta.url)).then(res =>
  JSON.parse(res),
);

export class CreateCli {
  constructor({ argv = process.argv } = {}) {
    this.argv = argv;

    program
      .option('-t, --template <name>', 'name of the template to use')
      .action(async cliOptions => {
        if (!cliOptions.template) {
          await this.selectTemplate();
        } else {
          await this.setupTemplate(cliOptions.template);
        }
      });
  }

  async start() {
    await program.parseAsync(this.argv);
  }

  async selectTemplate() {
    const { version } = await readFile(new URL('../package.json', import.meta.url)).then(res =>
      JSON.parse(res),
    );

    const intro = [
      `        |          Welcome to ${bold('Rocket')}! ${gray(`(®rocket/create v${version})`)}`,
      `       / \\         Everyone can code a website`,
      `      / _ \\        `,
      `     |.o '.|       You are about to embark upon a new mission 🚀.`,
      `     |'._.'|       `,
      `     |     |       `,
      `   ,'|  |  |\`.     `,
      `  /  |  |  |  \\    If you encounter a problem, visit`,
      `  |,-'--|--'-.|      ${underline('https://github.com/modernweb-dev/rocket/issues')}`,
      `      ( | )        to search or file a new issue`,
      `     ((   ))       `,
      `    ((  :  ))      Follow us: https://twitter.com/modern_web_dev`,
      `     ((   ))       Chat with us: https://rocket.modern-web.dev/chat`,
      `      (( ))        `,
      `       ( )         ${gray('Notes: You can exit any time with Ctrl+C or Esc')}`,
      `        .                 ${gray('A new folder "rocket-<template name>" will be created')}`,
      '        .               ',
      '',
    ].join('\n');
    console.log(intro);

    const response = await prompts({
      type: 'select',
      name: 'template',
      message: 'Which Starter Template would you like to use?',
      choices,
    });
    if (!response.template) {
      console.log('🛑 Aborting mission.');
      process.exit(1);
    }
    if (response.template === '--custom--') {
      console.log(`${yellow('⚠️')} Community built templates are not checked for security.`);
      console.log('You can use your own templates by providing a GitHub repo URL.');
      console.log('For example:');
      console.log('  - user/repo => copies the full repo');
      console.log('  - user/repo/examples/about => copies only the contents of the "about" folder');
      console.log('  - user/repo#branch => use a branch');
      console.log('  - https://github.com/user/repo/path/to/example => use a full url');
      console.log(
        `  ${red('x')} https://github.com/user/repo/tree/main/example => no "tree" in url`,
      );
      console.log(
        '  - Supports GitLab, BitBucket, Sourcehut => see https://github.com/Rich-Harris/degit#basics',
      );
      console.log('');

      const response = await prompts({
        type: 'text',
        name: 'custom',
        message: 'Enter the URL of your custom template',
      });
      if (!response.custom) {
        console.log('🛑 Aborting mission.');
        process.exit(1);
      }
      await this.setupTemplate(response.custom);
    } else {
      await this.setupTemplate(response.template);
    }
  }

  /**
   * url can be
   * - blog, minimal, ... => official template e.g. all folders in /examples/*
   * - user/repo                    => user/repo on github
   * - github:user/repo             👆
   * - git@github.com:user/repo     👆
   * - https://github.com/user/repo 👆
   * - https://gitlab.com/user/repo => user/repo on gitlab
   * @param {string} url
   */
  async setupTemplate(url) {
    let newFolderPath = path.join('.', `rocket-mission`);
    if (choices.find(choice => choice.value === url)) {
      newFolderPath = path.join('.', `rocket-${url}`);
      url = `${EXAMPLES_PATH}${url}${TARGET_BRANCH}`;
    }

    console.log(`${blue('>')} Fueling up the rocket...`);

    if (existsSync(newFolderPath)) {
      const response = await prompts({
        type: 'confirm',
        name: 'forceOverwrite',
        message: `Folder ${newFolderPath} already exists. Continue [force overwrite]?`,
        initial: false,
      });
      if (!response.forceOverwrite) {
        console.log('🛑 Aborting mission.');
        process.exit(1);
      }
    }
    await mkdir(newFolderPath, { recursive: true });

    const degitOptions = {
      cache: false,
      force: true,
      verbose: true,
    };

    let gitHandler;
    let cloneError = false;
    let cloneUrl = url;
    do {
      try {
        gitHandler = degit(cloneUrl, degitOptions);
        console.log(`${blue('>')} Setting a course...`);
        await gitHandler.clone('./' + newFolderPath);
        cloneError = false;
      } catch (e) {
        console.log(`${red('✖')} Could not apply the template - maybe the url is wrong?`);
        console.log(`${red('>')} ${e.message}`);
        const response = await prompts({
          type: 'text',
          name: 'custom',
          message: 'Enter the URL template',
          initial: cloneUrl,
        });
        if (response.custom) {
          cloneUrl = response.custom;
          cloneError = true;
        } else {
          cloneError = false;
          console.log('🛑 Aborting mission.');
          process.exit(1);
        }
      }
    } while (cloneError === true);

    await generateGithubActionsDeployment(newFolderPath);

    console.log(`${green('✔')} Final checks are green!`);
    console.log('');
    console.log('Next steps:');
    console.log(`  1: cd ${newFolderPath}`);
    console.log('  2: npm install (or pnpm install, yarn, etc)');
    console.log('  3: git init && git add -A && git commit -m "Initial commit" (optional step)');
    console.log('  4: npm start (or pnpm, yarn, etc)');
    console.log('');

    console.log('To close the dev server, hit Ctrl-C');
    console.log(`Stuck? Visit us at ${underline('https://rocket.modern-web.dev/chat')}`);
  }
}
