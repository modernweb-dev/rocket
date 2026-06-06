---
name: rocket
description: Use when editing Rocket Pages, config, layouts, component reference Pages, or build behavior in this project.
---

# Rocket

## Rules

- Read `rocket-config.js` first; Page discovery follows `includeGlobs`.
- Every Page owns its URL through `config.path`; put general docs in `docs/pages` and component docs next to the component.
- Prefer Markdown for durable content; use JavaScript Pages for request-time or programmatic output.
- Prefer interactive examples for component and behavior docs; use `js demo` when readers benefit from trying the UI.
- Prefer Atlas docs layouts: `atlasDocLayout` for docs, `atlasHeroLayout` for a standalone docs home, with matching `components` exports.
- Markdown using Rocket custom elements needs a `components` export; use Atlas component maps or `rocketDemoComponents`.
- Add `menu.iconName` to Atlas docs navigation Pages so the left navigation has icons.
- Direct layout re-exports are supported when no local wrapper function is needed.
- For Atlas theming, use shared layout data with `stylesheets` and centralized CSS variables instead of per-Page style injection.
- To add a general Page, create `docs/pages/name.rocket.md`, set `config.path`, `metadata`, `menu.iconName`, and use the shared docs layout.
- Custom layouts rendering `rocket-icon` need `addBootstrapIconLibrary(pageData)` before `document()`.
- Static JavaScript Pages render once per concrete path; query/header/cookie/live-data output needs `render: 'server'`.
- Static Request Demos should target concrete non-query URLs.
- After adding a `js demo`, verify the parent Page and Standalone Demo URL `/page/_demo/demoName/`.
- If `rocket init` fails because package.json has `"type": "commonjs"`, change it to `"type": "module"` or rerun `npx rocket init --yes`.
- If dev server watchers fail with `EMFILE`, run `npm start -- --no-watch --no-open` and use `Ctrl+R` for manual restarts.
- When smoke-testing Pages with curl, send `Accept: text/html`: `curl -H 'Accept: text/html' http://localhost:8888/path`.
- Keep `npm run build` passing; record Rocket package issues separately from local workarounds.
