const path = require('path');
const fs = require('fs');
const { processLocalReferences } = require('./processLocalReferences.cjs');

function inlineFilePath(filePath) {
  let data = fs.readFileSync(filePath, function (err, contents) {
    if (err) {
      throw new Error(err);
    }
    return contents;
  });
  return data.toString('utf8');
}

const rocketFilters = {
  configFunction: (eleventyConfig, { _inputDirCwdRelative }) => {
    eleventyConfig.addFilter('asset', function (inPath) {
      return inPath.replace('_assets/', '_merged_assets/');
    });

    eleventyConfig.addFilter('toAbsPath', function (inPath) {
      return path.join(_inputDirCwdRelative, inPath);
    });

    eleventyConfig.addFilter('inlineFilePath', inlineFilePath);

    eleventyConfig.addTransform('processLocalReferences', processLocalReferences);
  },
};

module.exports = rocketFilters;
