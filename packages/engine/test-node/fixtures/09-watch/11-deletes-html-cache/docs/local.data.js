import { html } from 'lit';
export function layout(data) {
  return html`<new-layout>${data.content()}</new-layout>`;
}
