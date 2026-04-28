```js server
export const config = {
  path: '/reference/code-blocks',
  metadata: {
    title: 'Code Blocks',
    description:
      'Label Markdown code examples, show line numbers, and keep copy behavior tied to authored source.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Code block tip',
          description:
            'Prefer explicit labels for copied commands and examples so readers can tell whether code belongs in a file or terminal.',
        },
      },
    },
  },
  menu: {
    iconName: 'code-square',
    order: 26,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Code Blocks

Code Blocks are rendered fenced code examples in Markdown Pages. Rocket keeps the Prism output for
syntax highlighting and wraps visible Code Blocks in a Code Block Frame for copy behavior.

Use Code Blocks for source-only examples. Use [JavaScript Demos](/reference/demos) when source
should run in the browser, and Request Demos when source should stay inert while an iframe shows a
same-site `GET` response.

## Unlabeled Code Blocks

A fenced Code Block without a Code Block Label renders without a header:

````markdown
```js
export const siteName = 'Rocket';
```
````

The copy button belongs to the Code Block body. On desktop pointer devices it appears when the Code
Block is hovered. Keyboard users see it when the Code Block or copy button receives focus, and
touch/mobile users see it by default.

```js
export const siteName = 'Rocket';
```

## Labeled Code Blocks

Use `label="..."` in the fence metadata:

````markdown
```js label="rocket.config.js"
export default {
  rootDir: 'docs',
};
```
````

Rocket renders the Code Block through `<rocket-code-block>`, shows the label in the frame, and shows
a small language badge derived from the Markdown language. Labeled Code Blocks keep the copy button
in the header.

```js label="rocket.config.js"
export default {
  rootDir: 'docs',
};
```

## Line Numbers

Use `showLineNumbers` in the fence metadata to show a number gutter. It can be combined with a
label:

````markdown
```js label="site-data.js" showLineNumbers
export const siteName = 'Rocket';
export const docsPath = '/reference/code-blocks';
```
````

```js label="site-data.js" showLineNumbers
export const siteName = 'Rocket';
export const docsPath = '/reference/code-blocks';
```

Use `showLineNumbers=N` when the visible snippet starts from a later source line:

````markdown
```js label="render.js" showLineNumbers=42
const title = pageData.title;
const description = pageData.description;
```
````

```js label="render.js" showLineNumbers=42
const title = pageData.title;
const description = pageData.description;
```

## Highlight

Use `{2}` to highlight a line in the current snippet.

````markdown
```js label="page-data.js" {2}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```
````

```js label="page-data.js" {2}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```

You can specify multiple lines with `{1, 3}`.

```js label="page-data.js" {1, 3}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```

You can specify ranges of lines like `{1-2, 4}`.

```js label="page-data.js" {1-2, 4}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```

## Line Numbers and Highlight

Highlight ranges always refer to lines in the fenced snippet. `showLineNumbers=N` only changes the
displayed gutter numbers.

````markdown
```js label="page-data.js" showLineNumbers=42 {2}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```
````

```js label="page-data.js" showLineNumbers=42 {2}
export const title = 'Code Blocks';
export const description = 'Framed, copyable code examples.';
console.log('some extra code');
// after the fact
```

## Terminal Code Block Frames

Shell-language Code Blocks derive the terminal Code Block Frame from the Markdown language. Use a
shell language such as `bash`, `sh`, `shell`, or `zsh` for command examples:

````markdown
```bash
npm run build
```
````

```bash
npm run build
```

There is no authored `frame` metadata API. The Markdown language still controls syntax
highlighting; Rocket derives the terminal frame from shell languages only.

## Copy Behavior

The copy button uses the exact authored fenced code content. It does not read from the highlighted
DOM, so Prism token markup, line wrappers, line numbers, and frame labels are not copied.

Multiline content and punctuation stay part of the copy payload:

```js label="example.js"
const message = 'hello, Rocket!';
console.log(`${message}`);
```

## Supported Metadata

Rocket-specific Code Block metadata controls the Code Block Frame. Prism metadata controls
syntax-related details inside the Code Block.

| Metadata            | Behavior                                   |
| ------------------- | ------------------------------------------ |
| `label="..."`       | Renders a labeled Code Block Frame         |
| `showLineNumbers`   | Shows line numbers starting at `1`         |
| `showLineNumbers=N` | Shows line numbers starting at `N`         |
| `{1,3-5}`           | Highlights the listed source lines         |
| Bare label text     | Not supported as Code Block Label metadata |

Use the Markdown language for syntax highlighting, Prism metadata for line display, and the Code
Block Label for display text. They are separate facts.
