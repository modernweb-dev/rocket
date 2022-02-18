// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import { TreeModel } from '@d4kmor/tree-model';
import { getHtmlMetaData } from './getHtmlMetaData.js';
import {
  sourceRelativeFilePathToOutputRelativeFilePath,
  sourceRelativeFilePathToUrl,
} from '../urlPathConverter.js';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
// import { html } from 'lit';

/** @typedef {import('../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('../../types/menu.js').TreeModelOfPage} TreeModelOfPage */

/**
 * @param {NodeOfPage} child
 * @param {NodeOfPage} tree
 * @returns {NodeOfPage | undefined}
 */
function findParent(child, tree) {
  return tree.first(
    /** @param {NodeOfPage} node */ node => {
      return (
        child.model.url.startsWith(node.model.url) && node.model.level === child.model.level - 1
      );
    },
  );
}

/**
 * @param {NodeOfPage} child
 * @param {NodeOfPage} tree
 * @returns {NodeOfPage | undefined}
 */
function findSelf(child, tree) {
  return tree.first(
    /** @param {NodeOfPage} node */ node =>
      child.model.sourceRelativeFilePath === node.model.sourceRelativeFilePath,
  );
}

/**
 * @param {TreeModelOfPage} aModel
 * @param {TreeModelOfPage} bModel
 * @returns {boolean}
 */
function hasSameModelValues(aModel, bModel) {
  const a = { ...aModel };
  delete a.children;
  delete a.headlinesWithId;
  const b = { ...bModel };
  delete b.children;
  delete b.headlinesWithId;

  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

/**
 * @param {TreeModelOfPage} a
 * @param {TreeModelOfPage} b
 * @returns {number}
 */
export function modelComparatorFn(a, b) {
  const aOrder = a.menuOrder || 0;
  const bOrder = b.menuOrder || 0;
  return aOrder - bOrder;
}

export class PageTree {
  /**
   * @param {object} options
   * @param {string | URL} options.inputDir
   * @param {string | URL} options.outputDir
   */
  constructor({ inputDir, outputDir }) {
    this.docsDir = inputDir instanceof URL ? inputDir.pathname : inputDir;
    this.outputDir = outputDir instanceof URL ? outputDir.pathname : outputDir;
    this.dataFilePath = path.join(this.docsDir, 'pageTreeData.rocketGenerated.json');
    this.treeModel = new TreeModel({
      modelComparatorFn,
    });
    this.needsAnotherRenderingPass = false;
    this.pageTreeChangedOnSave = false;
  }

  /**
   * @param {string} sourceRelativeFilePath
   */
  async add(sourceRelativeFilePath) {
    const outputRelativeFilePath = sourceRelativeFilePathToOutputRelativeFilePath(
      sourceRelativeFilePath,
    );

    if (!outputRelativeFilePath.endsWith('index.html')) {
      return;
    }

    const outputFilePath = path.join(this.outputDir, outputRelativeFilePath);
    const htmlMetaData = await getHtmlMetaData(outputFilePath);

    const pageData = {
      ...htmlMetaData,
      name: htmlMetaData.h1 || htmlMetaData.title || sourceRelativeFilePath,
      menuLinkText:
        htmlMetaData.menuLinkText ||
        htmlMetaData.h1 ||
        htmlMetaData.title ||
        sourceRelativeFilePath,
      url: sourceRelativeFilePathToUrl(sourceRelativeFilePath),
      outputRelativeFilePath,
      sourceRelativeFilePath: sourceRelativeFilePath,
      level: outputRelativeFilePath.split('/').length - 1,
    };
    const pageModel = this.treeModel.parse(pageData);

    if (this.tree) {
      const self = findSelf(pageModel, this.tree);
      if (self) {
        // UPDATE - only if there is a difference (we do not care about children or headlinesWithId)
        if (!hasSameModelValues(self.model, pageModel.model)) {
          for (const key of Object.keys(pageModel.model)) {
            if (self.model[key] !== pageModel.model[key]) {
              self.model[key] = pageModel.model[key];
            }
          }
          this.needsAnotherRenderingPass = true;
        }
      } else {
        const parent = findParent(pageModel, this.tree);
        if (parent) {
          parent.addChild(pageModel);
        } else {
          throw Error(
            `corrupt page tree - could not find parent of page ${pageData.sourceRelativeFilePath} to add`,
          );
        }
        this.needsAnotherRenderingPass = true;
      }
    } else {
      this.tree = pageModel;
    }
  }

  // /**
  //  * @param {string} sourceRelativeFilePath
  //  */
  // async update(sourceRelativeFilePath) {
  //   // function findSelf(child, tree) {
  //   //   return tree.first(
  //   //     node => child.model.sourceRelativeFilePath === node.model.sourceRelativeFilePath,
  //   //   );
  //   // }
  //   // const { relativeFilePath, outputFilePath } = page;
  //   // const htmlMetaData = await getHtmlMetaData(outputFilePath);
  //   // const outputRelativeFilePath = pathToUrl(sourceRelativeFilePath);
  //   // const pageData = {
  //   //   ...htmlMetaData,
  //   //   url: sourceRelativeFilePathToUrl(sourceRelativeFilePath),
  //   //   outputRelativeFilePath,
  //   //   sourceRelativeFilePath: relativeFilePath,
  //   //   level: outputRelativeFilePath.split('/').length - 1,
  //   // };
  //   // const pageModel = this.treeModel.parse(pageData);
  //   // let tree;
  //   // if (existsSync(pageTreeDataFilePath)) {
  //   //   tree = await restoreFromJsonFile(pageTreeDataFilePath, treeModel);
  //   // } else {
  //   //   tree = pageModel;
  //   // }
  //   // const parent = findParent(pageModel, tree);
  //   // if (parent) {
  //   //   parent.addChild(pageModel);
  //   // }
  //   // console.log(JSON.stringify(tree, null, 2));
  //   // await writeFile(pageTreeDataFilePath, JSON.stringify(tree, null, 2));
  // }

  async restore() {
    if (existsSync(this.dataFilePath)) {
      const content = await readFile(this.dataFilePath);
      const obj = JSON.parse(content.toString());
      this.tree = this.treeModel.parse(obj);
    }
  }

  async save() {
    this.pageTreeChangedOnSave = false;
    const newContent = JSON.stringify(this.tree, null, 2);
    if (existsSync(this.dataFilePath)) {
      const content = await readFile(this.dataFilePath);
      if (content.toString() !== newContent) {
        this.pageTreeChangedOnSave = true;
        await writeFile(this.dataFilePath, newContent);
      }
    } else {
      this.pageTreeChangedOnSave = true;
      if (newContent) {
        await writeFile(this.dataFilePath, newContent);
      }
    }
  }

  /**
   * @param {string} sourceRelativeFilePath
   */
  setCurrent(sourceRelativeFilePath) {
    if (this.tree) {
      const currentNode = this.tree.first(
        /** @param {NodeOfPage} entry */
        entry => entry.model.sourceRelativeFilePath === sourceRelativeFilePath,
      );
      if (currentNode) {
        currentNode.model.current = true;
        for (const parent of currentNode.getPath()) {
          parent.model.active = true;
        }
      }
    }
  }

  removeCurrent() {
    if (this.tree) {
      const currentNode = this.tree.first(
        /** @param {NodeOfPage} entry */
        entry => entry.model.current === true,
      );
      if (currentNode) {
        currentNode.model.current = false;
        for (const parent of currentNode.getPath()) {
          parent.model.active = false;
        }
      }
    }
  }

  /**
   * @param {any} inst
   * @param {string} sourceRelativeFilePath
   * @returns {import('lit').TemplateResult}
   */
  renderMenu(inst, sourceRelativeFilePath) {
    if (this.tree) {
      this.setCurrent(sourceRelativeFilePath);
      inst.currentNode = this.tree.first(
        /** @param {NodeOfPage} entry */
        entry => entry.model.current === true,
      );
      inst.treeModel = this.treeModel;
      const output = inst.render(this.tree);
      this.removeCurrent();
      return output;
    }

    // TODO: should be either "return nothing; or return html``;" but doing "import { html } from 'lit';" breaks it
    // @ts-ignore
    return '';
  }

  /**
   *
   * @param {string} sourceRelativeFilePath
   * @returns {NodeOfPage | undefined}
   */
  getPage(sourceRelativeFilePath) {
    if (this.tree) {
      return this.tree.first(
        /** @param {NodeOfPage} entry */
        entry => entry.model.sourceRelativeFilePath === sourceRelativeFilePath,
      );
    }
    return undefined;
  }

  /**
   * @param {() => boolean} predicate
   * @returns {NodeOfPage[]}
   */
  all(predicate) {
    if (this.tree) {
      return this.tree.all(predicate);
    }
    return [];
  }
}
