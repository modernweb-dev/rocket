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
          href="/fonts/Rubik-VariableFont_wght.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/fluid-type-scale.css" />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/fluid-space.css" />
        <link rel="stylesheet" href="resolve:@rocket/spark/css/content.css" />
      `,
    };
  }
}
