```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/10--setup/30--use-javascript.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */
```

# Use JavaScript

With Rocket you can use JavaScript on the client and server side.
And you can do so within the same file be it Markdown, JavaScript or HTML.

## Server Side JavaScript

With JavaScript on the server side you can do things like:

- create dynamic html
- convert data to html via templates
- fetching data from an API
- importing web components to server render
- ...

Here is an example of how you can render an array and put it into your markdown page.

````md
```js server
const films = [
  { title: 'A New Hope', release_date: '1977-05-25' },
  { title: 'The Empire Strikes Back', release_date: '1980-05-17' },
];

const filmList = html`<ul>
  \\${films.map(film => html`<li>\\${film.title} (\\${film.release_date})</li>`)}
</ul>`;
```

## Star Wars

### A list of all the movies [\\${films.length}]

<div>\\${filmList}</div>
````

Notice how you can put variables into your markdown file while still being able to use javascript to manipulate the data.

The output of the above code looks like this:

<div style="border: 1px solid green; padding: 20px;">

```js server
const films = [
  { title: 'A New Hope', release_date: '1977-05-25' },
  { title: 'The Empire Strikes Back', release_date: '1980-05-17' },
];

const filmList = html`<ul>
  ${films.map(film => html`<li>${film.title} (${film.release_date})</li>`)}
</ul>`;
```

## Star Wars

### A list of all the movies [${films.length}]

<div>${filmList}</div>

</div>

### Client Side JavaScript

If you would like to add JavaScript to a page, you can do it inline using the `client` markdown directive. The script you write runs on the page as a module.

````md
```js client
const message = 'Hello, World!';
console.log(message);
```
````

Adding the above will log `Hello, World!` to the console without adding a global `message` variable.

This can be useful for importing web components and using them in Markdown. Imagine you had some `magic-reveal` element that you wanted to use on a page:

````md
```js client
import 'magic-reveal/magic-reveal.js';
```

<magic-reveal>

This text will get magically revealed.

I can **still** use Markdown as long as there is an empty line
between the opening/closing tags and my text.

</magic-reveal>
````

## Component Story Format

On the client side you can also also add storybook-style CSF (v2 only) stories to a page using `js story` or `js preview-story`, just make sure to import `html` from `@mdjs/mdjs-preview` instead of from `lit` or `lit-html`.

````md
```js story
import { html } from '@mdjs/mdjs-preview';

export const StoryPreview = () => html` <p>Use stories in Rocket!</p> `;
```
````

And this is how it will look like:

<div style="border: 1px solid green; padding: 20px;">

```js story
import { html } from '@mdjs/mdjs-preview';

export const StoryPreview = () => html` <p>Use stories in Rocket!</p> `;
```

</div>
