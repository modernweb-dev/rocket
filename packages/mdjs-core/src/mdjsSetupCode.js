/** @typedef {import('vfile').VFileOptions} VFileOptions */
/** @typedef {import('unist').Node} Node */
/** @typedef {import('@mdjs/core/types/code').Story} Story */

function mdjsSetupCode({
  rootNodeQueryCode = 'document',
  highlightCode = /** @param {string} code */ code => code,
} = {}) {
  /**
   * @param {Node} tree
   * @param {VFileOptions} file
   */
  async function transformer(tree, file) {
    const { stories, jsCode } = file.data;

    file.data.setupJsCode = jsCode;

    if (stories && stories.length > 0) {
      const storiesCode = stories.map(/** @param {Story} story */ story => story.code).join('\n');

      const invokeStoriesCode = [];
      for (const story of stories) {
        let code = '';
        switch (story.type) {
          case 'html':
            code = `\`\`\`html\n${story.code.split('`')[1]}\n\`\`\``;
            break;
          case 'js':
            code = `\`\`\`js\n${story.code}\n\`\`\``;
            break;
          default:
            break;
        }

        let highlightedCode = await highlightCode(code);
        highlightedCode = highlightedCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        invokeStoriesCode.push(
          `{ key: '${story.key}', story: ${story.key}, code: \`${highlightedCode}\` }`,
        );
      }

      file.data.setupJsCode = [
        jsCode,
        storiesCode,
        `const rootNode = ${rootNodeQueryCode};`,
        `const stories = [${invokeStoriesCode.join(', ')}];`,
        `for (const story of stories) {`,
        // eslint-disable-next-line no-template-curly-in-string
        '  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);',
        `  storyEl.codeHasHtml = true;`,
        `  storyEl.story = story.story;`,
        `  storyEl.code = story.code;`,
        `  storyEl.jsCode = \`${jsCode.replace(/`/g, '\\`')}\`;`,
        `};`,
        `if (!customElements.get('mdjs-preview')) { import('@mdjs/mdjs-preview/mdjs-preview.js'); }`,
        `if (!customElements.get('mdjs-story')) { import('@mdjs/mdjs-story/mdjs-story.js'); }`,
      ].join('\n');
    }

    return tree;
  }

  return transformer;
}

module.exports = {
  mdjsSetupCode,
};
