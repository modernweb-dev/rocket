import { LitElement, html } from 'lit-element';

/**
 * @typedef {object} StoryOptions
 * @property {ShadowRoot | null} StoryOptions.shadowRoot
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

  render() {
    return this.story({ shadowRoot: this.shadowRoot });
  }
}
