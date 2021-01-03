# Markdown JavaScript >> Story ||30

You can showcase live running code by annotating a code block with `js story`.

````md
```js story
import { html } from 'lit-html';

export const foo = () => html` <p>my html</p> `;
```
````

will result in

```js story
import { html } from 'lit-html';

export const foo = () => html` <p>my html</p> `;
```
