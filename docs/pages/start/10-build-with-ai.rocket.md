```js server
export const config = {
  path: '/setup/build-with-ai',
  metadata: {
    title: 'Start With AI',
    description:
      'Guide a Coding Agent through an interactive interview before building a deployable Rocket site.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'AI tip',
          description:
            'Make the agent resolve the site decisions first; let rocket init create the durable project shape.',
        },
      },
    },
  },
  menu: {
    linkText: 'Start with AI',
    iconName: 'stars',
    order: 10,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Start With AI

Use a Coding Agent to interview you, initialize Rocket, and build the first deployable version of
your site. You do not need a complete Site Brief before starting. Give the agent whatever you know,
then let it inspect the codebase and ask only for the decisions it cannot discover.

## What you need

- Node.js 22 or newer.
- npm.
- A Coding Agent that can edit files and run terminal commands.
- Optional: deployment access when you want the agent to publish the site.

## Copy the prompt

Paste this prompt into your Coding Agent from the project directory where you want Rocket to run.
The agent should inspect the project, ask focused questions, and start building once the first
version is clear enough.

```text
You are helping me start or improve a Rocket site.

Interview me relentlessly about every important decision until we reach a shared understanding.
Walk down the design tree one decision at a time, resolving dependencies between decisions before
moving on. Ask one question at a time. For each question, include your recommended answer.

First inspect the project. If a question can be answered by exploring the codebase, project docs, or
existing assets, explore instead of asking me. Check package.json, rocket-config.js, docs/pages,
src, public, existing project instructions, and any existing .agents/skills/rocket/SKILL.md.

If this is not already a Rocket project:
- If package.json is missing, create one with npm init -y.
- Install Rocket with npm install @rocket/js when @rocket/js is missing.
- Run npx rocket init to create the Rocket starter shape.
- Read .agents/skills/rocket/SKILL.md if it exists after initialization and follow it.

If this is already a Rocket project:
- Do not re-scaffold files that already exist.
- Read rocket-config.js before changing Pages.
- Preserve the existing includeGlobs, layouts, Page patterns, and project instructions unless there
  is a clear reason to change them.

Question budget:
- Ask at most 11 substantive questions total.
- Ask fewer questions when the project already gives enough information.
- After 5 substantive questions, or earlier once you can build a coherent first version, ask:
  "I can start building now with these assumptions, or keep asking up to 6 more questions. Which do
  you prefer?"
- If I choose to build, summarize your assumptions and start.
- If I choose to keep going, continue one question at a time until the remaining decisions are
  resolved or the 11-question limit is reached.
- If a decision blocks implementation, say why it blocks before building.

Use this decision order. Skip anything answerable from the codebase:
1. Site purpose and primary audience.
2. Primary visitor action or successful outcome.
3. Required Pages, navigation, and rough content hierarchy.
4. Existing content, assets, code, or source material to reuse.
5. Whether this is a documentation site and whether package-provided Atlas layouts are enough.
6. Visual direction, brand constraints, and examples to avoid or emulate.
7. Content tone, language, and localization needs.
8. Whether this is a Standalone Rocket Site or component/library documentation.
9. Request-time behavior, integrations, forms, search, authentication, or other dynamic needs.
10. Deployment target, Site Origin, and whether publishing should happen now or later.
11. Launch readiness: favicon assets, Site Head Metadata, discoverability, and verification.

You have enough to build a coherent first version when you know or can infer:
- the site purpose
- the primary audience
- at least one primary visitor action or outcome
- the initial Page list, even if rough
- whether this is a Standalone Rocket Site or component/library documentation
- the visual direction, or permission to choose one
- whether request-time behavior is needed
- the deployment target well enough to create the right build config or defer deployment safely

Missing favicon assets, final Site Origin, exact production copy, and deployment credentials do not
block the first build. Record them as follow-up items instead.

Build rules:
- Use @rocket/js and Rocket Pages. Do not create a Vite, React, Astro, Next, or other framework app
  for the site unless the existing project already requires separate integration work.
- General Documentation Pages go under docs/pages.
- Component Reference Pages go next to the component they document.
- Every Page owns its public URL through config.path.
- Prefer package-provided Atlas layouts for documentation sites. Use atlasDocLayout for general
  docs Pages and atlasHeroLayout for standalone docs home Pages unless I explicitly ask for a custom
  layout.
- Pages using atlasDocLayout must export atlasDocComponents as components. Pages using
  atlasHeroLayout must export atlasHeroComponents as components.
- Direct layout re-exports such as export { layout } from './layout.js' are supported when no local
  wrapper function is needed.
- Atlas docs navigation Pages should set menu.iconName with a Bootstrap Icon name.
- Prefer Markdown Pages for durable content.
- Use JavaScript Pages only for request-time or programmatic rendering.
- Keep the first version static unless the interview identifies real request-time behavior.
- Static JavaScript Pages render once per concrete config.path during rocket build. Static Request
  Demo examples should point at concrete paths and avoid query-dependent output.
- Do not invent extra Pages just to hit a count; create the smallest useful Page set for the visitor
  journey.
- If this is component or Web Component documentation, create at least one Component Reference Page
  with a useful rendered example.
- Add a custom layout, styles, data files, public assets, Site Head Metadata, or deployment config
  only when the site decisions call for them. Custom-layout examples must explain component
  registration and icon-library setup for Rocket-owned components, including addBootstrapIconLibrary
  from @rocket/js/icons.js when the layout renders rocket-icon.
- Configure Favicon Asset references only for files that actually exist under public/.
- Do not enable sitemap or robots until the final production Site Origin is known and the site is
  ready for public crawlers.
- Do not publish, initialize Git, or commit unless I explicitly ask.
- Record Rocket package issues separately from project-local workarounds.

Before building, summarize:
- the decisions you learned from the codebase
- the decisions I answered directly
- the assumptions you are making
- the Pages and files you plan to create or change
- any launch items you are intentionally deferring

After building:
- Run the appropriate Rocket build command, usually npm run build or npm run rocket:build.
- Fix build failures before finishing.
- For every js demo Page, verify both the parent Page and the generated Standalone Demo URL
  /page/_demo/demoName/.
- If you can start a local dev server, tell me the URL.
- Summarize changed files, verification results, and deferred launch items.
```

## What the agent should create

For a new project, `npx rocket init` creates a Rocket starter shape:

- `rocket-config.js`
- `docs/pages/sharedData.js`
- `docs/pages/index.rocket.md`
- starter docs, JavaScript Demo, Request Demo, and static JSON Pages under `docs/pages`
- `.agents/skills/rocket/SKILL.md`
- npm scripts for local development and static builds when those names are available

After that, the Coding Agent should adapt the initialized project to the interview decisions. It can
add more Pages, layouts, styles, data files, Public Assets, Site Head Metadata, or deployment config
when those choices are part of the site plan.

For an existing project, the agent should work with the current structure instead of replacing it.

## Verify the first version

The Coding Agent should leave you with:

- a passing Rocket build
- explicit `config.path` values for every Page
- content and navigation that match the interview decisions
- no missing configured Favicon Asset files
- no public discoverability settings unless the final Site Origin is real
- a short list of deferred launch items

## Deploy later

For a durable production site, connect the project to your hosting provider after the build passes.
If you use Netlify, add deployment config only when Netlify is the chosen target. Temporary previews
and production publishing should happen only after you explicitly ask the Coding Agent to deploy.

## Prefer doing it by hand?

Use the [Manual Quick Start](/setup/manual-quick-start) when you want to create the first Rocket
files yourself.
