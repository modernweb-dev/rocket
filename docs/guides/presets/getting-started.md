# Presets >> Getting Started || 10

Presets are partial rocket configs that combine any number of plugins to add specific features. Rocket is built on these presets, like `rocketLaunch`, `rocketBlog`, and `rocketSearch`

You can use a preset via the config by adding it to the `presets` array

<!-- prettier-ignore-start -->
```js copy
import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default ({
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
});
```
<!-- prettier-ignore-end -->

## Community Presets

There are a number of community-made presets available:

<!--
  -- Thank you for your interest in rocket. To add your preset,
  -- follow the format below. Please add your preset in alphabetical order.
  -->

- [rocket-preset-code-tabs](https://www.npmjs.com/package/rocket-preset-code-tabs) - Add tab elements for code blocks
- [rocket-preset-custom-elements-manifest](https://www.npmjs.com/package/rocket-preset-custom-elements-manifest) - Documents code generation for JavaScript libraries, particularly custom elements.
- [rocket-preset-markdown-directives](https://www.npmjs.com/package/rocket-preset-markdown-directives) - Add your own custom md code block directives
- [rocket-preset-playground-elements](https://www.npmjs.com/package/rocket-preset-playground-elements) - Live code editors that run in-browser
- [rocket-preset-slide-decks](https://www.npmjs.com/package/rocket-preset-slide-decks) - Slide decks in Markdown and HTML
- [rocket-preset-webcomponents-dev](https://www.npmjs.com/package/rocket-preset-webcomponents-dev) - Live code editors that run on webcomponents.dev

> Want your plugin listed here? Please [create a PR](https://github.com/modernweb-dev/rocket/edit/main/docs/guides/presets/getting-started.md)!
