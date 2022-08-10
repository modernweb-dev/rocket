# Migration

## From 0.10.x to 0.20.x

As 0.20.x is a rewrite of all the core logic which meant moving from eleventy to class based templates, server side rendering of web components and a file based routing this migration requires manual work.

Most of the work however mostly applies if you adjusted templates/layouts or created your own presets/plugins.

Especially for markdown based content not so much changed.
The biggest change is that the routing is now [file based](https://rocket.modern-web.dev/docs/basics/routing/) which means that your page structure is no longer in the title or frontmatter.

e.g.

👉 `docs/about-us/company/location.md`

```md
# About Us >> Company >> Locations || 20
```

becomes

👉 `docs/about-us/company/20--location.rocket.md`

```md
# Location
```

This task can be automated by

1. update to latest `@rocket/cli`
2. rename `docs` to `site/pages`
3. run `npx rocket upgrade`

This however will only extract the navigation data and rename the files.
To fully migrate you need to setup some files according to the [project structure](https://rocket.modern-web.dev/docs/basics/project-structure/).
At the minium a `site/pages/recursive.data.js` to define the default template.

If you need more information or help be sure to check out our [discord](https://discord.gg/sTdpM2rkKJ) community.
