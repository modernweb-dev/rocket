```js server
export const config = {
  path: '/tutorials/acme-ui-docs/document-first-component',
  metadata: {
    title: 'Document component',
    description: 'Create a server-rendered component and its first Acme UI reference page.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Component tip',
          description:
            'Start with server rendering for the first reference component; add demos only for states that need browser behavior.',
        },
      },
    },
  },
  menu: {
    iconName: 'puzzle',
    parent: '/tutorials',
    order: 60,
  },
};

import { atlasDocLayout } from '@rocket/js/layouts/atlasDoc.js';
export { atlasDocComponents as components } from '@rocket/js/layouts/atlasDoc.js';
import { globalData } from '../globalData.js';

export const layout = pageData => atlasDocLayout(pageData, globalData);
```

# Document the First Component

Add one server-rendered component and a reference Page for it. This gives Acme UI Docs a pattern for
future component documentation.

## Create the component

Create `src/components/AcmeButton.js`:

```js label="src/components/AcmeButton.js"
import { LitElement, css, html } from 'lit';

export class AcmeButton extends LitElement {
  static properties = {
    href: { type: String },
    variant: { type: String },
  };

  constructor() {
    super();
    this.href = '#';
    this.variant = 'primary';
  }

  render() {
    return html`<a class=${this.variant} href=${this.href}><slot></slot></a>`;
  }

  static styles = css`
    :host {
      display: inline-block;
    }

    a {
      border-radius: 6px;
      display: inline-flex;
      font-weight: 700;
      gap: 0.5rem;
      line-height: 1;
      padding: 0.75rem 1rem;
      text-decoration: none;
    }

    .primary {
      background: #0f766e;
      color: white;
    }

    .secondary {
      background: #e5e7eb;
      color: #111827;
    }
  `;
}
```

Do not call `customElements.define` in this file. Rocket registers the component from the Page's
`components` export so it can server-render the element during the static build.

## Add the component reference Page

Create `src/components/AcmeButton.rocket.md` next to the component:

````markdown
```js server
export const config = {
  path: '/components/button',
  metadata: {
    title: 'Button',
    description: 'Acme UI Button usage and authoring guidance.',
    custom: {
      atlasDoc: {
        asideTip: {
          title: 'Component tip',
          description:
            'This Button is server-rendered because its initial HTML is the complete experience.',
        },
      },
    },
  },
  menu: {
    parent: '/components',
    order: 10,
    iconName: 'cursor',
  },
};

import { layout, atlasDocComponents } from '../../docs/docsLayout.js';

const acmeButtonFile = new URL('./AcmeButton.js', import.meta.url).href;

export const components = {
  ...atlasDocComponents,
  'acme-button': {
    file: acmeButtonFile,
    className: 'AcmeButton',
    loading: 'server',
  },
};
```

# Button

Use the Button when a Page needs a strong navigation action.

## Example

<acme-button href="/getting-started">Read setup</acme-button>
<acme-button variant="secondary" href="/brand">View brand assets</acme-button>

## Authoring guidance

- Use one primary Button per section.
- Link to the next useful Page in the docs.
- Prefer descriptive text over generic labels.
````

The component file path is built from `import.meta.url`, so the registered component points to your
project file instead of a Rocket package file. `menu.parent` places this colocated Page under the
`/components` menu group even though the file lives under `src/components/`.

## Add live demos for client-side examples

The Button Page above uses direct Markdown examples because its `server` Loading Strategy renders
the complete experience. For an interactive component, use a Loading Strategy that defines the
element in the browser, such as `client` or `hydrate:*`, then use `js demo` blocks so the Page shows
live output and source code together:

````markdown
```js client
import { html } from 'lit';
```

```js demo
export const primaryButton = () => html`
  <acme-button href="/getting-started">Read setup</acme-button>
`;
```
````

Each named demo also gets a Standalone Demo URL for focused review. Use a `client` or `hydrate:*`
Loading Strategy when the component must run inside a browser demo.

## Checkpoint

Run the static build:

```bash
npm run build
```

The `/components/button` Page should render the two Button examples without shipping client-side
JavaScript for the component. Before you document an interactive component, choose its
`server`, `client`, or `hydrate:*` behavior with the
[Component Loading](/component-loading) guide.
