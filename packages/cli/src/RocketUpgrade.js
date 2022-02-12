/* eslint-disable */
// @ts-nocheck

import { readdir, rename, writeFile } from 'fs/promises';
import path from 'path';

import { upgrade202109menu } from './upgrades/upgrade202109menu.js';
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
  static pluginName = 'RocketUpgrade';
  commands = ['upgrade'];

  /**
   * @param {object} options
   * @param {RocketCliOptions} options.config
   * @param {any} options.argv
   */
  async setup({ config, argv }) {
    this.__argv = argv;
    this.config = config;
  }

  async upgradeCommand() {
    if (!this?.config?._inputDirCwdRelative) {
      return;
    }

    const backupPath = path.join(this.config._inputDirCwdRelative, '..', 'docs_backup');
    await copy(this.config._inputDirCwdRelative, backupPath);
    console.log(`A backup of your docs folder has been created at ${backupPath}.`);

    let files = await getAllFiles({
      rootDir: this.config._inputDirCwdRelative,
      currentDir: this.config._inputDirCwdRelative,
    });
    /** @type {FolderRename[]} */
    let folderRenames = [];

    const upgrade = await upgrade202109menu({ files, folderRenames });
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
        files[i].updatedPath = path.join(this.config._inputDirCwdRelative, file.updatedRelPath);
      }
      i += 1;
    }

    // create absolute paths for renames
    i = 0;
    for (const renameObj of folderRenames) {
      folderRenames[i].fromAbsolute = path.join(this.config._inputDirCwdRelative, renameObj.from);
      folderRenames[i].toAbsolute = path.join(this.config._inputDirCwdRelative, renameObj.to);
      i += 1;
    }

    await updateFileSystem({
      files,
      folderRenames: orderedFolderRenames,
    });
  }
}
