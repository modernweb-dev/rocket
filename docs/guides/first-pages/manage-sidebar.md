# First Pages >> Managing sidebar ||30

The sidebar will show all the content of the current section.

## Nesting Pages

You nest by adding `>>` between parent and child.

## Sorting Pages

You can sort by adding `||xx` at the end.

e.g.

```
# Second || 20
# First || 10
```

Will be ordered as `First`, `Second`,

## How it works

Internally `# Foo >> Bar >> Baz ||20` get's converted to.

```
---
title: Bar: Baz
eleventyNavigation:
  key: Foo >> Bar >> Baz
  parent: Foo >> Bar
  order: 20
---
```

You can also look at this live playground:

```js story
import { html } from 'lit-html';

export const headlineConverter = () => html`
  <p>
    <strong style="color: red;">TODO: </strong>I will become a web component that has an input and
    out that live udpates
  </p>
`;
```

How it then works is very similar to https://www.11ty.dev/docs/plugins/navigation/
