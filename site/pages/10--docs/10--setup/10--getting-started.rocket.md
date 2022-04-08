```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/10--setup/10--getting-started.rocket.md';
import {
  html,
  layout,
  setupUnifiedPlugins,
  components,
  openGraphLayout,
} from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components, openGraphLayout };
/* END - Rocket auto generated - do not touch */

export const subTitle = 'Create your first Rocket site';
```

# Getting started

Rocket is a modern (static) site builder. Learn what Rocket is all about from [our homepage](https://rocket.modern-web.dev/) or [our release post](https://rocket.modern-web.dev/blog/introducing-rocket). This page is an overview of the Rocket documentation and all related resources.

## Try Rocket

The easiest way to try Rocket is to run

```bash
npx @rocket/create@latest
```

This wizard will assist you in starting a new Rocket project.
It allows you to choose one of our default templates or to enter the url of a community template.

Once you have a project running continue with [the next steps](./20--adding-pages.rocket.md).

## Learn Rocket

All kind of different people come to Rocket and each of those may bring a different learning style. Whether you prefer a more theoretical or a practical approach, we hope you'll find this section helpful.

- If you prefer to **learn by doing**, start with our [examples](#example-projects).
- If you prefer to **learn concepts step by step**, start with our [basic concepts and guides](../20--basics/10--project-structure.rocket.md).

Like any unfamiliar technology, Rocket comes with a slight learning curve. However, with practice and some patience, we know, you _will_ get the hang of it, in no time.

### Example Projects

If you prefer to learn Rocket by example, check out our [examples](https://github.com/modernweb-dev/rocket/tree/next/examples) on GitHub.

You locally install any of these examples by running `npx @rocket/create@latest` and selecting it within the wizard.

To pre select a template you can use the `--template` CLI flag. The `--template` flag also supports third-party, community templates.

```bash
# Run the init wizard and use an official template
npx @rocket/create@latest --template blog
npx @rocket/create@latest --template <folder name of example>
# Run the init wizard and use a community template
npx @rocket/create@latest --template user/repo
npx @rocket/create@latest --template user/repo/path/to/example
```

Templates can also be hosted on [GitLab, BitBucket and Sourcehut](https://github.com/Rich-Harris/degit#basics).

### API Reference

This documentation section is useful when you want to learn more details about a particular Rocket API. For example, [Configuration Reference](../20--basics/95--configuration.rocket.md) lists all possible configuration options available to you. [Built-in Components Reference](../20--basics/40--components.rocket.md) lists all available core components, like `<Markdown />` and `<Code />`.

### Versioned Documentation

This documentation always reflects the latest stable version of Rocket. Once we hit the v1.0 milestone, we will add the ability to view versioned documentation.

## Staying Informed

The [@modern_web_dev](https://twitter.com/modern_web_dev) Twitter account is the official source for updates from the Rocket team.

We also post release announcements to our [Discord community](https://rocket.modern-web.dev/chat) in the #announcements channel.

Not every Rocket release deserves its own blog post, but you can find a detailed changelog for every release in the [`CHANGELOG.md` file in the Rocket repository](https://github.com/modernweb-dev/rocket/blob/main/packages/engine/CHANGELOG.md).

## Something Missing?

If something is missing in the documentation or if you found some part confusing, please [file an issue for the documentation](https://github.com/modernweb-dev/rocket/issues/new) with your suggestions for improvement, or tweet at the [@modern_web_dev](https://twitter.com/modern_web_dev) Twitter account. We love hearing from you!

## Credit

This getting started guide was originally based off of [astro](https://astro.build/) getting started guide.
