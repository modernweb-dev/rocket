# Go Live >> Social Media ||20

Having a nice preview image for social media can be very helpful.
For that reason Rocket creates those automatically with the title, parent title, section and your logo.

It will look like this but with your logo:

<img src="{{ socialMediaImage | url }}" width="1200" height="630" alt="Social Media Image of this page" style="border: 1px solid #000" />

There are multiple ways you can modify it.

Note: If your logo has an `<?xml>` tag it will throw an error as it will be inlined into this SVG and nested XML tags are not allowed.

## Setting it via Front Matter

You can create your own image and link it with something like this

```
---
socialMediaImage: path/to/my/image.png
---
```

## Providing Your Own Text

Sometimes extracting the title + title of parent is not enough but you still want to use the "default image".

You can create an `11tydata.cjs` file next to your page. If your page is `docs/guides/overview.md` then you create a `docs/guides/overview.11tydata.cjs`.

In there you can use the default `createSocialImage` but provide your own values.

```js
const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Learning Rocket',
    subTitle: 'Have a website',
    subTitle2: 'in 5 Minutes',
    footer: 'Rocket Guides',
    // you can also override the svg only for this page by providing
    // createSocialImageSvg: async () => '<svg>...</svg>'
  });
  return {
    socialMediaImage,
  };
};
```

## Override the Default Image

Often you want to have a unique style for your social media images.
For that you can provide your own function which returns a string of an SVG to render the image.

👉 `rocket.config.mjs`

```js
import { adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("@rocket/cli").RocketCliOptions>} */
const config = {
  setupEleventyComputedConfig: [
    adjustPluginOptions('socialMediaImage', {
      createSocialImageSvg: async ({
        title = '',
        subTitle = '',
        subTitle2 = '',
        footer = '',
        logo = '',
      }) => {
        let svgStr = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" style="fill: #ecedef;">
            <defs/>
            <rect width="100%" height="100%" fill="#38393e"/>
            <g transform="matrix(0.45, 0, 0, 0.45, 300, 60)">${logo}</g>
            <g style="
              font-size: 70px;
              text-anchor: middle;
              font-family: 'Bitstream Vera Sans','Helvetica',sans-serif;
              font-weight: 700;
            ">
              <text x="50%" y="470">
                ${title}
              </text>
              <text x="50%" y="520" style="font-size: 30px;">
                ${subTitle}
              </text>
            </g>
            <text x="10" y="620" style="font-size: 30px; fill: gray;">
              ${footer}
            </text>
          </svg>
        `;
        return svgStr;
      },
    }),
  ],
};

export default config;
```

## Using an SVG File as a src with Nunjucks

If you have multiple variations it may be easier to save them as SVG files and use a template system.

WARNING: Untested example

👉 `rocket.config.mjs`

{% raw %}

```js
import { adjustPluginOptions } from 'plugins-manager';

/** @type {Partial<import("@rocket/cli").RocketCliOptions>} */
const config = {
  setupEleventyComputedConfig: [
    adjustPluginOptions('socialMediaImage', {
      createSocialImageSvg: async (args = {}) => {
        // inside of the svg you can use {{ title }}
        const svgBuffer = await fs.promises.readFile('/path/to/your/svg/file');
        const svg = logoBuffer.toString();
        return nunjucks.renderString(svg, args);
      },
    }),
  ],
};

{% endraw %}
```

## Enabling / Disabling

Generating images from SVG is quite fast but it can still add that's why by default during `rocket start` there will be no social media images created.

If you with so create them also during start you can

```js
const config = {
  start: {
    createSocialMediaImages: true,
  },
};
```

Similarly, if you never want to create social media images even during build then you can globally disable it via

```js
const config = {
  createSocialMediaImages: true,
};
```
