/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '20--presets/20--spark/20--demo.rocket.js';
import { html, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */

import { LayoutHome } from '@rocket/spark';
import { pageTree } from '#pageTree';
export const layout = new LayoutHome({
  pageTree,
  titleWrapperFn: title => title,
  description: 'hey',
  siteName: 'Rocket',
});

export const menuLinkText = 'Demo';

import { EqualColumns } from '@rocket/blocks';
customElements.define('equal-columns', EqualColumns);

import { TestimonialSmall } from '@rocket/blocks';
customElements.define('testimonial-small', TestimonialSmall);

import { CardIcon } from '@rocket/blocks/server';
customElements.define('card-icon', CardIcon);

export default () => html`
  <script type="module">
    import { RotatingText } from '@rocket/blocks';
    customElements.define('rotating-text', RotatingText);
  </script>

  <equal-columns style="background: #fff2dc;">
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

    <div>
      <img src="./_assets/header-illustration.svg" alt="alternative" />
    </div>
  </equal-columns>

  <equal-columns>
    <h2 slot="title">Arcu felis bibendum ut tristique entra les vitoria livanore</h2>

    <feature-small>
      <card-icon slot="icon" icon="solid/headphones-alt"></card-icon>
      <h4 slot="title">Lorem Ipsum</h4>
      <p slot="description">
        Et blandit nisl libero at arcu. Donec ac lectus sed tellus mollis viverra. Nullam pharetra
        ante at nunc elementum
      </p>
    </feature-small>

    <feature-small>
      <card-icon slot="icon" icon="solid/headphones-alt" variation="green"></card-icon>
      <h4 slot="title">Lorem Ipsum</h4>
      <p slot="description">
        Et blandit nisl libero at arcu. Donec ac lectus sed tellus mollis viverra. Nullam pharetra
        ante at nunc elementum
      </p>
    </feature-small>

    <feature-small>
      <card-icon slot="icon" icon="solid/headphones-alt" variation="green"></card-icon>
      <h4 slot="title">Lorem Ipsum</h4>
      <p slot="description">
        Et blandit nisl libero at arcu. Donec ac lectus sed tellus mollis viverra. Nullam pharetra
        ante at nunc elementum
      </p>
    </feature-small>
  </equal-columns>

  <equal-columns class="bg-grey">
    <div>
      <h2>Turpis in eu mi bibendum neque egestas congue ortor consequat</h2>
      <p>
        Vestibulum ullamcorper augue ex imperdiet tincidunt tellus bibendum inconsectetur rutrum
        mauris orbi scelerisque cursus augue ac suscipit sem mattis at ut suscipit
      </p>
      <a class="cta" href="./sign-up">Do it</a>
    </div>

    <div>
      <img src="./_assets/details-1.svg" alt="alternative" />
    </div>
  </equal-columns>

  <equal-columns>
    <div>
      <img src="./_assets/details-2.png" alt="alternative" />
    </div>
    <div>
      <h2>Turpis in eu mi bibendum neque egestas congue ortor consequat</h2>
      <p>
        Vestibulum ullamcorper augue ex imperdiet tincidunt tellus bibendum inconsectetur rutrum
        mauris orbi scelerisque cursus augue ac suscipit sem mattis at ut suscipit
      </p>
      <a class="cta" href="./sign-up">Do it</a>
    </div>
  </equal-columns>

  <equal-columns class="bg-grey">
    <h2 slot="title">Testimonials</h2>

    <testimonial-small>
      <img slot="image" src="./_assets/testimonial-1.jpg" alt="alternative" />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>

    <testimonial-small>
      <img slot="image" src="./_assets/testimonial-1.jpg" alt="alternative" />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>

    <testimonial-small>
      <img slot="image" src="./_assets/testimonial-1.jpg" alt="alternative" />
      <p>
        Words can be like X-rays, if you use them properly—they’ll go through anything. You read and
        you’re pierced.
      </p>
      <p slot="caption">Aldous Huxley — Designer</p>
    </testimonial-small>
  </equal-columns>

  <equal-columns class="bg-blue">
    <div>
      <h3>
        Nec ultrices dui sapien eget mi proin nibh cras pulvinar mattis nunc sed blandit libero
        volutpat diam soli
      </h3>
      <a class="cta-outline" href="./sign-up">Do it</a>
    </div>
  </equal-columns>

  <equal-columns>
    <h2 slot="title">FAQ</h2>
    <div>
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
    </div>
  </equal-columns>
`;
