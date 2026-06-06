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
- Custom layouts rendering `rocket-icon` need `addBootstrapIconLibrary(pageData)` before `document()`.
- Static JavaScript Pages render once per concrete path; query/header/cookie/live-data output needs `render: 'server'`.
- Static Request Demos should target concrete non-query URLs.
- After adding a `js demo`, verify the parent Page and Standalone Demo URL `/page/_demo/demoName/`.
- Keep `npm run build` passing; record Rocket package issues separately from local workarounds.
