const rocketCopy = {
  configFunction: (eleventyConfig, { _inputDirCwdRelative, filesExtensionsToCopy }) => {
    eleventyConfig.addPassthroughCopy(`${_inputDirCwdRelative}/**/*.{${filesExtensionsToCopy}}`);
  },
};

module.exports = rocketCopy;
