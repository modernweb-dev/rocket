/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Layout,
  renderJoiningGroup,
  SiteMenu,
  IndexMenu,
  NextMenu,
  PreviousMenu,
  TableOfContentsMenu,
} from '@rocket/engine';
import { html, nothing } from 'lit';
// @ts-ignore
import { pageDefaults } from '@rocket/components';

export class LayoutMain extends Layout {
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
    ...pageDefaults({ ...this.options }),
    bodyClasses: {
      ...this.options.bodyClasses,
    },
    headerHideLogo: false,
    headerNoBackground: false,
    headerNotSticky: false,
    headerDarkBackground: false,
    dsdPending: true,
    siteName: 'Rocket',
    logoSmall: html`
      <picture>
        <!-- <source srcset="resolve:@rocket/launch/assets/rocket-logo-dark.svg" media="(prefers-color-scheme: dark)"> -->
        <img
          src="resolve:@rocket/launch/assets/rocket-logo-light.svg"
          alt="Rocket Logo"
          width="250"
          height="67.87"
        />
      </picture>
    `,
    gitSiteUrl: 'https://github.com/modernweb-dev/rocket',
    gitBranch: 'next',
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
    titleWrapperFn: title => (title ? `${title} | ${this.options.siteName}` : ''),
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
          <meta name="color-scheme" content="light" />

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
          href="/fonts/Rubik-VariableFont_wght.woff2"
          as="font"
          type="font/woff2"
          crossorigin
          fetchpriority="low"
        />

        <link rel="stylesheet" href="resolve:@rocket/launch/css/variables.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/layout.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/markdown.css" />
      `,

      head__50: html`
        <style>
          body[dsd-pending] {
            display: none;
          }
        </style>
      `,

      header__10: html`
        <a class="logo-link" href="/" slot="logo">
          ${this.options.logoSmall}
          <span>${this.options.siteName}</span>
        </a>
      `,

      header__50: data =>
        this.options.pageTree.renderMenu(new SiteMenu(), data.sourceRelativeFilePath),

      header__60: () =>
        html`
          ${this.options.socialLinks.map(
            socialLink => html`
              <rocket-social-link
                url="${socialLink.url}"
                name="${socialLink.name}"
                siteName=${this.options.siteName}
                slot="social"
              ></rocket-social-link>
            `,
          )}
        `,

      drawer__10: html`
        <a class="logo-link" href="/">
          ${this.options.logoSmall}
          <span>${this.options.siteName}</span>
        </a>
      `,

      drawer__20: html`
        <div class="drawer-social">
          ${this.options.socialLinks.map(
            socialLink => html`
              <rocket-social-link
                url="${socialLink.url}"
                name="${socialLink.name}"
                siteName=${this.options.siteName}
              ></rocket-social-link>
            `,
          )}
        </div>
      `,

      drawer__50: data =>
        this.options.pageTree.renderMenu(new IndexMenu(), data.sourceRelativeFilePath),

      sidebar__100: data =>
        this.options.pageTree.renderMenu(new IndexMenu(), data.sourceRelativeFilePath),

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
                .gitBranch}/site/pages/${data.sourceRelativeFilePath}"
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
    };
  }

  renderHeader() {
    return html`
      <rocket-header
        ?hide-logo=${this.options.headerHideLogo}
        ?no-background=${this.options.headerNoBackground}
        ?not-sticky=${this.options.headerNotSticky}
        ?dark-background=${this.options.headerDarkBackground}
      >
        ${renderJoiningGroup('header', this.options, this.data)}
        <rocket-drawer slot="mobile-menu" loading="hydrate:onMedia('(max-width: 1024px)')">
          <div class="drawer">${renderJoiningGroup('drawer', this.options, this.data)}</div>
        </rocket-drawer>
      </rocket-header>
    `;
  }

  renderContent() {
    return html`
      <rocket-content-area>
        <rocket-main>
          <main class="markdown-body">
            ${renderJoiningGroup('content', this.options, this.data)}
          </main>
          <aside slot="toc">
            ${this.options.pageTree.renderMenu(
              new TableOfContentsMenu(),
              this.data.sourceRelativeFilePath,
            )}
          </aside>
        </rocket-main>
      </rocket-content-area>
    `;
  }
}
