# Rocket

Rocket is a static-site framework that turns configured Pages into rendered HTML for development, static builds, and deployment adapters.

## Language

**Page**:
A configured content entry with a route path and a module that can be rendered by Rocket.
_Avoid_: Route, document, file

**General Documentation Page**:
A Page that explains project-wide or site-wide documentation topics rather than one specific component.
_Avoid_: Docs page, general page, documentation file

**Component Reference Page**:
A Page that documents one component's purpose, usage, examples, and authoring constraints.
_Avoid_: Component docs page, component readme, component article

**Page Runtime**:
The module responsible for matching and executing Pages into renderable responses.
_Avoid_: Renderer, request handler, page service

**Page Module Loader**:
The module responsible for loading the concrete module behind a Page for a specific runtime environment.
_Avoid_: Import helper, resolver, loader hook

**Loaded Page Module**:
A normalized module returned by a Page Module Loader for execution by the Page Runtime.
_Avoid_: Raw import, imported module

**JavaScript Demo**:
A Markdown Page code example that runs JavaScript in the browser and renders an inline live preview.
_Avoid_: JS preview, live code block, inline demo

**Standalone Demo**:
A focused rendering of one JavaScript Demo from a Markdown Page.
_Avoid_: Single demo, demo page

**Standalone Demo URL**:
A stable public URL that renders one Standalone Demo for a parent Markdown Page.
_Avoid_: Query variant, hash variant, private demo link

**Request Demo**:
A framed Markdown Page example that pairs a request URL with the source code that produces its live response.
_Avoid_: URL demo, endpoint demo, response preview

**Page Variant**:
The rendering variant of a Page requested from a Page Module Loader.
_Avoid_: Mode, layout option

**PageData**:
The layout-facing data object created and owned by the Page Runtime for a Page render.
_Avoid_: Layout data bag, page context object

**Page Metadata**:
The normalized Rocket-owned data about a discovered Page, created during Page discovery and shared with layouts, navigation, generated outputs, and JavaScript Pages.
_Avoid_: Frontmatter, SEO config, raw Page config

**Page Registry Query**:
The author-facing behavior that selects, sorts, groups, and paginates discovered Pages by normalized Page Metadata and route path.
_Avoid_: Map helper, menu filter, raw registry access

**Page Collection**:
An ordered author-facing set of content entries used for repeatable content workflows such as blog indexes, tag pages, author pages, and feeds.
_Avoid_: Blog model, static params list, raw Page map

**Adapter Context**:
Platform-specific request context passed through a Page Runtime render without being interpreted by Rocket.
_Avoid_: Runtime context, platform globals

**JavaScript Page Result**:
The value returned by a JavaScript Page before the Page Runtime normalizes it to a Response.
_Avoid_: Handler output, route result

**Server-rendered JavaScript Page**:
A JavaScript Page that renders at request time in development and through a deployment adapter in production.
_Avoid_: Dynamic page, server page, live page

**Registered Component**:
A Page-owned entry that maps a web component tag name to the module file, exported class name, and loading behavior Rocket uses for rendering or browser activation.
_Avoid_: Component config entry, component record

**Page-local Custom Element**:
A custom element tag authored by a Markdown Page and activated by browser code owned by that same Page instead of by a Registered Component.
_Avoid_: Inline component, local component

**Icon Component**:
A Rocket-owned custom element that represents a named visual icon in a rendered Page.
_Avoid_: SVG helper, icon tag, image icon

**Icon Library**:
A named collection of SVG icons that Icon Components can reference.
_Avoid_: Icon set, icon package, SVG folder

**Icon Library Configuration**:
The project-level configuration that makes Icon Libraries available to rendered Pages.
_Avoid_: Page icon config, icon imports, icon registration

**Layout Icon Libraries**:
Icon Libraries supplied by reusable layouts for Icon Components owned by those layouts.
_Avoid_: Theme icon libraries, layout icon config, atlas icon imports

**Default Icon Library**:
The Icon Library selected for Icon Components that do not name a library.
_Avoid_: Default icons, global icon library, implicit icon package

**Icon Library Source**:
A trusted location from which Rocket resolves SVG icons for an Icon Library.
_Avoid_: Icon path, icon resolver, icon protocol

**Icon Reference**:
The library and name pair that identifies one icon needed by a rendered Page.
_Avoid_: Icon usage, icon dependency, icon asset

**Icon Name**:
The required per-library name that identifies an SVG icon within an Icon Library.
_Avoid_: SVG filename, icon path, icon id

**Icon Label**:
The explicit accessible name provided for an Icon Component when the icon conveys meaning.
_Avoid_: Icon title, icon alt text, auto label, label attribute

**Icon Loading Strategy**:
The author-facing choice that tells Rocket how an Icon Component becomes available in a rendered Page.
_Avoid_: Loading Strategy, icon hydration, icon mode

**Icon Loading Region**:
A rendered Page area marked by a presence-only attribute whose icon policy influences Icon Components inside it.
_Avoid_: Icon container, icon group, icon section, named region

**Icon Server Budget**:
The non-negative integer count of automatic Icon Components an Icon Loading Region keeps server-rendered, in rendered DOM order, before deferring later automatic icons.
_Avoid_: Global icon limit, inline icon cap, icon threshold

**Icon Manifest**:
The rendered Page output that maps rendered or explicitly Page-added Icon References to generated icon asset URLs when client-side icon fetching is needed.
_Avoid_: Icon registry, icon map, asset list

**Code Block**:
A rendered fenced code example in a Markdown Page.
_Avoid_: Snippet, source panel

**Code Block Label**:
The display text shown in a Code Block frame.
_Avoid_: File path, filename, title

**Code Block Frame**:
The visual presentation category applied to a Code Block.
_Avoid_: System language, code block type

**Site Author**:
A developer who uses Rocket to create and deploy their own website.
_Avoid_: User, docs user, customer

**Coding Agent**:
An automated coding tool used by a Site Author to create or modify a Rocket site.
_Avoid_: AI, assistant, bot

**Zero-install Agent Onboarding**:
The Site Author entry path where public instructions let a Coding Agent create a Rocket site without installing a Rocket-specific agent extension first.
_Avoid_: AI onboarding, skill-first onboarding, plugin-first onboarding

**Agent Project Instructions**:
Durable project-local instructions that tell a Coding Agent how to maintain a Rocket site after initial creation.
_Avoid_: Prompt, skill, plugin

**Rocket Agent Skill**:
A project-local Coding Agent skill that gives Rocket-specific guidance for maintaining Rocket Pages, config, layouts, and component documentation.
_Avoid_: Agent Project Instructions, plugin, prompt

**Agent Starter Site**:
The default static Rocket site created by a Coding Agent during Zero-install Agent Onboarding.
_Avoid_: AI-generated site, scaffold, starter template

**Rocket Initializer**:
The Rocket first-start workflow for adding missing Rocket site structure to the Site Author's current project.
_Avoid_: create app, package bootstrapper, framework installer

**Standalone Rocket Site**:
A Rocket site whose project is primarily the website being authored rather than documentation added to another codebase.
_Avoid_: standalone website, app, separate docs app

**Site Brief**:
The Site Author's short description of the intended Rocket site, including purpose, audience, pages, style direction, and deployment target.
_Avoid_: Prompt, requirements, spec

**Deployable Rocket Site**:
A Rocket site whose production build succeeds and whose generated output can be published to a target host.
_Avoid_: Working site, finished site

**Deployed Rocket Site**:
A Rocket site that has been published to a public hosting environment.
_Avoid_: Deployable site, built site

**Site Origin**:
The canonical absolute origin for the deployed site, configured by the Site Author and used when generated outputs need public absolute URLs.
_Avoid_: Dev server origin, adapter URL, request origin

**Site Head Metadata**:
The browser- and preview-facing identity data for a rendered Page and its site.
_Avoid_: SEO config, head tags, launch checklist

**Document Baseline Metadata**:
The generic HTML document metadata Rocket includes for every document it creates.
_Avoid_: SEO config, Site Head Metadata

**Favicon Asset**:
A Site Author-provided icon asset referenced by Site Head Metadata.
_Avoid_: Generated icon, app icon

**Public Asset**:
A Site Author-provided file that Rocket publishes at a stable public URL without treating it as a Page or transforming its contents.
_Avoid_: Static file, bundled asset, generated asset

**Site Head Metadata Page Options**:
The Page-level author configuration that controls Page-specific Site Head Metadata.
_Avoid_: SEO metadata, social config, preview config

**Social Preview Image**:
The preview-facing image selected for a rendered Page when external services create link previews.
_Avoid_: OG image, share image, social card

**Explicit Social Preview Image**:
A Site Author-provided image used as the Social Preview Image for a Page.
_Avoid_: Manual OG image, custom share image

**Default Social Preview Image**:
A Rocket-provided Social Preview Image used when a Page has no Explicit Social Preview Image.
_Avoid_: Fallback card, generated OG image

**Social Preview Template**:
An author-facing design template used to create Social Preview Images from site and Page facts.
_Avoid_: Open graph layout, screenshot page

**Social Preview Capture**:
The browser-based rendering of a Social Preview Template into an image file.
_Avoid_: SVG render, image composition, card export

**Social Preview Template Preview**:
The development-time view of a Social Preview Template before or alongside Social Preview Capture.
_Avoid_: Screenshot page, hidden route, card playground

**Social Preview Image Fingerprint**:
The stable identity of a Default Social Preview Image derived from the inputs that can affect its pixels.
_Avoid_: Cache key, build hash, asset hash

**Social Preview Image Delivery Strategy**:
The author-selected way Rocket makes a Social Preview Image available at a public URL.
_Avoid_: Image mode, image hosting, generation mode

**Agent Workflow**:
The selected working method an automated agent uses to complete an issue.
_Avoid_: TDD flag, implementation mode, issue type

**Agent Loop Recovery**:
The continuation path for an automated issue run that already produced a completed agent result but has not reached its commit boundary.
_Avoid_: Resume, retry

**Agent Loop Resume**:
The continuation path for an automated issue run that has partial uncommitted work and must continue the same selected issue.
_Avoid_: Recovery, retry

**Loading Strategy**:
The `loading` value on a Registered Component that tells Rocket whether the component is server-rendered, client-loaded, or server-rendered and later hydrated.
_Avoid_: Component mode, hydration mode

**Hydration Strategy**:
The condition expression after `hydrate:` in a Loading Strategy that controls when a server-rendered Registered Component becomes interactive in the browser.
_Avoid_: Hydration trigger, browser event handler

**Component Hydration**:
The behavior that classifies Registered Components, prepares server definitions, emits browser activation code, and hydrates matching elements according to their Hydration Strategy.
_Avoid_: Component parser, hydration service

**Site Discoverability**:
The build-time behavior that emits crawler-facing generated outputs for a site, initially `sitemap.xml` and `robots.txt`.
_Avoid_: Search index, feed generator, SEO plugin

**Sitemap**:
The generated XML document that lists public Page URLs for crawlers.
_Avoid_: Search index, Page registry export

**Robots File**:
The generated `robots.txt` file that points crawlers at the Sitemap and can include crawler directives.
_Avoid_: Redirect file, headers file

**Site Discoverability Page Options**:
The Page-level author configuration that controls whether a Page participates in the Sitemap and Robots File.
_Avoid_: SEO metadata, search settings

**URL Lifecycle**:
The behavior that preserves and changes a site's public URLs over time, initially through Redirects.
_Avoid_: Site Discoverability, route matching, SEO config

**Redirect**:
A URL Lifecycle rule that sends a public source URL to a target URL instead of rendering a Page at the source URL.
_Avoid_: Rewrite, alias, Page

## Relationships

- A **Page** has exactly one configured route path.
- A **Page Runtime** matches a request path to at most one **Page**.
- A **Page Runtime** renders from a web `Request` plus optional **Adapter Context**; static build synthesizes requests for route paths.
- A **Page Runtime** derives route path and origin from `Request.url`.
- A **Page Runtime** uses a **Page Module Loader** to load the module behind a **Page**.
- The first **Page Runtime** slice accepts the existing Page registry shape rather than redesigning Page discovery.
- A **Page Runtime** returns a web `Response` for every matched **Page**.
- A **Page Runtime** returns a `404` `Response` when no **Page** matches.
- A **Page Runtime** throws typed errors when a **Page** module is invalid or rendering fails.
- A Markdown **Page** owns zero or more **JavaScript Demos** as metadata.
- A **JavaScript Demo** treats its inline live preview as primary and its displayed source code as supporting material.
- A framed **JavaScript Demo** lets a Site Author copy its displayed source code.
- A framed **JavaScript Demo** lets a Site Author open and copy its **Standalone Demo URL**.
- A framed **JavaScript Demo** copies its **Standalone Demo URL** as a site-root path.
- A framed **JavaScript Demo** opens its **Standalone Demo URL** without replacing the parent Markdown **Page**.
- A **Page Runtime** handles **Standalone Demo** requests for Markdown Pages.
- The **Standalone Demo URL** Module owns construction, parsing, adapter route patterns, static output paths, and matching a **Standalone Demo URL** to its parent Markdown **Page**.
- The **Standalone Demo URL** Module returns the **Page Variant** for a matched **Standalone Demo URL**.
- The **Standalone Demo URL** Module accepts the existing **Page** registry when matching **Standalone Demo URLs**.
- The **Standalone Demo URL** Module produces generated **Standalone Demo URL** paths and adapter route patterns for static build and deployment adapters; static build owns collision failure policy.
- The **Standalone Demo URL** Module is isomorphic and can be used by browser preview controls, Page Runtime, static build, and deployment adapters.
- A **Page Runtime** delegates **Standalone Demo URL** interpretation to the **Standalone Demo URL** Module.
- A **Standalone Demo URL** belongs to exactly one Markdown **Page** and one **Standalone Demo**.
- A **Standalone Demo URL** does not belong to a JavaScript **Page**.
- A **Standalone Demo URL** does not create a separate configured **Page**.
- A framed **Standalone Demo** exposes its **Standalone Demo URL** for direct navigation and copying.
- A **Request Demo** belongs to one Markdown **Page** and targets one author-specified site-root request path with an optional query string.
- A **Request Demo** does not create a separate configured **Page**.
- A **Request Demo** does not create a generated standalone URL.
- A **Request Demo** displays source code but does not execute that source code.
- A **Request Demo** source code is visible Markdown content, not Markdown Page setup code or browser code.
- A **Request Demo** treats its live target response as primary and its displayed source code as supporting material.
- A **Request Demo** requires valid authoring metadata.
- A **Request Demo** does not require Rocket to validate that the request URL matches an existing **Page**.
- A **Request Demo** presents its target response as normal same-site browser content.
- A **Request Demo** uses a browser GET request for its target response.
- A **Request Demo** displays its target request as `GET` plus its target request path.
- A **Request Demo** lets the Site Author set a positive pixel frame height.
- A **Request Demo** loads its target response lazily.
- A **Request Demo** includes its live target response in server-rendered HTML.
- A **Request Demo** may have a **Code Block Label** for its displayed source code.
- A **Request Demo** lets a Site Author copy its displayed source code.
- A **Request Demo** lets a Site Author open and copy its target request path.
- A **Request Demo** copies the authored target request path exactly.
- A **Request Demo** opens its target request path without replacing the parent Markdown **Page**.
- **Page Metadata** belongs to exactly one **Page**.
- **Page Metadata** is created during Page discovery.
- **Page Metadata** is normalized before layouts, navigation, generated outputs, or JavaScript Pages consume it.
- **Page Metadata** is not raw Page config.
- Author-facing **Page Metadata** is configured under `config.metadata`.
- A **Page** title is **Page Metadata**; Site Authors configure it as `config.metadata.title`, not top-level `config.title`.
- **Page Metadata** includes descriptive facts about a **Page**, initially `title`, `description`, `date`, `updated`, `tags`, and `authors`.
- `date` and `updated` in **Page Metadata** use date-only ISO strings.
- `tags` in **Page Metadata** are normalized to trimmed unique strings.
- `authors` in **Page Metadata** are author display-name strings.
- Known **Page Metadata** fields are validated strictly during Page discovery.
- Unknown root fields in `config.metadata` are invalid.
- Project-specific Page metadata belongs under `config.metadata.custom`.
- Rocket preserves `config.metadata.custom` without assigning meaning to its keys.
- `config.metadata.custom` contains structured data only.
- Normalized **Page Metadata** is exposed from discovered **Pages** as `page.metadata`.
- Normalized **Page Metadata** includes resolved `title` and `linkText` values for callers.
- Author-facing `linkText` remains `config.menu.linkText`.
- Callers should read resolved Page titles from `page.metadata.title`, not `page.title`.
- Callers should read resolved Page link text from `page.metadata.linkText`, not `page.linkText`.
- **PageData** exposes the current **Page Metadata** as `pageData.metadata`.
- `pageData.title` remains a layout convenience backed by the current **Page Metadata** title.
- A **Page** route path, render behavior, menu behavior, and **Site Discoverability Page Options** are not **Page Metadata**.
- `menu.linkText` is a navigation label and may differ from the **Page Metadata** title.
- Markdown **Page** title resolution uses `config.metadata.title`, then the first `h1`, then `config.menu.linkText`, then a fallback from the route path.
- JavaScript **Page** title resolution uses `config.metadata.title`, then `config.menu.linkText`, then a fallback from the route path.
- Static **Pages** do not require a **Page Collection**.
- **Page Collections** are optional and exist for repeatable content workflows.
- The first **Page Collection** slice is backed by discovered **Pages** from the **Page** registry.
- A **Page Registry Query** creates **Page Collections** from normalized **Page Metadata** and route paths.
- A **Page Registry Query** reads existing discovered **Pages**; it does not load external files, databases, or CMS content in the first slice.
- A **Page Collection** may represent blog posts as discovered **Pages** tagged through **Page Metadata** and sorted by `metadata.date`.
- Pagination is behavior over a **Page Collection**, not a property of an individual **Page**.
- Future file, database, or CMS content sources may become **Adapters** behind the **Page Collection** seam.
- A **Page Runtime** owns the lifecycle of **PageData** for every **Page** render.
- The public **Page Runtime** interface exposes render behavior only; Page matching stays inside the implementation.
- A **Page Runtime** passes **Adapter Context** to JavaScript Pages under an `adapterContext` field without interpreting platform-specific fields.
- A **Page Runtime** normalizes every **JavaScript Page Result** to a web `Response`.
- A **Page Runtime** passes JavaScript Page params as `Record<string, string | undefined>`.
- A **Server-rendered JavaScript Page** uses the same JavaScript Page execution model as other JavaScript Pages.
- A **Server-rendered JavaScript Page** requires a deployment adapter for production builds.
- A **Page Module Loader** varies between development, static build, and deployment environments.
- A **Page Module Loader** returns a **Loaded Page Module**, not a raw JavaScript import.
- A **Page Module Loader** loads a **Page Variant**; layout selection stays inside the **Page Runtime**.
- A **Loaded Page Module** normalization Module converts environment-loaded raw modules into **Loaded Page Modules** behind the **Page Module Loader** seam.
- **Page Module Loader** Adapters own environment-specific loading mechanics; the **Loaded Page Module** normalization Module owns the execution shape returned to the **Page Runtime**.
- **Page Variant** handling stays in **Page Module Loader** Adapters because it affects environment-specific loading mechanics.
- A **Page Module Loader** Adapter declares whether a raw module is Markdown or JavaScript before passing it to the **Loaded Page Module** normalization Module.
- The **Loaded Page Module** normalization Module does not infer Page kind from file names.
- The **Loaded Page Module** normalization Module owns optional JavaScript Page hydration wrapping when an Adapter provides component parsing.
- A **Registered Component** belongs to the **Page** module that exports it through the explicit `components` export.
- Markdown Pages and JavaScript Pages use the same explicit `components` export for **Registered Components**.
- A **Page-local Custom Element** belongs to exactly one Markdown **Page**.
- A **Page-local Custom Element** is not a **Registered Component**.
- A Markdown **Page** owns a **Page-local Custom Element** only when that Page declares the custom element tag name in its own browser code.
- **Page-local Custom Element** ownership requires an explicit custom element tag name.
- **Page-local Custom Element** ownership is exact per custom element tag name.
- An authored custom element tag in a Markdown **Page** cannot be both a **Registered Component** and a **Page-local Custom Element**.
- An **Icon Component** is a Rocket-owned **Registered Component**.
- An **Icon Component** creates one **Icon Reference**.
- An **Icon Component** with no **Icon Label** is decorative.
- An **Icon Component** receives an **Icon Label** through standard ARIA attributes.
- An **Icon Label** does not change an **Icon Reference**.
- An **Icon Reference** belongs to exactly one **Icon Library**.
- An **Icon Library** has exactly one **Icon Library Source**.
- A reusable layout may supply **Layout Icon Libraries**.
- Icon Libraries are made available by **Layout Icon Libraries** or **Icon Library Configuration**, not by a Rocket-wide default set.
- Icon Library names are unique across active **Layout Icon Libraries** and **Icon Library Configuration** for one rendered **Page**.
- **Icon Library Configuration** cannot override **Layout Icon Libraries** in the first slice.
- A rendered **Page** has at most one **Default Icon Library**.
- An **Icon Component** without an explicit Icon Library uses the **Default Icon Library**.
- An **Icon Component** explicitly names an **Icon Library** with the `library` attribute.
- **Layout Icon Libraries** may select the **Default Icon Library**.
- **Icon Library Configuration** may select the **Default Icon Library**.
- Menu icon names configured by a **Page** are author-owned **Icon References**, even when rendered by a layout.
- Menu icon names configured by a **Page** do not name an **Icon Library** in the first slice.
- Author-owned **Icon References** use the **Default Icon Library** unless they explicitly name an **Icon Library**.
- An **Icon Reference** contains one **Icon Name**.
- An **Icon Component** must provide a non-empty **Icon Name**.
- First-slice **Icon Names** are derived from SVG file basenames.
- Duplicate **Icon Names** inside one **Icon Library** are invalid.
- Icon package style or family variants that share icon names are modeled as separate **Icon Libraries**.
- An **Icon Component** has exactly one **Icon Loading Strategy**.
- The initial **Icon Loading Strategy** vocabulary is `auto`, `server`, and `client`.
- An **Icon Component** without an `icon-loading` attribute uses the automatic **Icon Loading Strategy**.
- An **Icon Loading Strategy** outside the vocabulary is invalid.
- An automatic **Icon Component** is server-rendered unless an **Icon Loading Region** exhausts its **Icon Server Budget**.
- An **Icon Server Budget** counts automatic **Icon Components** in rendered DOM order.
- An **Icon Server Budget** may be zero.
- Explicit server-loaded or client-loaded **Icon Components** do not consume an **Icon Server Budget**.
- A client-loaded **Icon Component** still has stable server-rendered placeholder output.
- An **Icon Component** has stable text-relative default geometry.
- A deferred **Icon Component** fetches its SVG when it becomes visible.
- An **Icon Loading Region** can influence the **Icon Loading Strategy** of Icon Components it contains.
- An **Icon Loading Region** is created by the presence of the `icon-loading-region` attribute.
- An **Icon Loading Region** owns its own **Icon Server Budget**.
- An **Icon Loading Region** without an **Icon Server Budget** has an unlimited **Icon Server Budget**.
- The nearest ancestor **Icon Loading Region** owns automatic **Icon Components** for budget purposes.
- A nested **Icon Loading Region** does not consume its parent **Icon Server Budget**.
- A client-created **Icon Component** cannot use a server-only **Icon Loading Strategy**.
- An **Icon Component** owns client-side fetching and visibility-triggered loading for its deferred SVG.
- An **Icon Manifest** is passive data and does not load icons by itself.
- An emitted **Icon Manifest** maps all **Icon References** found in one rendered **Page**, plus explicit Page-added **Icon References**, to generated icon asset URLs.
- A client-created or deferred **Icon Component** can fetch only an **Icon Reference** present in the **Icon Manifest**.
- An **Icon Manifest** may include the rendered **Page**'s resolved **Default Icon Library**.
- A browser-loaded **Registered Component** may create **Icon Components** after server rendering.
- A **Standalone Demo** does not satisfy **Page-local Custom Element** ownership for its parent Markdown **Page**.
- A Markdown **Page** with authored custom element tags must either register them as **Registered Components** or own them as **Page-local Custom Elements**; missing custom element ownership fails loudly instead of rendering unresolved elements silently.
- Markdown **Page** validation for authored custom element tags runs during setup/Page discovery when Rocket can inspect the Markdown source.
- Markdown **Page** validation is strict: every authored custom element tag name containing a hyphen must be owned by the Page or exempt as a Rocket-owned generated element.
- Rocket-owned generated elements, such as **JavaScript Demo** and **Request Demo** frames, do not require a **Page** `components` export.
- A **Code Block** has exactly one **Code Block Frame**.
- A **Code Block Label** is optional display text.
- A **Code Block Frame** shows a header only when the Code Block has a Code Block Label.
- A **Code Block** copy action copies the authored code content, not the rendered syntax markup.
- A **Code Block** copy action belongs to the Code Block Frame.
- **JavaScript Demos** and **Request Demos** compose **Code Block Frames** for displayed source code.
- **JavaScript Demos** and **Request Demos** reveal displayed source code through a Source disclosure.
- A **Request Demo** frame identifies the same-site `GET` response separately from the composed **Code Block Frame** that identifies its displayed source code.
- A **Request Demo** Code Block Label identifies the displayed source code, not the same-site `GET` response.
- A **JavaScript Demo** Code Block Label identifies the displayed source code, not the browser-rendered example.
- A **JavaScript Demo** frame identifies the browser-rendered example separately from the composed **Code Block Frame** that identifies its displayed source code.
- A **JavaScript Demo** frame resizes the browser-rendered example by width.
- A **Request Demo** frame resizes the iframe response viewport by height.
- A **Request Demo** height is the initial iframe response viewport height.
- A **Site Author** configures Pages, layouts, menus, assets, Registered Components, Loading Strategies, and deployment adapters.
- A **Site Author** configures Icon Libraries through **Icon Library Configuration**.
- **Icon Library Configuration** declares **Icon Library Sources**.
- **Layout Icon Libraries** are separate from **Icon Library Configuration**.
- **Icon Library Configuration** is separate from **Site Head Metadata**.
- A **Site Author** configures the **Site Origin** when generated outputs need public absolute URLs.
- A **Site Author** gives a **Coding Agent** a **Site Brief** before Zero-install Agent Onboarding creates an **Agent Starter Site**.
- A **Site Author** may use a **Coding Agent** to create or modify a Rocket site.
- **Zero-install Agent Onboarding** is Rocket's primary first-start path for **Site Authors**.
- **Zero-install Agent Onboarding** starts from public instructions rather than an installed Rocket-specific agent extension.
- **Zero-install Agent Onboarding** creates a **Rocket Agent Skill** for future **Coding Agent** edits.
- **Zero-install Agent Onboarding** creates an **Agent Starter Site** by default.
- An **Agent Starter Site** uses static Pages unless the **Site Author** asks for request-time behavior.
- A **Rocket Initializer** may create an **Agent Starter Site** in an empty project or add Rocket documentation Pages to an existing codebase.
- A **Rocket Initializer** creates a compact Atlas-backed **Agent Starter Site** with shared layout data, starter documentation Pages, demo examples, and a **Rocket Agent Skill**; project-specific expansion belongs to a **Coding Agent**.
- A **Rocket Initializer** creates a **Rocket Agent Skill** by default.
- A **Rocket Initializer** creates **General Documentation Pages** in the project's documentation area for both **Standalone Rocket Sites** and documentation added to an existing codebase.
- **Component Reference Pages** may live near the component they document.
- A **Rocket Initializer** discovers both **General Documentation Pages** and colocated **Component Reference Pages** by default.
- **Zero-install Agent Onboarding** should produce a **Deployable Rocket Site** without requiring hosting credentials.
- **Zero-install Agent Onboarding** may produce a **Deployed Rocket Site** when the **Site Author** gives the **Coding Agent** hosting access.
- **Site Head Metadata** applies to rendered **Pages**.
- **Site Head Metadata** is distinct from **Site Discoverability**.
- **Site Head Metadata** is enabled explicitly by the **Site Author** for a Rocket site.
- Author-facing **Site Head Metadata** is configured under `siteHeadMetadata`.
- Page-level **Site Head Metadata Page Options** are configured under `config.siteHeadMetadata`.
- An **Agent Starter Site** includes **Site Head Metadata** by default.
- **Page Metadata** provides Page-specific title and description facts for **Site Head Metadata**.
- **Site Head Metadata** reuses **Page Metadata** before defining separate social metadata fields.
- **Site Head Metadata Page Options** control Page-specific **Site Head Metadata** outside **Page Metadata**.
- **Site Head Metadata Page Options** control HTML indexing metadata separately from **Robots File** directives.
- HTML indexing metadata uses `index` or `noindex` for a rendered **Page**.
- Author-facing HTML indexing metadata is configured as `config.siteHeadMetadata.indexing`.
- **Site Head Metadata** requires a site name and default description when enabled.
- **Site Head Metadata** requires a language when enabled.
- **Site Head Metadata** uses a **Page Metadata** description when present and otherwise uses its default description.
- **Site Head Metadata** uses the site name as the home Page title and combines other Page titles with the site name.
- **Site Head Metadata** uses the current concrete Page path with **Site Origin** for canonical and social URLs.
- **Site Head Metadata** requires **Site Origin** when enabled.
- Production **Site Head Metadata** that needs public absolute URLs requires a **Site Origin**.
- **Site Head Metadata** includes baseline social title, description, type, URL, site name, and card metadata when enabled.
- **Site Head Metadata** can emit baseline social metadata without a **Social Preview Image**.
- Author-facing **Social Preview Image** configuration uses `socialPreview`.
- **Favicon Assets** and theme color are optional **Site Head Metadata**.
- **Site Head Metadata** references **Favicon Assets** provided by the **Site Author**.
- **Site Head Metadata** does not require Rocket to create or verify **Favicon Assets**.
- A **Favicon Asset** may be published as a **Public Asset**.
- **Public Assets** are published by convention and do not require **Page** configuration.
- **Public Assets** are owned by the Rocket project root.
- **Public Assets** keep the same public URL in development and static builds.
- **Public Assets** are not configured **Pages**.
- **Public Assets** are not included in the **Sitemap**.
- **Public Assets** are published files, not deployment **Adapter** routes.
- **Public Assets** cannot share a public URL with **Pages** or Rocket-generated outputs.
- A **Public Asset** named `index.html` claims its containing document URL.
- **Public Assets** exclude hidden dotfiles by default, except for files under the `.well-known` directory.
- **Public Assets** must be regular files.
- **Site Origin** provides the public origin for absolute URLs in **Site Head Metadata**.
- Rocket-owned layouts render **Site Head Metadata** for rendered **Pages**.
- A **JavaScript Page Result** that returns a complete HTML document is responsible for its own **Site Head Metadata**.
- **Document Baseline Metadata** is distinct from **Site Head Metadata**.
- Rocket-owned document helpers include **Document Baseline Metadata** independent of **Site Head Metadata**.
- **Site Head Metadata** includes the selected **Social Preview Image** for a rendered **Page**.
- **Social Preview Image** selection belongs to **Site Head Metadata**, not **Page Metadata**.
- A **Page** may have an **Explicit Social Preview Image**.
- Author-facing **Explicit Social Preview Image** configuration uses `image`.
- An **Explicit Social Preview Image** may come from a Page-relative asset, a site-root asset, or an absolute public URL.
- Rocket resolves local **Explicit Social Preview Images** to public absolute URLs for **Site Head Metadata**.
- Every public rendered **Page** should have a **Social Preview Image**.
- Generated archive **Pages** should have **Social Preview Images**.
- **Standalone Demo URLs** do not have **Social Preview Images** by default.
- A **Default Social Preview Image** is used when a **Page** has no **Explicit Social Preview Image**.
- **Default Social Preview Images** vary by **Page** by default.
- Pages that produce identical **Default Social Preview Images** may share the same generated image asset.
- A **Default Social Preview Image** is created from a **Social Preview Template**.
- Author-facing **Social Preview Template** configuration uses a `template` function value.
- A **Social Preview Template** is rendered through **Social Preview Capture**.
- A **Social Preview Template Preview** lets a **Site Author** inspect a **Social Preview Template** during development.
- A **Social Preview Template Preview** is development-time behavior by default.
- A **Social Preview Template Preview** does not create public **Pages** by default.
- A **Social Preview Image Fingerprint** includes only inputs that can change the pixels of a **Default Social Preview Image**.
- A **Default Social Preview Image** is reused when its **Social Preview Image Fingerprint** has not changed.
- A **Social Preview Template** is not a configured **Page**.
- A **Social Preview Template** does not appear in **Page** registries, menus, or **Page Collections**.
- An externally generated image, including an image created with an image generation service, is an **Explicit Social Preview Image** when selected by a **Site Author**.
- Author-facing **Social Preview Image Delivery Strategy** configuration uses `delivery`.
- **Social Preview Image Delivery Strategy** defaults to static delivery.
- A **Social Preview Image Delivery Strategy** may produce static generated image files during build.
- A **Social Preview Image Delivery Strategy** may use a deployment **Adapter** to produce request-time generated image files.
- Adapter-backed **Social Preview Image Delivery Strategies** are selected explicitly by the **Site Author**.
- Static **Social Preview Image Delivery Strategies** produce every required **Default Social Preview Image** during build.
- Adapter-backed **Social Preview Image Delivery Strategies** may produce **Default Social Preview Images** on first public request.
- A **Registered Component** has exactly one **Loading Strategy**.
- A **Hydration Strategy** exists only for **Loading Strategy** values that start with `hydrate:`.
- A **Registered Component** is browser-loaded when its **Loading Strategy** is client-loaded or has a **Hydration Strategy**.
- A server-only **Registered Component** is not browser-loaded.
- **Component Hydration** is shared by Markdown Pages and JavaScript Pages.
- **Component Hydration** may vary asset URL generation by Adapter, but classification and validation of Registered Components stay Rocket-owned.
- **Site Discoverability** emits generated build outputs; it does not create configured **Pages**.
- **Site Discoverability** initially includes the **Sitemap** and **Robots File** only.
- **Site Discoverability** does not include search indexes, feeds, redirects, headers, or custom JSON indexes.
- **Site Discoverability** is enabled explicitly by the **Site Author**; configuring a **Site Origin** alone does not emit generated outputs.
- **Site Discoverability** fails the build when the **Sitemap** or **Robots File** is enabled without a **Site Origin**.
- A **Sitemap** lists public concrete **Page** URLs for crawler discovery.
- A **Sitemap** uses the **Site Origin** to produce absolute public **Page** URLs.
- A **Robots File** may point crawlers at the **Sitemap**.
- A **Robots File** uses the **Site Origin** when pointing crawlers at the **Sitemap**.
- **Site Discoverability Page Options** allow a **Page** to opt in or out of the **Sitemap** and **Robots File** independently.
- **Site Discoverability Page Options** use a boolean `sitemap` value for Sitemap inclusion.
- **Site Discoverability Page Options** use `robots: 'allow' | 'disallow'` for Robots File crawler directives.
- `robots: 'disallow'` means the **Robots File** emits a `Disallow` directive for the **Page** path.
- `robots: 'allow'` means the **Robots File** emits no Page-specific `Disallow` directive.
- **Site Discoverability** does not use `robots` options for `noindex` HTML metadata.
- **URL Lifecycle** is separate from **Site Discoverability**.
- The first **URL Lifecycle** slice includes **Redirects** only.
- Rewrites, global trailing slash policy, and canonical metadata are not part of the first **URL Lifecycle** slice.
- A **Site Author** configures **URL Lifecycle** centrally in project configuration.
- Author-facing **URL Lifecycle** project configuration uses `urlLifecycle`.
- Author-facing **Redirect** project configuration uses `urlLifecycle.redirects`.
- A **Redirect** is public URL behavior, not **Page Metadata**.
- A **Redirect** does not create a configured **Page**.
- A **Redirect** source is an internal absolute path.
- A **Redirect** target is either an internal absolute path or an absolute `http:` or `https:` URL.
- A **Redirect** target is not a relative path or protocol-relative URL.
- A **Redirect** defaults to status `308`.
- A **Redirect** may use status `301`, `302`, `307`, or `308`.
- The first **Redirect** slice matches exact paths only.
- Pattern, splat, and parameterized **Redirects** are not part of the first **Redirect** slice.
- A **Redirect** source is not normalized for trailing slashes in the first **Redirect** slice.
- `/old` and `/old/` are different **Redirect** sources.
- A **Redirect** produces an HTTP redirect response in development and server-rendered adapter contexts.
- A **Redirect** is matched before loading or rendering a **Page** for the source URL.
- Static builds without a deployment **Adapter** emit fallback HTML files for **Redirect** sources.
- A fallback HTML file for a **Redirect** source is generated output, not a configured **Page**.
- **Redirect** source fallback files are excluded from the **Sitemap**.
- A deployment **Adapter** may emit native platform redirect output for **Redirects**.
- The Netlify **Adapter** emits native Netlify redirect output for **Redirects**.
- A **Redirect** source cannot equal a configured **Page** path.
- A **Redirect** source cannot equal a Rocket-generated output path.
- Two **Redirects** cannot share the same source.
- A **Redirect** target may point to a configured **Page**, Rocket-generated output path, or external URL.
- A **Redirect** target is not required to exist in the first **Redirect** slice.
- A **Redirect** is matched before exact or parameterized **Page** matching.
- Public concrete static **Pages** are included in the **Sitemap** by default.
- Public concrete server-rendered **Pages** are included in the **Sitemap** by default.
- Parameterized **Pages** are excluded from the **Sitemap** until Rocket has a static params Module that can enumerate their public URLs.
- `menu: false` does not exclude a **Page** from **Site Discoverability**.
- **Standalone Demo URLs** are excluded from the **Sitemap** by default.
- A **Page Runtime** keeps final invalid-module validation and typed `INVALID_PAGE_MODULE` errors after receiving a **Loaded Page Module**.
- A **Loaded Page Module** preserves whether the loaded **Page** is Markdown or JavaScript; execution policy stays inside the **Page Runtime**.
- An **Agent Workflow** selects an agent's working method without changing issue eligibility, issue lifecycle state, or verification gates.
- An issue without an explicit **Agent Workflow** uses the default **Agent Workflow**.
- The initial **Agent Workflow** vocabulary is `tdd` for behavior and code changes and `content` for documentation, website copy, examples, navigation, and static content changes.
- An issue with an unknown **Agent Workflow** is malformed and stops issue-loop planning.
- An issue's explicit **Agent Workflow** is the durable source of truth for agent runs.
- The `content` **Agent Workflow** uses direct implementation while preserving normal verification gates and adding relevant content-specific checks.
- **Agent Loop Recovery** and **Agent Loop Resume** are distinct continuation paths.
- Development and static build should prove the **Page Runtime** before the Netlify adapter adopts it.
- The **Page Runtime** interface is the primary test surface, using a fake **Page Module Loader** in focused tests.

## Example dialogue

> **Dev:** "Should the **Page Runtime** import the page file directly?"
> **Domain expert:** "No. The **Page Runtime** executes the **Page**; a **Page Module Loader** handles environment-specific loading."
> **Dev:** "Should static build get raw HTML instead of a `Response`?"
> **Domain expert:** "No. The **Page Runtime** always returns a `Response`; static build reads the body and writes it."
> **Dev:** "Should a broken **Page** become a `500` response automatically?"
> **Domain expert:** "No. The **Page Runtime** throws typed errors for broken Pages; each Adapter decides how to report them."
> **Dev:** "Should static build bypass requests because it already knows the route path?"
> **Domain expert:** "No. Static build synthesizes a `Request` so **Page** matching and execution use the same path."
> **Dev:** "Should the **Page Runtime** care whether the module came from Node import attributes or generated Netlify imports?"
> **Domain expert:** "No. A **Page Module Loader** returns a **Loaded Page Module** so the **Page Runtime** sees one execution shape."
> **Dev:** "Should WDS own the `standaloneDemo` query behavior?"
> **Domain expert:** "No. **Standalone Demo** rendering is **Page Runtime** behavior for Markdown Pages."
> **Dev:** "Can **Standalone Demo URLs** be treated as private implementation details?"
> **Domain expert:** "No. **Standalone Demo URLs** are public and stable in development and deployed builds."
> **Dev:** "Should users or Adapters assemble **PageData** by hand?"
> **Domain expert:** "No. The **Page Runtime** owns **PageData** creation and passes a stable object to layouts and JavaScript Pages."
> **Dev:** "Should the Netlify adapter be refactored in the first **Page Runtime** slice?"
> **Domain expert:** "No. Prove the **Page Runtime** through development and static build first; move Netlify after the generated-code constraints are clear."
> **Dev:** "Should tests start at WDS because that is where rendering happens today?"
> **Domain expert:** "No. Test the **Page Runtime** interface directly with a fake **Page Module Loader**, then keep Adapter tests thin."
> **Dev:** "Should callers ask the **Page Runtime** to match a **Page** without rendering it?"
> **Domain expert:** "No. The public **Page Runtime** interface renders a `Request`; matching is internal until a real caller needs it."
> **Dev:** "Should the **Page Module Loader** receive a layout or a boolean for Standalone Demo?"
> **Domain expert:** "No. It receives a **Page Variant**; the **Page Runtime** selects the layout."
> **Dev:** "Should a **Page Module Loader** return a function that renders the **Page**?"
> **Domain expert:** "No. It returns a **Loaded Page Module** with its Page kind; the **Page Runtime** executes it."
> **Dev:** "Should Cloudflare-specific `env` or `ctx` fields become Page Runtime concepts?"
> **Domain expert:** "No. They travel through **Adapter Context** so JavaScript Pages can use them while Rocket keeps one render interface."
> **Dev:** "Should platform fields be spread into the JavaScript Page context?"
> **Domain expert:** "No. Platform fields stay nested under `adapterContext` so they cannot collide with Rocket fields."
> **Dev:** "Should JavaScript Pages have to return a `Response` directly?"
> **Domain expert:** "No. They may return a **JavaScript Page Result**; the **Page Runtime** normalizes it to a `Response`."
> **Dev:** "Should JavaScript Page params use `unknown` because different Adapters may provide different shapes?"
> **Domain expert:** "No. Params are Rocket-owned route matching data and use `Record<string, string | undefined>`."
> **Dev:** "Should Adapters pass path and origin separately to the **Page Runtime**?"
> **Domain expert:** "No. The **Page Runtime** derives both from `Request.url`."
> **Dev:** "Should the first **Page Runtime** slice redesign Page discovery too?"
> **Domain expert:** "No. It accepts the existing Page registry shape; Page discovery can deepen separately."
> **Dev:** "Is a Markdown **Page** custom element defined in that Page's browser code a **Registered Component**?"
> **Domain expert:** "No. It is a **Page-local Custom Element**; Rocket does not manage it with **Component Hydration**."
> **Dev:** "Can the same authored tag be both a **Registered Component** and a **Page-local Custom Element**?"
> **Domain expert:** "No. Each authored custom element tag in a Markdown **Page** has exactly one owner."
> **Dev:** "Can Rocket infer a **Code Block Label** from the Markdown language?"
> **Domain expert:** "No. A **Code Block Label** is explicit display text; language and label are different facts."
> **Dev:** "Should the Markdown language name decide the whole **Code Block** presentation?"
> **Domain expert:** "No. The language identifies syntax; the **Code Block Frame** identifies presentation."
> **Dev:** "Should copying a **Code Block** read from the rendered highlighted DOM?"
> **Domain expert:** "No. Copying uses the authored code content so syntax markup, line wrappers, and frame labels do not leak into the clipboard."
> **Dev:** "Does **Agent Workflow** decide whether an issue is eligible or which checks run?"
> **Domain expert:** "No. It only selects the agent's working method; eligibility, lifecycle state, and verification gates stay separate."

## Flagged ambiguities

- "route" sometimes means the configured path and sometimes the executable page; resolved: use **Page** for the executable content entry, and "route path" for the path string.
- `?standaloneDemo` was used as a Standalone Demo URL; resolved: query-string variants are an implementation detail, while **Standalone Demo URLs** are public stable URLs.
- "url demo" was proposed for framed request examples; resolved: use **Request Demo** and `js request-demo` to avoid confusion with **Standalone Demo URLs**.
- "preview" was used for framed JavaScript Demos; resolved: use **JavaScript Demo** and `rocket-js-demo` for the authored frame.
- "workflow" could mean issue lifecycle or checks; resolved: use **Agent Workflow** only for the agent's working method.
- "resume" was used for both committing an already completed agent result and continuing partial work; resolved: use **Agent Loop Recovery** for the former and **Agent Loop Resume** for the latter.
- "file/path code block" was used as a visual description; resolved: use **Code Block Label** for optional display text in a **Code Block Frame**.
- "system language" was used to describe code block presentation; resolved: use **Code Block Frame** for presentation and language for syntax.
- "loading" could mean either Registered Component browser activation or icon asset availability; resolved: use **Loading Strategy** for Registered Components and **Icon Loading Strategy** for Icon Components.
- "above the fold" was used for icon server-rendering policy; resolved: use **Icon Loading Regions** and **Icon Server Budgets** instead of automatic viewport measurement.
- "path" for icons could mean a package location or a project-local SVG folder; resolved: use **Icon Library Source** for the domain concept.
- "theme icon libraries" was used for icons supplied by Atlas-style reusable presentation; resolved: use **Layout Icon Libraries** because Rocket models Atlas as layouts, not themes.
- "default icons" was used for a Rocket-wide icon library set; resolved: reusable layouts supply **Layout Icon Libraries** instead.
- "client loader" was used for icon fetching behavior; resolved: the **Icon Component** owns client-side loading and the **Icon Manifest** is only passive Page data.
- `library` and `icon-library` were both candidates for explicit Icon Library selection; resolved: use `library` because the **Icon Component** tag already scopes the attribute.
- "label" was considered for meaningful icons; resolved: use standard ARIA attributes for the **Icon Label** instead of a custom label attribute.
- "size" was considered for Icon Component dimensions; resolved: use CSS and text-relative default geometry instead of a first-slice size attribute.
- "icons" could mean browser **Favicon Assets** or **Icon Libraries**; resolved: keep **Icon Library Configuration** separate from **Site Head Metadata**.
- "global icon cap" was considered for automatic icon deferral; resolved: automatic Icon Components are server-rendered unless an **Icon Loading Region** budget defers them.
