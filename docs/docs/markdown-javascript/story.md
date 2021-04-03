# Markdown JavaScript >> Story ||30

You can showcase live running code by annotating a code block with `js story`.

```js script
import { html } from 'lit-html';
```

````md
```js script
import { html } from 'lit-html';
```

```js story
export const foo = () => html` <p>my html</p> `;
```
````

will result in

```js story
export const foo = () => html` <p>my html</p> `;
```
