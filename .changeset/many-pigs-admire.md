---
'@rocket/engine': patch
---

HTML in headings will be ignored for the menu
Some examples:

- `<h1>Hello <em>Word</em></h1>` => `Hello Word`
- `<h1>Hello <strong>World</strong> of <span>JS <em>(JavaScript)</em></span>!</h1>` => `Hello World of JS (JavaScript)!`
