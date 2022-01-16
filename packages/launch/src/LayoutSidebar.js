import { Layout, renderJoiningGroup, html } from '@rocket/engine';
import { SiteMenu, IndexMenu, NextMenu, PreviousMenu } from '@rocket/engine';
import { readFile } from 'fs/promises';

import { nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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
  constructor(options) {
    super(options);
    this.setGlobalOptions({
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
          url:
            'https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw',
        },
      ],
      footerMenu: [],
      titleWrapperFn: title => `${title} | ${this.options.siteName}`,

      ...options,
    });

    // set it in two passes so we can us the values above in the templates
    this.setGlobalOptions({
      head__10_basics: data => {
        const description = data.description ? data.description : this.options.description;
        const title = this.options.titleWrapperFn(
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

      // icons https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
      head__20_icon: html`
        <link rel="icon" href="/favicon.ico" sizes="any" /><!-- 32x32 -->
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" /><!-- 180x180 -->
        <link rel="manifest" href="/manifest.webmanifest" />
      `,

      head__30_social_media: html`
        <meta property="og:site_name" content="${this.options.siteName}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      `,

      head__40_css: html`
        <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />

        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&amp;display=optional"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&amp;display=optional"
          rel="stylesheet"
        />

        <link rel="stylesheet" href="resolve:@rocket/launch/css/variables.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/layout.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/markdown.css" />
        <link rel="stylesheet" href="resolve:@rocket/launch/css/style.css" />
      `,

      header__10_logo: html`
        <a class="logo-link" href="/">
          <img src="/icon.svg" alt="${this.options.logoAlt}" />
          <span>${this.options.siteName}</span>
        </a>
      `,

      header__20_mobile_trigger: () => html`
        <button id="mobile-menu-trigger" data-action="trigger-mobile-menu">
          <span class="sr-only">Show Menu</span>
          ${burgerSvg}
        </button>
      `,

      header__50_menu: data =>
        this.options.pageTree.renderMenu(new SiteMenu(), data.sourceRelativeFilePath),

      header__60_social: () =>
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
                  : socialIcons[socialLink.name.toLowerCase()]}
              </a>
            `,
          )}
        `,

      sidebar__10_logo: html`
        <a class="logo-link" href="/">
          <img src="${this.options.logoSrc}" alt="${this.options.logoAlt}" />
          <span>${this.options.siteName}</span>
        </a>
      `,

      sidebar__100_nav: data =>
        this.options.pageTree.renderMenu(new IndexMenu(), data.sourceRelativeFilePath),

      content__600_previous_next: data => html`
        <div class="content-previous-next">
          ${this.options.pageTree.renderMenu(new PreviousMenu(), data.sourceRelativeFilePath)}
          ${this.options.pageTree.renderMenu(new NextMenu(), data.sourceRelativeFilePath)}
        </div>
      `,

      content__650_edit: data => html`
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

      footer__100_menu: html`
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

      bottom__50_navigation_js: html`
        <script type="module" src="resolve:@rocket/drawer/define"></script>
        <script type="module" src="resolve:@rocket/launch/js/init-mobile-navigation.js"></script>
      `,

      bottom__60_service_worker_registration: data => {
        if (data.renderMode === 'production') {
          return html`<script
            type="module"
            src="resolve:@rocket/launch/js/register-service-worker.js"
          ></script>`;
        }
        return nothing;
      },
    });
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
