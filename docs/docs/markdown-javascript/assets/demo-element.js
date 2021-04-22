class DemoElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.platform = 'the web';
    this.language = 'en-US';
    this.theme = 'light';

    this.observer = new MutationObserver(this.updateData);
  }

  updateData = () => {
    this.platform = document.documentElement.getAttribute('platform') || 'the web';
    this.language = document.documentElement.getAttribute('data-lang') || 'en-US';
    this.theme = document.documentElement.getAttribute('theme') || 'light';
    this.requestUpdate();
  };

  connectedCallback() {
    this.updateData();

    this.observer.observe(document.documentElement, { attributes: true });
  }

  requestUpdate() {
    this.shadowRoot.innerHTML = this.render();
  }

  render() {
    return `
      <style>
        :host {
          display: block;
          background: var(--demo-background-color);
          color: var(--demo-color);
          padding: 10px;
        }

        :host[platform~="web"] {
          border-bottom: 2px solid #333;
        }

        @media screen and (min-width: 640px) {
          .about {
            display: flex;
          }
          .about ul {
            width: 50%;
          }
        }
      </style>

      <p>Hello I am DemoElement 👋</p>
      <div class="about">
        <ul>
          <li>My purpose is to demonstrate how an element can adapt to different environments</li>
          <li>I like <strong>${this.platform}</strong></li>
        </ul>
        <ul>
          <li>My mother language is <strong>${this.language}</strong></li>
          <li>I feel very comfortable in the <strong>${this.theme}</strong></li>
        </ul>
      </div>
    `;
  }
}

customElements.define('demo-element', DemoElement);
