import chai from 'chai';
import { parse, init } from 'es-module-lexer';
import { getImportNames, importsToImportNames } from '../src/file-header/import-names.js';

const { expect } = chai;

await init;

describe('import names', () => {
  describe('getImportNames', () => {
    it('multiple imports', async () => {
      expect(getImportNames(`import { html, nothing } from 'lit';`)).to.deep.equal([
        'html',
        'nothing',
      ]);
    });

    it('as imports', async () => {
      expect(getImportNames(`import { html as litHtml } from 'lit';`)).to.deep.equal(['litHtml']);
    });

    it('multiline multiple imports', async () => {
      expect(getImportNames(`import { \nhtml,\n nothing\n } from 'lit';`)).to.deep.equal([
        'html',
        'nothing',
      ]);
    });

    it('side effect import', async () => {
      expect(getImportNames(`import 'my-pkg';`)).to.deep.equal([]);
    });
  });

  describe('importsToImportNames', () => {
    it('multiple imports', async () => {
      const source = [
        //
        "import { html, nothing } from 'lit';",
        "import { doIt } from 'nike';",
      ].join('\n');
      const [imports] = parse(source);
      expect(importsToImportNames(imports, source)).to.deep.equal(['html', 'nothing', 'doIt']);
    });
  });
});
