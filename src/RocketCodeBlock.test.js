import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { RocketCodeBlock } from './RocketCodeBlock.js';

describe('Test RocketCodeBlock', () => {
  it('01: copies the exact authored code payload', async () => {
    const code = 'const message = "hello, Rocket!";\nconsole.log(`${message}`);';
    const block = new RocketCodeBlock();
    block.encodedCode = Buffer.from(code, 'utf8').toString('base64');
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    let copiedText = '';

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          /**
           * @param {string} text
           */
          async writeText(text) {
            copiedText = text;
          },
        },
      },
    });

    try {
      await block.copyCode();
      assert.equal(block._copyState, 'success');
    } finally {
      block.disconnectedCallback();
      if (navigatorDescriptor) {
        Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'navigator');
      }
    }

    assert.equal(copiedText, code);
  });

  it('02: shows an error state when clipboard writing fails', async () => {
    const block = new RocketCodeBlock();
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    const testConsole = globalThis['console'];
    const consoleErrorDescriptor = Object.getOwnPropertyDescriptor(testConsole, 'error');

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          async writeText() {
            throw new Error('Clipboard unavailable');
          },
        },
      },
    });
    Object.defineProperty(testConsole, 'error', {
      configurable: true,
      value() {},
    });

    try {
      await block.copyCode();
      assert.equal(block._copyState, 'error');
    } finally {
      block.disconnectedCallback();
      if (consoleErrorDescriptor) {
        Object.defineProperty(testConsole, 'error', consoleErrorDescriptor);
      }
      if (navigatorDescriptor) {
        Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'navigator');
      }
    }
  });

  it('03: protects slotted code blocks from page-level pre styles', () => {
    const styles = RocketCodeBlock.styles.cssText;

    assert.match(styles, /::slotted\(pre\)\s*{[^}]*margin: 0 !important;/);
    assert.match(styles, /::slotted\(pre\)\s*{[^}]*border-radius: 0 !important;/);
    assert.match(styles, /\.terminal ::slotted\(pre\)\s*{[^}]*background:[^;]*!important;/);
    assert.match(styles, /\.terminal ::slotted\(pre\)\s*{[^}]*--rocket-code-line-number-color:/);
  });

  it('04: keeps shell-language Code Blocks dark before component upgrade', () => {
    const prismStyles = readFileSync(
      new URL('../docs/assets/prism-one-light.css', import.meta.url),
      'utf8',
    );

    assert.match(prismStyles, /rocket-code-block:where\(/);
    for (const language of ['bash', 'console', 'sh', 'shell', 'shell-session', 'terminal', 'zsh']) {
      assert.match(prismStyles, new RegExp(`\\[language='${language}'\\]`));
    }
    assert.match(prismStyles, /color-scheme: dark;/);
    assert.match(prismStyles, /background: #0d1117;/);
    assert.match(prismStyles, /> code\[class\*='language-'\]\s*{[^}]*background: transparent;/);
  });
});
