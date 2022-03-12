/* eslint-disable @typescript-eslint/ban-ts-comment */
import { html } from 'lit';

export function pageDefaults({ pageTree, titleWrapperFn, description, siteName }) {
  return {
    ...defaultHead({ pageTree, titleWrapperFn, description, siteName }),
    ...defaultPolyfills(),
  };
}

export function defaultHead({ pageTree, titleWrapperFn, description, siteName }) {
  return {
    head__10: data => {
      const useDescription = data.description ? data.description : description;
      const title = titleWrapperFn(
        // @ts-ignore
        pageTree.getPage(data.sourceRelativeFilePath)?.model?.name,
      );
      return html`
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title-server-only>${title}</title-server-only>
        <meta property="og:title" content="${title}" />

        <meta name="generator" content="rocket 0.1" />

        <meta name="description" content="${useDescription}" />
        <meta property="og:description" content="${useDescription}" />

        <link rel="canonical" href="${data.url}" />
        <meta property="og:url" content="${data.url}" />
      `;
    },
    head__20: html`
      <link rel="icon" href="/favicon.ico" sizes="any" /><!-- 32x32 -->
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" /><!-- 180x180 -->
      <link rel="manifest" href="/site.webmanifest" />
    `,
    head__30: html`
      <meta property="og:site_name" content="${siteName}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    `,
    head__50: html`
      <style>
        body[dsd-pending] {
          display: none;
        }
      </style>
    `,
  };
}

export function defaultPolyfills() {
  return {
    top__10: () => html`
      <script>
        if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
          document.body.removeAttribute('dsd-pending');
        }
      </script>
    `,
    bottom__70: () => html`
      <script type="module">
        (async () => {
          if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
            const { hydrateShadowRoots } = await import(
              '@webcomponents/template-shadowroot/template-shadowroot.js'
            );
            hydrateShadowRoots(document.body);
            document.body.removeAttribute('dsd-pending');
          }
        })();
      </script>
    `,
  };
}
