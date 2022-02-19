import { html } from 'lit-html';
export function layout(data) {
  return html`<my-layout>${data.content()}</my-layout>`;
}
