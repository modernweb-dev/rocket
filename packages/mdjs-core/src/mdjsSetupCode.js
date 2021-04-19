/** @typedef {import('vfile').VFileOptions} VFileOptions */
/** @typedef {import('unist').Node} Node */
/** @typedef {import('@mdjs/core/types/code').Story} Story */

function mdjsSetupCode({ rootNodeQueryCode = 'document', simulationSettings = {} } = {}) {
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
        invokeStoriesCode.push(`{ key: '${story.key}', story: ${story.key} }`);
      }

      file.data.setupJsCode = [
        '/** script code **/',
        jsCode,
        '/** stories code **/',
        storiesCode,
        '/** stories setup code **/',
        `const rootNode = ${rootNodeQueryCode};`,
        `const stories = [${invokeStoriesCode.join(', ')}];`,
        'let needsMdjsElements = false;',
        `for (const story of stories) {`,
        // eslint-disable-next-line no-template-curly-in-string
        '  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);',
        '  if (storyEl) {',
        `    storyEl.story = story.story;`,
        `    storyEl.key = story.key;`,
        `    needsMdjsElements = true;`,
        `    Object.assign(storyEl, ${JSON.stringify(simulationSettings)});`,
        '  }',
        `};`,
        'if (needsMdjsElements) {',
        `  if (!customElements.get('mdjs-preview')) { import('@mdjs/mdjs-preview/define'); }`,
        `  if (!customElements.get('mdjs-story')) { import('@mdjs/mdjs-story/define'); }`,
        '}',
      ].join('\n');
    }

    return tree;
  }

  return transformer;
}

module.exports = {
  mdjsSetupCode,
};
