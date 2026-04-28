import { html } from 'lit';
import { document } from '../layout-helper.js';
import { resolve } from '../../resolve.js';
import { webAwesomeComponents } from '@rocket/js/components/web-awesome.js';
import { addBootstrapIconLibrary } from '../layout.js';
import { renderHeaderLogo, renderHeaderNav, renderSocials } from './atlasDocLayout.js';

/** @type {import('@rocket/js/types.js').Components} */
export const atlasHeroComponents = {
  'rocket-header': {
    file: './components/Header.js',
    className: 'Header',
    loading: 'server',
  },
  'rocket-social-link': {
    file: './components/RocketSocialLink.js',
    className: 'RocketSocialLink',
    loading: 'server',
  },
  'rocket-footer': {
    file: './components/Footer.js',
    className: 'Footer',
    loading: 'server',
  },
  'rocket-feature-list': {
    file: './components/FeatureList.js',
    className: 'FeatureList',
    loading: 'server',
  },
  'rocket-code-block': {
    file: './RocketCodeBlock.js',
    className: 'RocketCodeBlock',
    loading: 'hydrate:onClientLoad',
  },
  'rocket-js-demo': {
    file: './RocketJsDemo.js',
    className: 'RocketJsDemo',
    loading: 'client',
  },
  'rocket-request-demo': {
    file: './RocketRequestDemo.js',
    className: 'RocketRequestDemo',
    loading: 'client',
  },
  ...webAwesomeComponents,
};

/**
 * @param {string} title
 */
function renderHeroTitle(title) {
  const [firstSentence, ...rest] = title.split('. ');

  if (rest.length === 0) {
    return title;
  }

  return html`${firstSentence}.<br />${rest.join('. ')}`;
}

/**
 * @param {import('@rocket/js/types.js').HomeBadge[]} badges
 */
function renderTrustBadges(badges) {
  if (!badges.length) {
    return html``;
  }

  return html`
    <ul class="trust-badges" aria-label="Project facts">
      ${badges.map(badge => {
        const { text, icon, href } = badge;

        return html`
          <li>
            ${href && icon
              ? html`
                  <rocket-social-link
                    url=${href}
                    name=${icon}
                    label=${text}
                    aria-label=${text}
                  ></rocket-social-link>
                `
              : html`<span class="trust-badge-text">${text}</span>`}
          </li>
        `;
      })}
    </ul>
  `;
}

/**
 * @param {string} command
 * @param {string} label
 */
function renderCopyButton(command, label) {
  return html`
    <wa-copy-button
      class="copy-command"
      value=${command}
      copy-label=${label}
      success-label="Copied"
      error-label="Unable to copy"
      feedback-duration="1200"
    >
      <rocket-icon slot="copy-icon" name="copy" library="bootstrap"></rocket-icon>
      <rocket-icon slot="success-icon" name="check-lg" library="bootstrap"></rocket-icon>
      <rocket-icon slot="error-icon" name="x-square" library="bootstrap"></rocket-icon>
    </wa-copy-button>
  `;
}

/**
 * @param {import('@rocket/js/types.js').HeroMainData} hero
 */
function renderInstallPill(hero) {
  if (!hero.installCommand) {
    return html``;
  }

  return html`
    <div class="install-pill">
      <span class="install-label">${hero.installLabel ?? 'Install'}</span>
      <code>${hero.installCommand}</code>
      ${renderCopyButton(hero.installCommand, 'Copy install command')}
    </div>
  `;
}

/**
 * @param {import('@rocket/js/types.js').HomeCard} card
 */
function renderWhyCard(card) {
  return html`
    <article class="why-card tone-${card.tone ?? 'red'}">
      <div class="card-icon">
        <rocket-icon
          class="icon-large"
          library="bootstrap"
          name=${card.icon ?? 'file-earmark-text'}
          aria-hidden="true"
        ></rocket-icon>
      </div>
      <div class="card-copy">
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      </div>
      ${card.tags?.length
        ? html`
            <ul class="tag-list" aria-label="${card.title} tags">
              ${card.tags.map(tag => html`<li>${tag}</li>`)}
            </ul>
          `
        : html``}
    </article>
  `;
}

/**
 * @param {import('@rocket/js/types.js').HomeCard[] | undefined} cards
 */
function renderWhyRocket(cards) {
  if (!cards?.length) {
    return html``;
  }

  return html`
    <section class="home-section why-section" aria-labelledby="why-rocket-title">
      <h2 id="why-rocket-title">Why Rocket</h2>
      <div class="why-grid">${cards.map(card => renderWhyCard(card))}</div>
    </section>
  `;
}

/**
 * @param {string | string[]} command
 */
function commandToString(command) {
  return Array.isArray(command) ? command.join('\n') : command;
}

/**
 * @param {import('@rocket/js/types.js').QuickStartData | undefined} quickStart
 */
function renderQuickStart(quickStart) {
  if (!quickStart) {
    return html``;
  }

  const command = commandToString(quickStart.command);

  return html`
    <article class="info-card quick-start-card">
      <header>
        <div>
          <h2>${quickStart.title}</h2>
          ${quickStart.subtitle ? html`<p>${quickStart.subtitle}</p>` : html``}
        </div>
        ${renderCopyButton(command, 'Copy quick start commands')}
      </header>
      <pre><code>${command}</code></pre>
      ${quickStart.description ? html`<p>${quickStart.description}</p>` : html``}
    </article>
  `;
}

/**
 * @param {import('@rocket/js/types.js').WorkflowData | undefined} workflow
 */
function renderWorkflow(workflow) {
  if (!workflow) {
    return html``;
  }

  return html`
    <article class="info-card workflow-card">
      <h2>${workflow.title}</h2>
      <ol class="workflow-steps">
        ${workflow.steps.map(
          step => html`
            <li class="workflow-step tone-${step.tone ?? 'red'}">
              <span class="step-icon">
                <rocket-icon
                  class="icon"
                  library="bootstrap"
                  name=${step.icon ?? 'file-earmark-text'}
                  aria-hidden="true"
                ></rocket-icon>
              </span>
              <strong>${step.title}</strong>
              ${step.description ? html`<p>${step.description}</p>` : html``}
            </li>
          `,
        )}
      </ol>
    </article>
  `;
}

/**
 * @param {import('@rocket/js/types.js').QuickStartData | undefined} quickStart
 * @param {import('@rocket/js/types.js').WorkflowData | undefined} workflow
 */
function renderHomeColumns(quickStart, workflow) {
  if (!quickStart && !workflow) {
    return html``;
  }

  return html`
    <section class="home-section home-columns" aria-label="Getting started">
      ${renderQuickStart(quickStart)} ${renderWorkflow(workflow)}
    </section>
  `;
}

/**
 * @type {import('@rocket/js/types.js').Layout<import('@rocket/js/types.js').HeroData>}
 */
export const atlasHeroLayout = (pageData, data) => {
  addBootstrapIconLibrary(pageData);
  const cssPath = resolve('@rocket/js/docs/assets/prism-one-light.css', import.meta);
  const hero = data.heroMainData;
  const setupText = hero.setupText ?? 'Get Started';
  const documentationText = hero.documentationText ?? 'Read the docs';
  const heroEyebrow = hero.eyebrow ?? hero.sloganTop;
  const heroTitle = hero.title ?? hero.sloganBottom ?? pageData.title;
  const siteName = pageData.siteHeadMetadata?.siteName ?? pageData.title;
  const navLinks = data.headerData.navLinks ?? [
    { text: 'Docs', href: hero.documentationLink },
    { text: 'Examples', href: '/examples' },
  ];

  return document(
    pageData,
    html`
      <rocket-header not-sticky>
        <a href=${data.headerData.homeLink} class="logo-header">
          ${renderHeaderLogo(data.headerData.logo, siteName)}
        </a>
        ${renderHeaderNav(navLinks)} ${renderSocials(data.headerData.socials, siteName)}
      </rocket-header>
      <main class="home-main">
        <section class="hero home-section">
          <div class="hero-copy">
            ${heroEyebrow ? html`<p class="hero-eyebrow">${heroEyebrow}</p>` : html``}
            <h1>${renderHeroTitle(heroTitle)}</h1>
            ${hero.body ? html`<p class="hero-body">${hero.body}</p>` : html``}
            <div class="hero-actions">
              <a class="cta primary" href=${hero.setupLink}>
                ${setupText}
                <rocket-icon
                  class="icon"
                  library="bootstrap"
                  name="arrow-right"
                  aria-hidden="true"
                ></rocket-icon>
              </a>
              <a class="cta secondary" href=${hero.documentationLink}>
                ${documentationText}
                <rocket-icon
                  class="icon"
                  library="bootstrap"
                  name="book"
                  aria-hidden="true"
                ></rocket-icon>
              </a>
            </div>
            ${renderInstallPill(hero)} ${renderTrustBadges(hero.badges ?? [])}
          </div>

          ${hero.logoNoText
            ? html`
                <div class="hero-art" aria-hidden="true">
                  <div class="rocket-visual">
                    <span class="spark spark-one"></span>
                    <span class="spark spark-two"></span>
                    <span class="spark spark-three"></span>
                    <img src=${hero.logoNoText} alt="" width="370" />
                  </div>
                </div>
              `
            : html``}
        </section>
        <div class="home-content">${pageData.content}</div>
        ${renderWhyRocket(data.whyRocketData)}
        ${renderHomeColumns(data.quickStartData, data.workflowData)}
        ${data.featuresData?.length
          ? html`<rocket-feature-list .features=${data.featuresData}></rocket-feature-list>`
          : html``}
      </main>
      <rocket-footer .data=${data.footerData}></rocket-footer>
    `,
    {
      menu: false,
      headerContent: html`
        <link rel="stylesheet" href=${cssPath} />
        <link
          rel="stylesheet"
          href="${resolve('@awesome.me/webawesome/dist/styles/webawesome.css', import.meta)}"
        />
        <link rel="stylesheet" href="${resolve('@rocket/js/layouts/atlasHero.css', import.meta)}" />
      `,
    },
  );
};
