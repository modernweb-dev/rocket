import chai from 'chai';
import chalk from 'chalk';
import { execute } from './test-helpers.js';
import { formatErrors } from 'check-html-links';

const { expect } = chai;

async function executeAndFormat(inPath) {
  const { errors, cleanup } = await execute(inPath);
  return formatErrors(cleanup(errors));
}

describe('formatErrors', () => {
  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
  });

  it('prints a nice summery', async () => {
    const result = await executeAndFormat('fixtures/test-case');
    expect(result.trim().split('\n')).to.deep.equal([
      '1. missing id="my-teams" in fixtures/test-case/price/index.html',
      '  from fixtures/test-case/history/index.html:1:9 via href="/price/#my-teams"',
      '',
      '2. missing file fixtures/test-case/about/images/team.png',
      '  from fixtures/test-case/about/index.html:3:10 via src="./images/team.png"',
      '',
      '3. missing reference target fixtures/test-case/aboot',
      '  from fixtures/test-case/about/index.html:6:11 via href="/aboot"',
      '  from fixtures/test-case/history/index.html:4:11 via href="/aboot"',
      '  from fixtures/test-case/index.html:4:11 via href="/aboot"',
      '  ... 2 more references to this target',
      '',
      '4. missing reference target fixtures/test-case/prce',
      '  from fixtures/test-case/index.html:1:9 via href="./prce"',
    ]);
  });
});
