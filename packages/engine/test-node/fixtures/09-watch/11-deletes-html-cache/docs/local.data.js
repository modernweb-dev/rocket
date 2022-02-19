import { html } from 'lit-html';
export function layout(data) {
  return html`<new-layout>${data.content()}</new-layout>`;
}
