/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Layout,
  renderJoiningGroup,
  SiteMenu,
  IndexMenu,
  NextMenu,
  PreviousMenu,
} from '@rocket/engine';
import { html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { readFile } from 'fs/promises';

/**
 * @param {import('fs').PathLike} filePath
 * @returns {Promise<import('lit/directive.js').DirectiveResult>}
 */
async function inlineFile(filePath) {
  const fileContent = await readFile(filePath, 'utf8');
  return unsafeHTML(fileContent.toString());
}

const burgerSvg = await inlineFile(new URL('../assets/burger-menu.svg', import.meta.url));
const socialIcons = {
  discord: await inlineFile(new URL('../assets/brand-logos/discord.svg', import.meta.url)),
  github: await inlineFile(new URL('../assets/brand-logos/github.svg', import.meta.url)),
  gitlab: await inlineFile(new URL('../assets/brand-logos/gitlab.svg', import.meta.url)),
  slack: await inlineFile(new URL('../assets/brand-logos/slack.svg', import.meta.url)),
  telegram: await inlineFile(new URL('../assets/brand-logos/telegram.svg', import.meta.url)),
  twitter: await inlineFile(new URL('../assets/brand-logos/twitter.svg', import.meta.url)),
};

export class LayoutSidebar extends Layout {
  /**
   * Options for this layout.
   *
   * ⚠️ changes effect all following pages using this layout
   * => mostly useful in recursive.data.js and local.data.js files
   *
   * If you want to change only the current page, use `setPageOptions`
   *
   * Example: append html to sidebar only for this page
   * @example
   * layout.setPageOptions(sourceRelativeFilePath,
   *   {
   *     sidebar__70: html`
   *       <p>appended only on this page</p>
   *     `
   *   }
   * );
   *
   * @type {import('../types/layout.js').LayoutSidebarOptions}
   */
  options = {
    ...this.options,
    bodyClasses: {
      ...this.options.bodyClasses,
      'dsd-pending': true,
    },
    siteName: 'Rocket',
    logoSrc: '/icon.svg',
    logoAlt: 'Rocket Logo',
    gitSiteUrl: 'https://github.com/modernweb-dev/rocket',
    gitBranch: 'master',
    description: 'A static site generator for modern web development',
    socialLinks: [
      {
        name: 'GitHub',
        url: 'https://github.com/modernweb-dev/rocket',
      },
      {
        name: 'Slack',
        url: 'https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw',
      },
      {
        name: 'Discord',
        url: 'https://discord.gg/sTdpM2rkKJ',
      },
    ],
    footerMenu: [],
    titleWrapperFn: title => `${title} | ${this.options.siteName}`,
  };

  /**
   * @param {string} sourceRelativeFilePath
   * @param {Partial<import('../types/layout.js').LayoutSidebarOptions>} options
   */
  setPageOptions(sourceRelativeFilePath, options) {
    super.setPageOptions(sourceRelativeFilePath, options);
  }

  /**
   * @param {Partial<import('../types/layout.js').LayoutSidebarOptions>} options
   */
  constructor(options) {
    super(options);
    // @ts-ignore
    this.options = { ...this.options, ...options };

    // set it in two passes so we can us the values above in the templates
    this.options = {
      ...this.options,

      head__10: data => {
        const description = data.description ? data.description : this.options.description;
        const title = this.options.titleWrapperFn(
          // @ts-ignore
          this.options.pageTree.getPage(data.sourceRelativeFilePath)?.model?.name,
        );
        return html`
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <title-server-only>${title}</title-server-only>
          <meta property="og:title" content="${title}" />

          <meta name="generator" content="rocket 0.1" />

          <meta name="description" content="${description}" />
          <meta property="og:description" content="${description}" />

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
        <meta property="og:site_name" content="${this.options.siteName}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      `,
      head__40: html`
        <link
          rel="preload"
          href="/fonts/OpenSans-VariableFont_wdth,wght.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />

        <link rel="stylesheet" href="resolve:@rocket/launch/css/variables.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/layout.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/markdown.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/style.css" />
      `,

      head__50: html`
        <style>
          body[dsd-pending] {
            display: none;
          }
        </style>
      `,

      header__10: html`
        <a class="logo-link" href="/">
          <img src="/icon.svg" alt="${this.options.logoAlt}" />
          <span>${this.options.siteName}</span>
        </a>
      `,

      header__20: () => html`
        <button id="mobile-menu-trigger" data-action="trigger-mobile-menu">
          <span class="sr-only">Show Menu</span>
          ${burgerSvg}
        </button>
      `,

      header__50: data =>
        this.options.pageTree.renderMenu(new SiteMenu(), data.sourceRelativeFilePath),

      header__60: () =>
        html`
          ${this.options.socialLinks.map(
            socialLink => html`
              <a
                class="social-link"
                href="${socialLink.url}"
                aria-label="${this.options.siteName} on ${socialLink.name}"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span class="sr-only">${socialLink.name}</span>
                ${socialLink.image
                  ? html`<img src="${socialLink.image}" alt="${socialLink.alt}" />`
                  : // @ts-ignore
                    socialIcons[socialLink.name.toLowerCase()]}
              </a>
            `,
          )}
        `,

      sidebar__10: html`
        <a class="logo-link" href="/">
          <img src="${this.options.logoSrc}" alt="${this.options.logoAlt}" />
          <span>${this.options.siteName}</span>
        </a>
      `,

      sidebar__100: data =>
        this.options.pageTree.renderMenu(new IndexMenu(), data.sourceRelativeFilePath),

      top__10: () => html`
        <script>
          if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
            document.body.removeAttribute('dsd-pending');
          }
        </script>
      `,

      content__600: data => html`
        <div class="content-previous-next">
          ${this.options.pageTree.renderMenu(new PreviousMenu(), data.sourceRelativeFilePath)}
          ${this.options.pageTree.renderMenu(new NextMenu(), data.sourceRelativeFilePath)}
        </div>
      `,

      content__650: data => html`
        <div class="content-footer">
          <p>
            Caught a mistake or want to contribute to the documentation?
            <a
              href="${this.options.gitSiteUrl}/edit/${this.options
                .gitBranch}/${data.sourceRelativeFilePath}"
              >Edit this page on GitHub!</a
            >
          </p>
        </div>
      `,

      footer__100: html`
        <div id="footer-menu">
          ${this.options.footerMenu.map(
            category => html`
              <nav>
                <h3>${category.name}</h3>
                <ul>
                  ${category.children.map(
                    entry => html`
                      <li>
                        <a href="${entry.href}">${entry.text}</a>
                      </li>
                    `,
                  )}
                </ul>
              </nav>
            `,
          )}
        </div>
      `,

      bottom__50: html`
        <script type="module" src="resolve:@rocket/drawer/define"></script>
        <script type="module" src="resolve:@rocket/launch/js/init-mobile-navigation.js"></script>
      `,

      // @ts-ignore
      bottom__60: data => {
        if (data.renderMode === 'production') {
          return html`<script
            type="module"
            src="resolve:@rocket/launch/js/register-service-worker.js"
          ></script>`;
        }
        return nothing;
      },

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

  renderContent() {
    return html`
      <div id="content-wrapper">
        <div class="content-area">
          <rocket-drawer id="sidebar">
            <nav slot="content" id="sidebar-nav">
              ${renderJoiningGroup('sidebar', this.options, this.data)}
            </nav>
          </rocket-drawer>
          <main class="markdown-body">
            ${renderJoiningGroup('content', this.options, this.data)}
          </main>
        </div>
      </div>
    `;
  }
}
