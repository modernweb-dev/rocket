/* eslint-disable */
// @ts-nocheck

import { readdir, rename, writeFile } from 'fs/promises';
import path from 'path';

import { upgrade202203menu } from './upgrades/upgrade202203menu.js';
import { copy } from 'fs-extra';

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('../types/upgrade').UpgradeFile} UpgradeFile */
/** @typedef {import('../types/upgrade').FolderRename} FolderRename */
/** @typedef {import('../types/upgrade').upgrade} upgrade */

/**
 * @param {UpgradeFile} options
 * @returns {boolean}
 */
function filterMerged({ relPath }) {
  return relPath.startsWith('_merged');
}

/**
 *
 * @param {object} options
 * @param {string} options.rootDir
 * @param {string} options.currentDir
 * @param {(options: UpgradeFile) => Boolean} [options.filter]
 * @returns
 */
async function getAllFiles(options) {
  const { rootDir, currentDir, filter = filterMerged } = options;
  const entries = await readdir(currentDir, { withFileTypes: true });
  /** @type {UpgradeFile[]} */
  let files = [];
  for (const entry of entries) {
    const { name: folderName } = entry;
    const currentPath = path.join(currentDir, folderName);

    if (entry.isFile()) {
      const relPath = path.relative(rootDir, currentPath);
      /** @type {UpgradeFile} */
      const data = {
        path: currentPath,
        relPath,
        name: path.basename(relPath),
        extName: path.extname(relPath),
      };
      if (!filter(data)) {
        files.push(data);
      }
    }
  }
  for (const entry of entries) {
    const { name: folderName } = entry;
    const currentPath = path.join(currentDir, folderName);

    if (entry.isDirectory()) {
      files = [...files, ...(await getAllFiles({ ...options, currentDir: currentPath }))];
    }
  }
  return files;
}

/**
 *
 * @param {upgrade} options
 */
async function updateFileSystem({ files, folderRenames }) {
  // rename files while not touching folders
  for (const file of files) {
    if (file.updatedName) {
      const newPath = path.join(path.dirname(file.path), file.updatedName);
      await rename(file.path, newPath);
    }
  }
  // rename folders
  for (const renameObj of folderRenames) {
    if (renameObj.fromAbsolute && renameObj.toAbsolute) {
      await rename(renameObj.fromAbsolute, renameObj.toAbsolute);
    }
  }
  // update file content
  for (const file of files) {
    if (file.updatedContent) {
      await writeFile(file.updatedPath || file.path, file.updatedContent);
    }
  }
}

/**
 * @param {string} relPath
 * @param {FolderRename[]} folderRenames
 * @returns {string}
 */
function applyFolderRenames(relPath, folderRenames) {
  let newRelPath = relPath;
  for (const renameObj of folderRenames) {
    if (newRelPath.startsWith(renameObj.from)) {
      newRelPath = renameObj.to + newRelPath.slice(renameObj.from.length);
    }
  }
  return newRelPath;
}

export class RocketUpgrade {
  /** @type {Engine | undefined} */
  engine = undefined;

  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;
    this.active = true;

    program
      .command('upgrade')
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .action(async cliOptions => {
        cli.setOptions(cliOptions);
        cli.activePlugin = this;

        await this.upgrade();
      });
  }

  async upgrade() {
    if (!this.cli.options.inputDir) {
      return;
    }

    const backupPath = path.join(this.cli.options.inputDir, '..', '__backup');
    await copy(this.cli.options.inputDir, backupPath);
    console.log(`A backup of your docs folder has been created at ${backupPath}.`);

    let files = await getAllFiles({
      rootDir: this.cli.options.inputDir,
      currentDir: this.cli.options.inputDir,
    });
    /** @type {FolderRename[]} */
    let folderRenames = [];

    const upgrade = await upgrade202203menu({ files, folderRenames });
    files = upgrade.files;
    folderRenames = upgrade.folderRenames;

    const orderedFolderRenames = [...folderRenames].sort((a, b) => {
      return b.from.split('/').length - a.from.split('/').length;
    });

    // adjust relPath if there is a new filename
    let i = 0;
    for (const fileData of files) {
      if (fileData.updatedName) {
        files[i].updatedRelPath = `${path.dirname(fileData.relPath)}/${fileData.updatedName}`;
      }
      i += 1;
    }

    // adjust relPath to consider renamed folders
    i = 0;
    for (const fileData of files) {
      const modifiedPath = applyFolderRenames(
        fileData.updatedRelPath || fileData.relPath,
        orderedFolderRenames,
      );
      if (modifiedPath !== fileData.relPath) {
        files[i].updatedRelPath = modifiedPath;
      }
      i += 1;
    }

    // add an updatedPath if needed
    i = 0;
    for (const file of files) {
      if (file.updatedRelPath) {
        files[i].updatedPath = path.join(this.cli.options.inputDir, file.updatedRelPath);
      }
      i += 1;
    }

    // create absolute paths for renames
    i = 0;
    for (const renameObj of folderRenames) {
      folderRenames[i].fromAbsolute = path.join(this.cli.options.inputDir, renameObj.from);
      folderRenames[i].toAbsolute = path.join(this.cli.options.inputDir, renameObj.to);
      i += 1;
    }

    // console.log({ files, orderedFolderRenames });

    await updateFileSystem({
      files,
      folderRenames: orderedFolderRenames,
    });
  }
}
