import { LitElement, css, html } from 'lit';

class LoadingStrategyDemoBase extends LitElement {
  static properties = {
    count: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      --accent: #475569;
      background: #ffffff;
      border: 1px solid #d7dde6;
      border-left: 4px solid var(--accent);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
      color: #182230;
      padding: 1rem;
    }

    .client {
      --accent: #2563eb;
    }

    .hydrated {
      --accent: #0f766e;
    }

    header {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: 1rem;
      line-height: 1.3;
    }

    .badge {
      background: color-mix(in srgb, var(--accent) 12%, white);
      border: 1px solid color-mix(in srgb, var(--accent) 28%, white);
      border-radius: 999px;
      color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.78rem;
      padding: 0.2rem 0.5rem;
      white-space: nowrap;
    }

    .description {
      color: #485568;
      line-height: 1.5;
    }

    .actions {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    button {
      background: var(--accent);
      border: 0;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      padding: 0.55rem 0.8rem;
    }

    button[disabled] {
      background: #e2e8f0;
      color: #475569;
      cursor: not-allowed;
    }

    .hint {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.45;
    }
  `;

  constructor() {
    super();
    this.count = 0;
  }

  get kind() {
    return 'server';
  }

  get heading() {
    return 'Server-only rendering';
  }

  get loadingValue() {
    return 'server';
  }

  get description() {
    return 'Rocket renders this Registered Component during the static build and emits no browser component module for it.';
  }

  get actionLabel() {
    return 'No browser action';
  }

  get hint() {
    return 'Choose this when the rendered HTML is the complete experience.';
  }

  get interactive() {
    return false;
  }

  increment() {
    this.count += 1;
  }

  renderAction() {
    if (!this.interactive) {
      return html`<button type="button" disabled>${this.actionLabel}</button>`;
    }
    return html`
      <button type="button" @click=${() => this.increment()} aria-live="polite">
        ${this.actionLabel}: ${this.count}
      </button>
    `;
  }

  render() {
    return html`
      <article class="card ${this.kind}">
        <header>
          <h3>${this.heading}</h3>
          <span class="badge">loading: '${this.loadingValue}'</span>
        </header>
        <p class="description">${this.description}</p>
        <div class="actions">
          ${this.renderAction()}
          <p class="hint">${this.hint}</p>
        </div>
      </article>
    `;
  }
}

export class ServerLoadingStrategyDemo extends LoadingStrategyDemoBase {}

export class ClientLoadingStrategyDemo extends LoadingStrategyDemoBase {
  get kind() {
    return 'client';
  }

  get heading() {
    return 'Client-only loading';
  }

  get loadingValue() {
    return 'client';
  }

  get description() {
    return 'Rocket leaves the element for the browser and imports the component module before this card renders.';
  }

  get actionLabel() {
    return 'Client count';
  }

  get hint() {
    return 'Choose this when browser state is required before the component has useful content.';
  }

  get interactive() {
    return true;
  }
}

export class HydratedLoadingStrategyDemo extends LoadingStrategyDemoBase {
  get kind() {
    return 'hydrated';
  }

  get heading() {
    return 'Hydrated rendering';
  }

  get loadingValue() {
    return 'hydrate:onClick';
  }

  get description() {
    return 'Rocket renders useful HTML first, then Component Hydration loads the class when the Hydration Strategy resolves.';
  }

  get actionLabel() {
    return 'Hydrated count';
  }

  get hint() {
    return 'Choose this when static HTML is valuable and interaction can wait for a clear condition.';
  }

  get interactive() {
    return true;
  }
}
