import { readFile, writeFile } from 'fs/promises';
import { mdToMdInJs, mdInJsToMdHtmlInJs, mdHtmlToJsTemplate } from './markdown.js';
// import { mdToJsWithMd,  } from './mdToJsWithMd.js';

/**
 * @param {string} filePath
 */
export async function convertMdFile(filePath) {
  const mdContent = (await readFile(filePath)).toString();

  const mdInJs = mdToMdInJs(mdContent);
  const mdInJsFilePath = filePath.replace('.rocket.md', '.rocketGeneratedMdInJs.js');
  await writeFile(mdInJsFilePath, mdInJs, 'utf8');

  const mdHtmlInJs = await mdInJsToMdHtmlInJs(mdInJsFilePath);
  const jsTemplate = mdHtmlToJsTemplate(mdHtmlInJs);
  const jsTemplateFilePath = filePath.replace('.rocket.md', '.rocketGeneratedFromMd.js');

  // console.log({ mdContent: mdContent.toString() });

  // const jsWithMd = await mdToJsWithMd(mdContent.toString());

  // const toImportFilePath = mdFilePathToJsFilePath(filePath);
  await writeFile(jsTemplateFilePath, jsTemplate);
  return jsTemplateFilePath;
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function mdFilePathToJsFilePath(filePath) {
  return filePath.replace(/\.rocket\.md$/, '.rocketGeneratedFromMd.js');
}
