# Markdown JavaScript >> Preview ||20

You can showcase live running code by annotating a code block with `js preview-story`.

````md
```js preview-story
import { html } from 'lit-html';

export const foo = () => html` <p>my html</p> `;
```
````

will result in

```js preview-story
import { html } from 'lit-html';

export const foo = () => html` <p>my html</p> `;
```
