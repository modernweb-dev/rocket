import { readFile } from 'fs/promises';
import matter from 'gray-matter';

/** @typedef {import('../../types/upgrade.js').upgrade} upgrade */

/**
 *
 * @param {upgrade} options
 */
export async function upgrade202109menu({ files, folderRenames }) {
  let i = 0;

  const updatedFolderRenames = [...folderRenames];
  for (const fileData of files) {
    if (fileData.extName === '.md') {
      const content = (await readFile(fileData.path)).toString();
      const lines = content.split('\n');
      const { title, lineNumber } = extractTitle(content);
      let order = 0;
      if (title && lineNumber >= 0) {
        const parsedTitle = parseTitle(title);
        order = parsedTitle.order;
        lines[lineNumber] = `# ${parsedTitle.title}`;
        files[i].updatedContent = lines.join('\n');
      }
      if (lines[0] === '---') {
        const fmObj = matter(content);
        if (fmObj.data.eleventyNavigation) {
          const eleventyNav = fmObj.data.eleventyNavigation;
          if (eleventyNav.order) {
            order = eleventyNav.order;
            delete fmObj.data.eleventyNavigation.order;
          }
          if (eleventyNav.key) {
            fmObj.data.menu = { ...fmObj.data.menu, linkText: eleventyNav.key };
            delete fmObj.data.eleventyNavigation.key;
          }
          if (eleventyNav.parent) {
            delete fmObj.data.eleventyNavigation.parent;
          }
          if (Object.keys(eleventyNav).length === 0) {
            delete fmObj.data.eleventyNavigation;
          }
        }

        if (!title && fmObj.data.title) {
          fmObj.content = `\n# ${fmObj.data.title}\n${fmObj.content}`;
          delete fmObj.data.title;
        }

        if (fmObj.data.eleventyExcludeFromCollections) {
          fmObj.data.menu = { ...fmObj.data.menu, exclude: true };
          delete fmObj.data.eleventyExcludeFromCollections;
        }

        if (Object.keys(fmObj.data).length > 0) {
          files[i].updatedContent = matter.stringify(fmObj.content, fmObj.data);
        }
      }
      if (order !== 0) {
        if (fileData.relPath.toLowerCase().endsWith('index.md')) {
          const pathParts = fileData.relPath.split('/');
          const originDirParts = [...pathParts];
          originDirParts.pop();
          pathParts[pathParts.length - 2] = `${order}--${pathParts[pathParts.length - 2]}`;
          const dirParts = [...pathParts];
          dirParts.pop();
          updatedFolderRenames.push({ from: originDirParts.join('/'), to: dirParts.join('/') });
        } else {
          files[i].updatedName = `${order}--${fileData.name}`;
        }
      }
    }
    i += 1;
  }

  return { files, folderRenames: updatedFolderRenames };
}

/**
 * Reads a text and extracts a title from it
 *
 * @param {string} content The text where to extract the title from
 * @param {string} engine
 */
export function extractTitle(content, engine = 'md') {
  if (engine === 'md') {
    let captureHeading = true;
    let i = 0;
    for (const line of content.split('\n')) {
      if (line.startsWith('```')) {
        captureHeading = !captureHeading;
      }
      if (captureHeading && line.startsWith('# ')) {
        return { title: line.substring(2), lineNumber: i };
      }
      i += 1;
    }
  }
  return { title: '', lineNumber: -1 };
}

/**
 * Parses a title and extracts the relevante data for it.
 * A title can contain
 * - ">>" to define a parent => child relationship
 * - "||" to define the order for this page
 *
 * @example
 * Foo ||3
 * Foo >> Bar ||10
 *
 * @param {string} inTitle
 * @return {{ title: string, order: number }}
 */
export function parseTitle(inTitle) {
  if (typeof inTitle !== 'string') {
    throw new Error('You need to provide a string to `parseTitle`');
  }

  let title = inTitle;
  let order = 0;
  let navigationTitle = title;
  if (title.includes('>>')) {
    const parts = title
      .split('>>')
      .map(part => part.trim())
      .filter(Boolean);
    title = parts.join(' ');
    navigationTitle = parts[parts.length - 1];
    if (parts.length >= 2) {
      title = `${parts[0]}: ${parts[1]}`;
      const parentParts = [...parts];
      parentParts.pop();
      if (parts.length >= 3) {
        title = `${parts[parts.length - 2]}: ${parts[parts.length - 1]}`;
      }
    }
  }

  if (title.includes('||')) {
    const parts = title
      .split('||')
      .map(part => part.trim())
      .filter(Boolean);
    if (parts.length !== 2) {
      throw new Error('You can use || only once in `parseTitle`');
    }

    navigationTitle = navigationTitle.split('||').map(part => part.trim())[0];
    title = parts[0];
    order = parseInt(parts[1]);
  }
  return {
    title: navigationTitle,
    order,
  };
  // data.parts = titleParts;
  // data.title = title;
  // data.eleventyNavigation = {
  //   key,
  //   title: navigationTitle,
  //   order,
  // };
  // if (parent) {
  //   data.eleventyNavigation.parent = parent;
  // }
  // return data;
}
