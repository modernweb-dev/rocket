// create a unique, global symbol name
const KEY = Symbol.for('Rocket.computedConfig.key');

// check if the global object has this symbol
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasComputedConfig = globalSymbols.indexOf(KEY) > -1;

// add it if it does not have the symbol, yet
if (!hasComputedConfig) {
  global[KEY] = {};
}

function setComputedConfig(config) {
  global[KEY] = config;
}

function getComputedConfig() {
  return global[KEY];
}

module.exports = {
  setComputedConfig,
  getComputedConfig,
};
