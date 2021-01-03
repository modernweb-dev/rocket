# First Pages >> Use JavaScript ||40

You can use `js script` to execute javascript (type = module)

````
```js script
console.log('foo');
```
````

This can be useful for importing web components and using them in markdown

````
```js script
import 'magic-reveal/magic-reveal.js';

<magic-reveal>

This text will get magically revealed. I can **still** use markdown as long as between the opening/closing tag there is an empty line.

</magic-reveal>
```
````

or you can use `js story`, `js preview-story`, ...
