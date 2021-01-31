# First Pages >> Use JavaScript ||40

You can use `js script` to execute JavaScript (`type="module"`).

````
```js script
console.log('foo');
```
````

This can be useful for importing web components and using them in Markdown.

````
```js script
import 'magic-reveal/magic-reveal.js';

<magic-reveal>

This text will get magically revealed. I can **still** use Markdown as long as there is an empty line between the opening/closing tags and my text.

</magic-reveal>
```
````

or you can use `js story`, `js preview-story`, ...
