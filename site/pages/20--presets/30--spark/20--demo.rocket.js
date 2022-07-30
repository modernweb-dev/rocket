/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/30--spark/20--demo.rocket.js';
// prettier-ignore
import { html, setupUnifiedPlugins, components as originalComponents, openGraphLayout } from '../../recursive.data.js';
export { html, setupUnifiedPlugins, openGraphLayout };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('permanent-notification', await import('@rocket/components/permanent-notification.js').then(m => m.PermanentNotification));
  // prettier-ignore
  customElements.define('block-columns', await import('@rocket/components/block-columns.js').then(m => m.BlockColumns));
  // prettier-ignore
  customElements.define('card-icon', await import('@rocket/components/card-icon.js').then(m => m.CardIcon));
  // prettier-ignore
  customElements.define('feature-small', await import('@rocket/components/feature-small.js').then(m => m.FeatureSmall));
  // prettier-ignore
  customElements.define('block-features', await import('@rocket/spark/block-features.js').then(m => m.BlockFeatures));
  // prettier-ignore
  customElements.define('testimonial-small', await import('@rocket/components/testimonial-small.js').then(m => m.TestimonialSmall));
  // prettier-ignore
  customElements.define('block-blue', await import('@rocket/spark/block-blue.js').then(m => m.BlockBlue));
  // prettier-ignore
  customElements.define('the-block', await import('@rocket/components/the-block.js').then(m => m.TheBlock));
}
/* END - Rocket auto generated - do not touch */

export const menuLinkText = 'Demo';
export const title = 'Rocket Landing Page Template (Theme Spark)';

import { LayoutHome } from '@rocket/spark';
import { pageTree } from '#src/layouts/layoutData.js';

export const layout = new LayoutHome({
  pageTree,
  titleWrapperFn: title => title,
  description: 'hey',
  siteName: 'Rocket',
});

import { sparkComponents } from '@rocket/spark/components.js';

export const components = {
  ...originalComponents,
  ...sparkComponents,
};

export default () => html`
  <script type="module">
    import { RotatingText } from '@rocket/components/rotating-text.js';
    customElements.define('rotating-text', RotatingText);
  </script>

  <permanent-notification href="/presets/spark/overview/"
    >⬆️ &nbsp; Back to Rocket &nbsp; ⬆️</permanent-notification
  >

  <block-columns style="background: #fff2dc;">
    <div>
      <h1>
        <span>We are</span>
        <rotating-text items='["Designers", "Developers", "Humans"]'></rotating-text>
      </h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut dignissim, neque ut vanic barem
        ultrices sollicitudin
      </p>
      <a class="cta" href="./sign-up"> Sign up for free </a>
    </div>

    <img src="./_assets/header-illustration.svg" alt="alternative" width="189" height="150" />
  </block-columns>

  <block-features>
    <h2 slot="title">
      Arcu felis bibendum ut tristique entra <span class="highlight">les vitoria livanore</span>
    </h2>

    <feature-small>
      <card-icon slot="icon" icon="solid/headphones-alt"></card-icon>
      <h4 slot="title">Lorem Ipsum</h4>
      <p slot="description">
        Et blandit nisl libero at arcu. Donec ac lectus sed tellus mollis viverra. Nullam pharetra
        ante at nunc elementum
      </p>
    </feature-small>

    <feature-small>
      <card-icon slot="icon" icon="regular/clipboard" variation="green"></card-icon>
      <h4 slot="title">Vivera Adipis</h4>
      <p slot="description">
        Et blandit nisl libero at arcu. Donec ac lectus sed tellus mollis viverra. Nullam pharetra
        ante at nunc elementum
      </p>
    </feature-small>

    <feature-small>
      <card-icon slot="icon" icon="regular/comments" variation="blue"></card-icon>
      <h4 slot="title">Atine Tellus</h4>
      <p slot="description">
        Ety suscipit metus sollicitudin euqu isq imperdiet nibh nec magna tincidunt, nec pala
        vehicula neque sodales verum
      </p>
    </feature-small>
  </block-features>

  <block-columns style="background-color: #f9f8f8;">
    <div>
      <h2>Turpis in eu mi bibendum neque egestas congue ortor consequat</h2>
      <p>
        Vestibulum ullamcorper augue ex imperdiet tincidunt tellus bibendum inconsectetur rutrum
        mauris orbi scelerisque cursus augue ac suscipit sem mattis at ut suscipit
      </p>
      <a class="cta" href="./sign-up">Do it</a>
    </div>
    <img src="./_assets/details-1.svg" alt="alternative" width="146" height="150" />
  </block-columns>

  <block-columns>
    <img src="./_assets/details-2.png" alt="alternative" width="544" height="587" />
    <div>
      <h2>Turpis in eu mi bibendum neque egestas congue ortor consequat</h2>
      <p>
        Vestibulum ullamcorper augue ex imperdiet tincidunt tellus bibendum inconsectetur rutrum
        mauris orbi scelerisque cursus augue ac suscipit sem mattis at ut suscipit
      </p>
      <a class="cta" href="./sign-up">Do it</a>
    </div>
  </block-columns>

  <block-columns style="background-color: #f9f8f8;">
    <h2 slot="title">Testimonials</h2>

    <testimonial-small>
      <img
        slot="image"
        src="./_assets/testimonial-1.jpg"
        alt="alternative"
        width="80"
        height="80"
      />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>

    <testimonial-small>
      <img
        slot="image"
        src="./_assets/testimonial-2.jpg"
        alt="alternative"
        width="80"
        height="80"
      />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>

    <testimonial-small>
      <img
        slot="image"
        src="./_assets/testimonial-3.jpg"
        alt="alternative"
        width="80"
        height="80"
      />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>
  </block-columns>

  <block-blue>
    <h3>
      Nec ultrices dui sapien eget mi proin nibh cras pulvinar mattis nunc sed blandit libero
      volutpat diam soli
    </h3>
    <a class="cta-outline" href="./sign-up">Do it</a>
  </block-blue>

  <the-block>
    <h2 slot="title">FAQ</h2>
    <accordion-group>
      <h3 slot="invoker">
        <accordion-button>Sensory Factors</accordion-button>
      </h3>
      <accordion-content slot="content">
        Nec ultrices dui sapien eget mi proin nibh cras pulvinar mattis nunc sed blandit libero
        volutpat diam soli
      </accordion-content>
      <h3 slot="invoker">
        <accordion-button>Sensory Factors</accordion-button>
      </h3>
      <accordion-content slot="content">
        Nec ultrices dui sapien eget mi proin nibh cras pulvinar mattis nunc sed blandit libero
        volutpat diam soli
      </accordion-content>
    </accordion-group>
  </the-block>
`;
