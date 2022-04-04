import chai from 'chai';

import { evaluateConditions, evaluate } from '../src/hydration/evaluate.js';
import { extractStrategies } from '../src/hydration/extractStrategies.js';
import { validateComponentImportString } from '../src/file-header/validateComponentImportString.js';

const { expect } = chai;

describe('hydration condition', () => {
  describe('evaluateConditions', () => {
    it('direct value', async () => {
      expect(evaluateConditions('1')).to.be.true;
      expect(evaluateConditions('0')).to.be.false;
    });

    it('and', async () => {
      expect(evaluateConditions('0 && 0')).to.be.false;
      expect(evaluateConditions('0 && 1')).to.be.false;
      expect(evaluateConditions('1 && 0')).to.be.false;
      expect(evaluateConditions('1 && 1')).to.be.true;
    });

    it('or', async () => {
      expect(evaluateConditions('0 || 0')).to.be.false;
      expect(evaluateConditions('0 || 1')).to.be.true;
      expect(evaluateConditions('1 || 0')).to.be.true;
      expect(evaluateConditions('1 || 1')).to.be.true;
    });

    it('and or', async () => {
      expect(evaluateConditions('0 && 1 || 1')).to.be.true;
      expect(evaluateConditions('1 && 1 || 0')).to.be.true;
      expect(evaluateConditions('1 || 1 && 0')).to.be.true;
      expect(evaluateConditions('0 || 1 && 0')).to.be.true;
    });
  });

  describe('extractStrategies', () => {
    it('single strategy not default resolveAble', async () => {
      expect(extractStrategies(`onClick`)).to.deep.equal({
        strategyAttribute: 'onClick',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onClick', resolveAble: false }],
      });
      expect(extractStrategies(`onHover`)).to.deep.equal({
        strategyAttribute: 'onHover',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onHover', resolveAble: false }],
      });

      expect(extractStrategies(`onMedia`)).to.deep.equal({
        strategyAttribute: 'onMedia',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onMedia', resolveAble: false }],
      });
      expect(extractStrategies(`onVisible`)).to.deep.equal({
        strategyAttribute: 'onVisible',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onVisible', resolveAble: false }],
      });
    });

    it('single strategy default resolveAble', async () => {
      expect(extractStrategies(`onClientLoad`)).to.deep.equal({
        strategyAttribute: 'onClientLoad',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onClientLoad', resolveAble: true }],
      });
      expect(extractStrategies(`onIdle`)).to.deep.equal({
        strategyAttribute: 'onIdle',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onIdle', resolveAble: true }],
      });
      expect(extractStrategies(`onDelay`)).to.deep.equal({
        strategyAttribute: 'onDelay',
        strategyTemplate: '{{0}}',
        strategies: [{ type: 'onDelay', resolveAble: true }],
      });
    });

    it('options', async () => {
      expect(extractStrategies(`onMedia('(min-width: 768px)')`)).to.deep.equal({
        strategyAttribute: `onMedia('(min-width: 768px)')`,
        strategyTemplate: `{{0}}`,
        strategies: [{ type: 'onMedia', resolveAble: false, options: '(min-width: 768px)' }],
      });
    });

    it('and', async () => {
      expect(extractStrategies(`onVisible && onMedia('(min-width: 768px)')`)).to.deep.equal({
        strategyAttribute: `onVisible && onMedia('(min-width: 768px)')`,
        strategyTemplate: `{{0}} && {{1}}`,
        strategies: [
          { type: 'onVisible', resolveAble: false },
          { type: 'onMedia', resolveAble: false, options: '(min-width: 768px)' },
        ],
      });
    });

    it('or', async () => {
      // desktop: hydrate always
      // mobile: hydrate as it becomes visible
      expect(extractStrategies(`onVisible || onMedia('(min-width: 768px)')`)).to.deep.equal({
        strategyAttribute: `onVisible || onMedia('(min-width: 768px)')`,
        strategyTemplate: `{{0}} || {{1}}`,
        strategies: [
          { type: 'onVisible', resolveAble: false },
          { type: 'onMedia', resolveAble: false, options: '(min-width: 768px)' },
        ],
      });
    });

    it('and + or', async () => {
      // desktop: hydrate as it becomes visible
      // mobile: hydrate on click
      expect(
        extractStrategies(`onVisible && onMedia('(min-width: 768px)') || onClick`),
      ).to.deep.equal({
        strategyAttribute: `onVisible && onMedia('(min-width: 768px)') || onClick`,
        strategyTemplate: `{{0}} && {{1}} || {{2}}`,
        strategies: [
          { type: 'onVisible', resolveAble: false },
          { type: 'onMedia', resolveAble: false, options: '(min-width: 768px)' },
          { type: 'onClick', resolveAble: false },
        ],
      });
    });
  });

  describe('evaluate', () => {
    it('single false', async () => {
      expect(
        evaluate({
          strategyTemplate: '{{0}}',
          strategies: [{ type: 'onClick', resolveAble: false }],
        }),
      ).to.be.false;
    });

    it('single true', async () => {
      expect(
        evaluate({
          strategyTemplate: '{{0}}',
          strategies: [{ type: 'onClick', resolveAble: true }],
        }),
      ).to.be.true;
    });

    it('and', async () => {
      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}}`,
          strategies: [
            { type: 'onVisible', resolveAble: false },
            { type: 'onMedia', resolveAble: false },
          ],
        }),
      ).to.be.false;

      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}}`,
          strategies: [
            { type: 'onVisible', resolveAble: true },
            { type: 'onMedia', resolveAble: false },
          ],
        }),
      ).to.be.false;

      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}}`,
          strategies: [
            { type: 'onVisible', resolveAble: true },
            { type: 'onMedia', resolveAble: true },
          ],
        }),
      ).to.be.true;
    });

    it('or', async () => {
      expect(
        evaluate({
          strategyTemplate: `{{0}} || {{1}}`,
          strategies: [
            { type: 'onVisible', resolveAble: false },
            { type: 'onMedia', resolveAble: false },
          ],
        }),
      ).to.be.false;

      expect(
        evaluate({
          strategyTemplate: `{{0}} || {{1}}`,
          strategies: [
            { type: 'onVisible', resolveAble: false },
            { type: 'onMedia', resolveAble: true },
          ],
        }),
      ).to.be.true;
    });

    it('and + or', async () => {
      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}} || {{2}}`,
          strategies: [
            { type: 'onVisible', resolveAble: false },
            { type: 'onMedia', resolveAble: false },
            { type: 'onClick', resolveAble: true },
          ],
        }),
      ).to.be.true;

      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}} || {{2}}`,
          strategies: [
            { type: 'onVisible', resolveAble: true },
            { type: 'onMedia', resolveAble: true },
            { type: 'onClick', resolveAble: false },
          ],
        }),
      ).to.be.true;

      expect(
        evaluate({
          strategyTemplate: `{{0}} && {{1}} || {{2}}`,
          strategies: [
            { type: 'onVisible', resolveAble: true },
            { type: 'onMedia', resolveAble: false },
            { type: 'onClick', resolveAble: false },
          ],
        }),
      ).to.be.false;
    });
  });

  describe('validateComponentImportString', () => {
    it('allows bare modules', async () => {
      expect(validateComponentImportString('@my-pkg/el/MyEl.js::MyEl')).to.be.true;
      expect(validateComponentImportString('my-pkg/MyEl.js::MyEl')).to.be.true;
    });

    it('allows private imports', async () => {
      expect(validateComponentImportString('#my-private-import/MyEl.js::MyEl')).to.be.true;
    });

    it('allows urls', async () => {
      expect(validateComponentImportString('https://domain.com/my-pkg/MyEl.js::MyEl')).to.be.true;
      expect(validateComponentImportString('//domain.com/my-pkg/MyEl.js::MyEl')).to.be.true;
    });

    it('disallows relative paths', async () => {
      expect(validateComponentImportString('../MyEl.js::MyEl')).to.be.false;
      expect(validateComponentImportString('./MyEl.js::MyEl')).to.be.false;
    });
  });
});
