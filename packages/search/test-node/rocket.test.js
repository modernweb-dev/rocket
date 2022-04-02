import chai from 'chai';
import { prepareTestCli } from '@rocket/cli/test-helpers';

const setupTestCli = prepareTestCli(import.meta.url);

const { expect } = chai;

describe('Search', () => {
  it('01: writes the search index', async () => {
    const { build, readOutput, readPublic } = await setupTestCli(
      'fixtures/01-single-page/',
      undefined,
      {
        buildOptimize: true,
      },
    );
    await build();

    const indexString =
      '{"index":{"_tree":{"my":{"":{"2":{"df":1,"ds":{"0":2}}}},"castle":{"":{"2":{"df":1,"ds":{"0":1}}}},"i":{"s":{"":{"2":{"df":1,"ds":{"0":1}}}},"":{"2":{"df":1,"ds":{"1":1}}}},"a":{"bout":{"":{"1":{"df":1,"ds":{"1":1}}}},"m":{"":{"2":{"df":1,"ds":{"1":1}}}}},"h":{"ome":{"":{"0":{"df":2,"ds":{"0":1,"1":1}},"1":{"df":1,"ds":{"0":1}},"2":{"df":1,"ds":{"0":1}}}},"uman":{"":{"2":{"df":1,"ds":{"1":1}}}}}},"_prefix":""},"documentCount":2,"nextId":2,"documentIds":{"0":"/","1":"/#about"},"fieldIds":{"title":0,"headline":1,"body":2,"section":3},"fieldLength":{"0":{"0":1,"1":1,"2":5},"1":{"0":1,"1":1,"2":3}},"averageFieldLength":{"0":1,"1":1,"2":4},"storedFields":{"0":{"title":"Home","headline":"Home","body":"My home is my castle"},"1":{"title":"Home","headline":"About","body":"I am human"}}}';

    expect(readOutput('rocket-search-index.json')).to.equal(indexString);
    expect(readPublic('rocket-search-index.json')).to.equal(indexString);
  });
});
