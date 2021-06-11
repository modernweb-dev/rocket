import { LitElement, html } from 'lit';

/**
 * @typedef {object} StoryOptions
 * @property {HTMLElement | null} StoryOptions.shadowRoot
 */

/** @typedef {(options?: StoryOptions) => ReturnType<LitElement['render']>} LitHtmlStoryFn */

/**
 * Renders a story
 *
 * @element mdjs-story
 * @prop {StoryFn} [story=(() => TemplateResult)] Function that returns the story
 */
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
    /** @type {LitHtmlStoryFn} */
    this.story = () => html`<p>Loading...</p>`;
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return this.story({ shadowRoot: this });
  }
}
