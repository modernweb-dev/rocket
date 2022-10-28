```js script
import { html } from 'lit-html';
import './demo-wc-card.js';
```

# Heading 1

Foo is great

- looks like a game card
- content in the front
- data in the back

## How to Use

```bash
npm install @foo/demo-wc-card
```

```js
import '@foo/demo-wc-card/demo-wc-card.js';
```

## JS Story

```js story
export const JsStory = () => html` <demo-wc-card>JS Story</demo-wc-card> `;
```

## JS Preview Story

with preview

```js preview-story
export const JsStory2 = () => html` <demo-wc-card>JS Story with preview</demo-wc-card> `;
```

## HTML Story

```html story
<demo-wc-card></demo-wc-card>
```

## HTML Preview Story

with preview

```html preview-story
<demo-wc-card></demo-wc-card>
```
