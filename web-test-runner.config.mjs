import fs from 'fs';
import { playwrightLauncher } from '@web/test-runner-playwright';

const packages = fs
  .readdirSync('packages')
  .filter(
    dir =>
      fs.statSync(`packages/${dir}`).isDirectory() && fs.existsSync(`packages/${dir}/test-web`),
  );

export default {
  files: 'packages/*/test-web/**/*.test.{js,ts}',
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'chromium' }),
    // playwrightLauncher({ product: 'webkit' }),
  ],
  groups: packages.map(pkg => {
    return {
      name: pkg,
      files: `packages/${pkg}/test-web/**/*.test.js`,
    };
  }),
};
