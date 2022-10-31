import saxWasm from 'sax-wasm';
import { createRequire } from 'module';
import { readFile } from 'fs/promises';

export const { SaxEventType, SAXParser } = saxWasm;

const require = createRequire(import.meta.url);

export const streamOptions = { highWaterMark: 256 * 1024 };
const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
const saxWasmBuffer = await readFile(saxPath);
export const parser = new SAXParser(SaxEventType.CloseTag, streamOptions);

await parser.prepareWasm(saxWasmBuffer);


// import saxWasm from 'sax-wasm';
// import { createRequire } from 'module';
// import { readFile } from 'fs/promises';

// export const { SaxEventType, SAXParser } = saxWasm;

// const require = createRequire(import.meta.url);

// export const streamOptions = { highWaterMark: 128 * 1024 };
// const saxPath = require.resolve('sax-wasm/lib/sax-wasm.wasm');
// const saxWasmBuffer = await readFile(saxPath);
// export const parser = new SAXParser(SaxEventType.CloseTag, streamOptions);

// await parser.prepareWasm(saxWasmBuffer);
