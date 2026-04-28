import { RocketRequestDemo } from '../RocketRequestDemo.js';

if (!customElements.get('rocket-request-demo')) {
  customElements.define('rocket-request-demo', RocketRequestDemo);
}
