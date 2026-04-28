# App Mounts

App Mounts are a proposed Rocket feature for hybrid sites that combine static content, one or more browser-owned applications, and optional API routes.

The goal is to let Rocket host a client application without becoming the client application framework.

## Problem

Many product sites have this shape:

```txt
/             static marketing or documentation Page
/pricing      static marketing Page
/docs         static documentation Pages
/app/*        browser application
/api/*        JSON or request-time data routes
```

Rocket already fits the static content and API parts. The missing first-class primitive is a clean way to mount a browser application at a path such as `/app`, build its entry module, and route browser document requests below `/app/*` to the same app shell.

## Boundary

Rocket should own:

- app shell generation
- app entry bundling
- code-split asset output
- development-server history fallback for the mount path
- adapter/deployment rewrites for the mount path
- collision checks against Pages, Public Assets, API routes, and generated outputs

The mounted app should own:

- client routing
- authentication UI and session handling
- state management
- data fetching
- route-level dynamic imports
- loading and error states
- forms, mutations, and optimistic updates

Rocket should not understand the app route tree. A Site Author can use any browser-side router, including `@thepassle/app-tools/router.js`, or no router at all.

## API Sketch

Page-local configuration:

```js
export const config = {
  path: '/app',
  metadata: { title: 'App' },
  menu: false,
  discoverability: { sitemap: false },
  appMount: {
    entry: './src/app/app.js',
    fallback: true,
  },
};

export default function appShell() {
  return '<div id="app"></div>';
}
```

The app entry remains ordinary browser code:

```js
import { Router } from '@thepassle/app-tools/router.js';

const outlet = document.querySelector('#app');

new Router(outlet, [
  // App-owned route definitions.
]);
```

## Request Behavior

For an App Mount at `/app`:

```txt
/app              renders the app shell
/app/             renders the app shell
/app/settings     renders the app shell for document requests
/app/assets/x.js  serves the built asset, not the shell
/api/session      serves the API Page or backend route, not the shell
```

The fallback should only apply to document-style requests, such as `Sec-Fetch-Dest: document`, `Sec-Fetch-Dest: iframe`, or `Accept: text/html`. It should not rewrite JavaScript, CSS, image, fetch, or module requests.

## Build Behavior

Rocket should render the configured shell Page and bundle the configured app entry with Vite.

For `/app`, a build could emit:

```txt
dist/app/index.html
dist/app/assets/app.abc123.js
dist/app/assets/settings.def456.js
```

Dynamic imports should continue to work from deep app URLs such as `/app/settings`. That means app assets need stable root-relative or mount-relative URLs that do not depend on the current browser path.

## Adapter Behavior

Adapters need a generic App Mount or rewrite contract so each deployment target can express the same fallback.

For Netlify, an App Mount at `/app` would likely emit:

```txt
/app/*  /app/index.html  200
```

Server-rendered JavaScript Pages and API Pages should continue to use the existing adapter path. The App Mount fallback must not shadow more specific Rocket Pages or adapter function routes.

## First Slice

Keep the first implementation intentionally narrow:

- one or more static App Mounts
- concrete mount paths only, no `:params`
- browser-only app rendering, no SSR for app routes
- Vite-bundled entry with preserved dynamic imports
- dev-server fallback for document requests under the mount path
- Netlify adapter rewrite output
- collision validation with Pages, Public Assets, and generated outputs

## Non-goals

- Rocket-managed app routing
- route manifests
- nested app layouts
- app data loading conventions
- app auth policy
- server-side rendering for app views
- framework-specific integration

## Open Questions

- Should `appMount` live on a Page config, project config, or both?
- Should the shell be a JavaScript Page return value, a dedicated HTML template, or either?
- Should the emitted app assets live under `/app/assets/` or a shared Rocket assets directory?
- Should App Mounts be excluded from sitemap output by default?
- How should multiple App Mounts share dependencies and chunks?
