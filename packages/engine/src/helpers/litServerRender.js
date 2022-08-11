import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';

/**
 * @param {string} templateResult
 * @returns {Promise<string>}
 */
export async function litServerRender(templateResult) {
  const ssrResult = render(templateResult);
  let outputString = '';
  for (const chunk of ssrResult) {
    outputString += chunk;
  }
  // TODO: lit-ssr has a bug where it does not handle dynamic content in <title>, <body>, <html>, ...
  // https://github.com/lit/lit/issues/2441
  // we are now writing <body-server-only> in the template and before we write the file we remove the `-server-only` part
  // this probably means you can NOT hydrate templates if they or their sub-templates are using a `<*-server-only>` tag
  outputString = outputString.replace(/<title-server-only><!--lit-part-->/g, '<title>');
  outputString = outputString.replace(/<!--\/lit-part--><\/title-server-only>/g, '</title>');
  outputString = outputString.replace(/<(.*?)-server-only/g, '<$1');

  // TODO: remove workaround once https://github.com/lit/lit/issues/2470 is fixed
  // we remove <?> from the source code as it's html that requires error handling and some versions of sax-wasm can not handle it
  outputString = outputString.replace(/<\?>/g, '<!---->');

  return outputString;
}
