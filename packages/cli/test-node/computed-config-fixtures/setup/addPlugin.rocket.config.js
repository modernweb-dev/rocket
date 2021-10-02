import { addPlugin } from 'plugins-manager';

class Test {
  static dataName = 'test';

  execute() {
    return 'test-value';
  }
}

/** @type {Partial<import("../../../types/main").RocketCliOptions>} */
const config = {
  setupEleventyComputedConfig: [addPlugin(Test)],
};

export default config;
