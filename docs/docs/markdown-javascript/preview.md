# Markdown JavaScript >> Preview ||20

You can showcase live running code by annotating a code block with `js preview-story`.

```js script
import { html } from 'lit-html';
```

````md
```js script
import { html } from 'lit-html';
```

```js preview-story
export const foo = () => html` <p>my html</p> `;
```
````

will result in

```js preview-story
export const foo = () => html` <p>my html</p> `;
```
