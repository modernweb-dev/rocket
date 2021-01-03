/* eslint-disable @typescript-eslint/ban-ts-comment */
import puppeteer from 'puppeteer';
import chai from 'chai';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { rollup } from 'rollup';
import { startDevServer } from '@web/dev-server';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir = path.resolve(__dirname, '..', 'dist');
const { expect } = chai;

describe('spa integration tests', () => {
  let server;
  /** @type {import('puppeteer').Browser} */
  let browser;

  before(async () => {
    server = await startDevServer({
      config: {
        port: 8081,
        rootDir,
      },
      readCliArgs: false,
      readFileConfig: false,
      logStartMessage: false,
      clearTerminalOnReload: false,
    });
    browser = await puppeteer.launch();
    rimraf.sync(rootDir);
  });

  after(async () => {
    await browser.close();
    await server.stop();
  });

  [
    //
    'js/rollup.spa.config.mjs',
    // 'js/rollup.spa-nomodule.config.js',
  ].forEach(testCase => {
    describe(`testcase ${testCase}`, function describe() {
      this.timeout(30000);
      let page;

      before(async () => {
        rimraf.sync(rootDir);
        const configPath = path.join(__dirname, '..', 'demo', testCase);
        const config = (await import(configPath)).default;
        const bundle = await rollup(config);
        if (Array.isArray(config.output)) {
          await Promise.all([bundle.write(config.output[0]), bundle.write(config.output[1])]);
        } else {
          await bundle.write(config.output);
        }

        page = await browser.newPage();
        await page.goto('http://localhost:8081/', {
          waitUntil: 'networkidle0',
        });
      });

      after(() => {
        rimraf.sync(rootDir);
      });

      it('passes the in-browser tests', async () => {
        // @ts-ignore
        const browserTests = await page.evaluate(() => window.__tests);
        expect(browserTests).to.eql({
          partialCSS: true,
          litElement: true,
          startsWith: true,
          map: true,
          asyncFunction: true,
          forOf: true,
          optionalChaining: true,
          nullishCoalescing: true,
          asyncIterator: true,
        });
      });

      it('outputs a service worker', () => {
        expect(fs.existsSync(path.join(rootDir, 'service-worker.js'))).to.be.true;
      });
    });
  });
});
