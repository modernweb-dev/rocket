import fs from 'fs';
import saxWasm from 'sax-wasm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const { SaxEventType, SAXParser } = saxWasm;

const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = fs.readFileSync(saxPath);

export async function getIdBlocksOfHtml({ html, url }) {
  const parser = new SAXParser(
    SaxEventType.Attribute |
      SaxEventType.OpenTag |
      SaxEventType.OpenTagStart |
      SaxEventType.Text |
      SaxEventType.CloseTag,
    { highWaterMark: 256 * 1024 }, // 256k chunks
  );
  await parser.prepareWasm(saxWasmBuffer);

  const startExcludeMainOpening = html.indexOf('>', html.indexOf('<main')) + 1;
  const mainHtml = html.substring(startExcludeMainOpening, html.indexOf('</main>'));

  const blocks = [];
  let captureText = true;
  let insideHeading = false;
  let block = { text: '', headline: '', url };
  parser.eventHandler = (ev, data) => {
    if (ev === SaxEventType.OpenTagStart) {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(data.name)) {
        insideHeading = true;
        captureText = false;
        block.text = block.text.trim();
        block.headline = block.headline.trim();
        if (block.text !== '') {
          blocks.push(block);
          block = { text: '', headline: '', url };
        }
      }
    }

    if (captureText && ev === SaxEventType.Text) {
      block.text += data.value;
    }
    if (insideHeading && ev === SaxEventType.Text) {
      block.headline += data.value;
    }

    if (insideHeading && ev === SaxEventType.Attribute) {
      if (data.name.toString() === 'id') {
        block.url += `#${data.value}`;
      }
    }

    if (ev === SaxEventType.CloseTag) {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(data.name)) {
        captureText = true;
        insideHeading = false;
      } else {
        block.text += ' ';
      }
    }
  };

  parser.write(Buffer.from(mainHtml));
  parser.end();

  block.text = block.text.trim();
  block.headline = block.headline.trim();
  if (block.text !== '') {
    blocks.push(block);
  }
  return blocks;
}
