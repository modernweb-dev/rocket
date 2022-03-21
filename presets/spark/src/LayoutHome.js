import { Layout } from '@rocket/engine';
import { pageDefaults } from '@rocket/components';
import { html } from 'lit';

export class LayoutHome extends Layout {
  constructor(options) {
    super(options);
    this.options = {
      ...this.options,
      ...pageDefaults({ ...options }),
      ...options,
      head__100: html`
        <link
          rel="preload"
          href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/fluid-type-scale" />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/fluid-space" />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/content" />
      `,
    };
  }
}
