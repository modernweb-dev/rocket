import { html } from 'lit';
import { baseStyles } from '../styles/baseStyles.js';

export function baseHead({ title, description, permalink }) {
  return html`
    <!-- Global Metadata -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" href="/favicon.svg" />

    <!-- Primary Meta Tags -->
    <title-server-only>${title}</title-server-only>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />

    <!-- Global Styles -->
    <style-server-only> ${baseStyles} </style-server-only>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${permalink}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
  `;
}
