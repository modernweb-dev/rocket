/** Runs on: imported-md-string */
import { html } from 'lit';
import { document } from './layout-helper.js';
import { resolve } from '../resolve.js';
import { addBootstrapIconLibrary } from '../icons.js';

/** @type {import('@rocket/js/types.js').Layout<null>} */
export const layout = data => {
  addBootstrapIconLibrary(data);
  return document(data, data.content, {
    menu: 'html',
    headerContent: html`
      <link
        rel="stylesheet"
        href="${resolve('@rocket/js/docs/assets/prism-one-light.css', import.meta)}"
      />
      <link
        rel="stylesheet"
        href="${resolve('@awesome.me/webawesome/dist/styles/webawesome.css', import.meta)}"
      />
    `,
  });
};

/** @type {import('@rocket/js/types.js').Layout<null>} */
export const singleDemoLayout = data => {
  addBootstrapIconLibrary(data);
  return document(data, data.content, {
    menu: false,
    headerContent: html`
      <link
        rel="stylesheet"
        href="${resolve('@awesome.me/webawesome/dist/styles/webawesome.css', import.meta)}"
      />
      <link
        rel="stylesheet"
        href="${resolve('@rocket/js/docs/assets/prism-one-light.css', import.meta)}"
      />
      <style>
        body {
          line-height: 24px;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          width: clamp(70%, 80em, 98%);
        }
      </style>
    `,
  });
};

export { addBootstrapIconLibrary };
