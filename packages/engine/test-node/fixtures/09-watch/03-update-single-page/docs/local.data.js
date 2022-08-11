import { html } from 'lit';

export function layout(data) {
  return html`<my-layout>${data.content()}</my-layout>`;
}
