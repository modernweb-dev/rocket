import { LitElement, html } from 'lit-element';

export class MdJsStory extends LitElement {
  static get properties() {
    return {
      story: {
        attribute: false,
      },
    };
  }

  constructor() {
    super();
    this.story = () => html` <p>Loading...</p> `;
  }

  render() {
    return this.story();
  }
}
