import { readFile, writeFile } from 'fs/promises';
import { htmlToJsTemplate } from './formats/html.js';
import { mdToMdInJs, mdInJsToMdHtmlInJs, mdHtmlToJsTemplate } from './markdown.js';

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

  await writeFile(jsTemplateFilePath, jsTemplate);
  return jsTemplateFilePath;
}

/**
 * @param {string} filePath
 */
export async function convertHtmlFile(filePath) {
  const htmlContent = (await readFile(filePath)).toString();

  const jsTemplate = htmlToJsTemplate(htmlContent);
  const jsTemplateFilePath = filePath.replace('.rocket.html', '-converted-html.js');

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
