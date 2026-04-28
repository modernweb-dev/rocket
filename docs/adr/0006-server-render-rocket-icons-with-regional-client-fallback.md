# Server-render Rocket icons with regional client fallback

Rocket will provide a Rocket-owned `rocket-icon` Registered Component for named SVG icons instead
of relying on `wa-icon` for static icon rendering. Server-rendered icons stay as `rocket-icon`
elements and keep their author-facing attributes, such as `name`, `library`, and `icon-loading`.
Server finalization adds Declarative Shadow DOM to include the SVG in the initial HTML, so icons that
are visible during first paint do not wait for client upgrade or network fetches.
The `name` attribute is required. Missing or empty `name` fails during server finalization because
Rocket cannot create an Icon Reference; client-created Icon Components with missing or empty `name`
should warn in development and render the stable empty fallback.

Icon Components use an `icon-loading` attribute with the initial values `auto`, `server`, and
`client`. `server` requires server rendering and fails during build or server render when the icon
cannot be resolved. `client` emits stable server placeholder output and resolves the SVG in the
browser when visible using `IntersectionObserver`. Because Rocket's relevant browser baseline
includes `IntersectionObserver`, this decision does not add an immediate-fetch fallback or polyfill
path for browsers without it. Missing `icon-loading` means `auto`. Invalid server-finalized
`icon-loading` values fail during build or server render. For client-created Icon Components,
invalid values should warn in development and behave as `client`, because the browser cannot recover
by server-rendering. Server finalization should not write back `icon-loading="auto"` when the
attribute was omitted; missing `icon-loading` is a semantic default, not markup normalization. `auto`
is conservative by default and is influenced by explicit Icon Loading Regions such as
`icon-loading-region` with `icon-server-budget`; each region owns its own budget so a long navigation
list cannot consume the main content's server-rendered icon allowance.
`icon-loading-region` is presence-only in the first slice. If it has a value, Rocket accepts and
ignores that value; named-region semantics are deferred.
There is no hidden global cap for automatic icons: outside a region whose budget is exhausted,
`icon-loading="auto"` server-renders. Deferral requires either `icon-loading="client"` or an
explicit Icon Loading Region budget. A region budget counts only `icon-loading="auto"` Icon
Components in rendered DOM order. Explicit `server` and `client` icons bypass the budget and do not
consume it. In nested regions, the nearest ancestor Icon Loading Region owns each automatic icon for
budget purposes; child regions do not consume the parent region's budget, and the parent budget
continues after the child region ends. A region without `icon-server-budget` still creates an
independent policy boundary, but its budget is unlimited; only regions with an explicit
`icon-server-budget` defer later automatic icons. `icon-server-budget` accepts only non-negative
integers. `0` is valid and defers all automatic icons in that region. Empty, negative, decimal, or
non-numeric values fail clearly during the rendered-HTML icon finalization pass.
Icons are decorative by default. Meaningful icons should use standard ARIA attributes such as
`aria-label` or `aria-labelledby`; Rocket should not introduce a custom icon label attribute.
Changing `aria-label` or `aria-labelledby` after upgrade affects only the Icon Label and host
accessibility semantics. It does not change the Icon Reference and must not clear, re-resolve, or
re-fetch SVG content.
Rocket should not add a first-slice `size` attribute. The Icon Component should reserve stable
text-relative geometry by default, such as a `1em` inline box, preserve `currentColor` behavior, and
let Site Authors size icons with CSS. First-slice SVG handling should treat configured Icon Library
Sources as trusted content. Rocket should wrap SVG bytes in a stable shadow wrapper such as
`<span part="icon">...</span>` for server-rendered and client-loaded icons, but should not parse,
rewrite, sanitize, or normalize the SVG content itself in this slice.

Rocket will collect Icon References while rendering `rocket-icon` instances and emit a per-Page Icon
Manifest for deferred or client-created icons. The manifest is passive JSON that maps Icon
References to generated local icon asset URLs and includes the rendered Page's resolved Default Icon
Library when one exists, for example:

```html
<script type="application/json" data-rocket-icon-manifest>
  {
    "defaultLibrary": "bootstrap",
    "icons": {
      "bootstrap:alarm": "/_rocket/icons/bootstrap/alarm.4f3a2c.svg",
      "fa-solid:angry": "/_rocket/icons/fa-solid/angry.a91bd2.svg"
    }
  }
</script>
```

The manifest should be emitted only when at least one client-needed icon exists, should not contain
raw SVG, and once emitted should include all Icon References found in the rendered Page, including
server-inlined icons. The `defaultLibrary` field lets client-created unqualified icons resolve the
same way server-finalized unqualified icons did, while the host can still keep `library` omitted.
Static builds publish generated SVG assets for the Icon References included in an emitted manifest
plus any future explicit client-only allowlist, not an entire icon library. Pages with only
server-rendered icons and no browser-loaded Registered Components emit no manifest and do not load
the `rocket-icon` class. A browser-loaded Registered Component is one whose Loading Strategy is
`client` or begins with `hydrate:`; pure `server` Registered Components do not trigger the icon
runtime by themselves. If a Page has any browser-loaded Registered Component, Rocket should emit the
Icon Manifest and load the `rocket-icon` class even if every server-discovered icon was
server-rendered, because browser-loaded component code may create `<rocket-icon>` later. Loading the
class is eager once it is needed; visibility gates SVG fetching, not custom element definition. This
does not publish whole libraries; the manifest still contains only rendered Page Icon References plus
any future explicit client-only allowlist. The client-side loading behavior belongs inside the
`rocket-icon` class:
manifest lookup, `IntersectionObserver` handling, visibility-triggered fetches, fetched SVG text
caching, SVG insertion, and missing-icon fallback handling should not be implemented as a separate
global icon loading system. Repeated client icons should share a static cache inside the
`rocket-icon` class, keyed by manifest URL, so repeated icons reuse the same fetch or in-flight
promise without introducing an external loader service. Successful SVG text and in-flight promises
should be cached, but rejected fetches should be evicted so later visibility attempts or recreated
icons can retry. Development should warn for each failed fetch attempt. After upgrade, `rocket-icon`
should observe `name`, `library`, and `icon-loading` attribute changes. Changes to `name` or
`library` clear the current SVG or fallback immediately, keep the stable host geometry, and then
re-resolve through the manifest. If the new Icon Reference is missing from the manifest, the old SVG
must not remain visible; development should warn and the stable empty fallback should remain.
Browser-side `icon-loading="client"` and `icon-loading="auto"` use visibility-gated client fetching.
Browser-side `icon-loading="server"` is impossible; development should warn and treat it as client
loading.
The manifest is authoritative for client fetches: `rocket-icon` should never synthesize
`/_rocket/icons/{library}/{name}.svg` URLs in the browser. If a client-created or deferred icon
resolves to an Icon Reference that is not present in the manifest, development should warn and the
icon should render the stable empty fallback. Any future client-only allowlist should extend manifest
generation and asset publishing at build time; it should not change the browser invariant that no
manifest entry means no fetch. A client-created Icon Component cannot use a server-only Icon Loading
Strategy; development should warn and fall back to client resolution.

The first implementation will support Bootstrap Icons through the `bootstrap-icons` npm package as
a direct Rocket dependency for Rocket-shipped layouts that use Bootstrap Icons, such as Atlas and
the default layout. There is no Rocket-wide default Icon Library set. Icon Libraries are layered:
reusable layouts supply Layout Icon Libraries for their own Icon Components, and project-level Icon
Library Configuration adds Site Author-owned libraries and selects Site Author defaults. This avoids
requiring Site Authors to spread default or Atlas libraries into their custom icon configuration.
Project configuration should fail when it defines an Icon Library name already supplied by the active
layout; silent cross-layer overrides are out of scope for the first slice. A Default Icon Library can
be selected by project configuration or by the active layout; project configuration wins when both are
present, a single available Icon Library can act as the default, and ambiguous unqualified icons
should fail clearly. If the author omits `library` and Rocket resolves the Icon Reference through
the Default Icon Library, finalization should not write the resolved library back to the host; the
resolved `library:name` pair is for internal resolution, manifests, and generated assets. Icon
Components that need an explicit Icon Library should use the `library` attribute, for example
`<rocket-icon library="fa-solid" name="angry"></rocket-icon>`, because `icon-library` is redundant
on an icon-specific element. Layout Icon Libraries should be supplied during layout render through
PageData, for example `pageData.addIconLibraries(...)`, so layouts that do not use the document
helper can still participate. Layout-owned icons should name their Icon Library explicitly so Site
Author default-library choices do not break layout internals.
Page-configured menu icon names remain author-owned, do not name an Icon Library in the first slice,
and should use the active Default Icon Library. Project configuration should use top-level
`iconLibraries` and `defaultIconLibrary`, not `icons`, because `siteHeadMetadata.icons` already
means Site Author-provided Favicon Assets. Package-backed libraries should use explicit helpers
exported from `@rocket/js/icons.js`, such as
`iconsFromPackage('bootstrap-icons', 'icons/*.svg')`, rather than a Rocket-specific `npm:` path
protocol. The same first slice should support trusted local folder libraries through a separate
helper such as `iconsFromPath('./src/icons/*.svg')`. The `.js` import path follows Rocket's existing
public module style, such as `@rocket/js/resolve.js` and `@rocket/js/types.js`. Static builds must
publish only referenced icons, not whole libraries. First-slice Icon Names are derived from SVG file
basenames, and duplicate
Icon Names inside one Icon Library should fail when that library is first indexed. Icon Library
Sources should be indexed lazily on first use during render/build and cached after indexing, so large
configured libraries do not slow Pages that never reference them. Client-fetched icon assets should
use deterministic Rocket-owned URLs such as `/_rocket/icons/{library}/{name}.{hash}.svg`, where the
hash comes from SVG content and library/name path segments are sanitized. These assets should be raw
SVG files served as `image/svg+xml`, not generated JavaScript modules; the `rocket-icon` class
fetches the SVG text and inserts it into the shadow wrapper. Icon packages with style or family
variants that share filenames, such as Font Awesome solid and regular icons, should be configured as
separate Icon Libraries. Font Awesome should be documented as a generic package-backed configuration
example, but Rocket should not add a Font Awesome dependency or Font Awesome-specific preset in the
first slice. The Font Awesome docs example should recommend `svgs-full` for consistent icon canvas
sizing while not forbidding Site Authors from choosing `svgs`. External `src`, remote icon URLs,
path-derived icon names, and deep SVG sanitization are deferred until later slices. Atlas layouts
should migrate static icon usage from `wa-icon` to `rocket-icon` and remove the jsDelivr icon
resolver for those icons.

This avoids the current `wa-icon` visual pop-in without adding an expensive browser measurement pass
for every Page. It deliberately favors over-server-rendering normal document icons and gives large
known icon regions an author-controlled way to defer lower-priority icons.
