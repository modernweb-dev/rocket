# First Pages >> Use JavaScript || 40

If you would like to add JavaScript to a page, you can do it inline using the `script` markdown directive. The script you write runs on the page as a module.

<!-- prettier-ignore-start -->
~~~markdown
```js script
const message = 'Hello, World!';
console.log(message);
```
~~~
<!-- prettier-ignore-end -->

Adding the above will log `Hello, World!` to the console without adding a global `message` variable.

This can be useful for importing web components and using them in Markdown. Imagine you had some `magic-reveal` element that you wanted to use on a page:

<!-- prettier-ignore-start -->
~~~markdown
```js script
import 'magic-reveal/magic-reveal.js';
```

<magic-reveal>

This text will get magically revealed.

I can **still** use Markdown as long as there is an empty line
between the opening/closing tags and my text.

</magic-reveal>
~~~
<!-- prettier-ignore-end -->

## Component Story Format

You can also add storybook-style CSF (v2 only) stories to a page using `js story` or `js preview-story`, just make sure to import `html` from `@mdjs/mdjs-preview` instead of from `lit` or `lit-html`.

<!-- prettier-ignore-start -->
~~~markdown
```js story
import { html } from '@mdjs/mdjs-preview';

export const StoryPreview = () => html`
  <p>Use stories in Rocket!</p>
`;
```
~~~
<!-- prettier-ignore-end -->
