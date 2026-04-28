import { RocketJsDemo } from '../RocketJsDemo.js';

if (!customElements.get('rocket-js-demo')) {
  customElements.define('rocket-js-demo', RocketJsDemo);
}
