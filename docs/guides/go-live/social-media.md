# Go Live >> Social Media || 20

Having a nice preview image for social media can be very helpful.
For that reason Rocket creates those automatically with the title, parent title, section and your logo.

It will look like this but with your logo:

<img src="{{ socialMediaImage | url }}" width="1200" height="630" alt="Social Media Image of this page" style="border: 1px solid #000" />

There are multiple ways you can modify it.

Note: If your logo has an `<?xml>` tag it will throw an error as it will be inlined into this SVG and nested XML tags are not allowed.

## Setting it via Front Matter

You can create your own image and link it with something like this

```markdown copy
---
socialMediaImage: path/to/my/image.png
---
```

## Providing Your Own Text

Sometimes extracting the title + title of parent is not enough but you still want to use the "default image".

You can create an `11tydata.cjs` file next to your page. If your page is `docs/guides/overview.md` then you create a `docs/guides/overview.11tydata.cjs`.

In there you can use the default `createSocialImage` but provide your own values.

```js copy
const { createSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createSocialImage({
    title: 'Learning Rocket',
    subTitle: 'Have a website',
    subTitle2: 'in 5 Minutes',
    footer: 'Rocket Guides',
    // you can also override the svg only for this page by providing
    // createSocialImageSvg: async () => '{%raw%}<svg>...</svg>{%endraw%}'
  });
  return {
    socialMediaImage,
  };
};
```

## Override the Default Image

Often you want to have a unique style for your social media images.
For that you can provide your own function which returns a string of an SVG to render the image.

👉 `rocket.config.js`

<!-- prettier-ignore-start -->
```js copy
import { adjustPluginOptions } from 'plugins-manager';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default ({
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
});
```
<!-- prettier-ignore-end -->

## Using an SVG File as a src with Nunjucks

If you have multiple variations it may be easier to save them as SVG files and use a template system.

<!-- prettier-ignore-start -->
<code-tabs default-tab="rocket.config.js">

```js tab rocket.config.js
import { adjustPluginOptions } from 'plugins-manager';

/** @type {import('@rocket/cli').RocketCliOptions} */
export default ({
  setupEleventyComputedConfig: [
    adjustPluginOptions('socialMediaImage', {
      createSocialImageSvg: async (args = {}) => {
        const svgBuffer = await fs.promises.readFile('/path/to/your/template.svg');
        const svg = logoBuffer.toString();
        return nunjucks.renderString(svg, args);
      },
    }),
  ],
});
```

```svg tab /path/to/your/template.svg
{%raw%}<svg xmlns="http://www.w3.org/2000/svg" fill="#e63946" viewBox="0 0 511.998 511.998">
  <text font-family="'Open Sans', sans-serif" font-size="39" transform="translate(422.99 408.53)">
    <tspan x="-89.26" y="12.25">{{ title }}</tspan>
  </text>
  <path d="M98.649 430.256c-46.365 28.67-71.17 30.939-78.916 23.51-7.75-7.433-6.519-32.307 20.182-79.832 24.953-44.412 65.374-96.693 113.818-147.211l-11.279-10.817c-49.33 51.442-90.583 104.845-116.163 150.373-19.228 34.22-37.848 79.134-17.375 98.766 5.84 5.6 13.599 7.935 22.484 7.935 22.269 0 51.606-14.677 75.469-29.432 44.416-27.464 96.044-70.919 145.373-122.362l-11.279-10.817c-48.446 50.519-98.987 93.095-142.314 119.887zM254.734 294.95l-18.47-17.71 10.816-11.281 18.47 17.71zM285.516 324.473l-18.47-17.71 10.816-11.28 18.47 17.71zM315.543 317.807l-73.886-70.847 10.816-11.28 73.886 70.846zM500.916 41.287c-7.769 1.59-76.412 16.062-93.897 34.294l-50.728 52.899-114.703-3.629-39.198 40.876 79.28 40.569-21.755 22.687 72.848 69.858 21.755-22.687 43.857 77.51 39.197-40.876-8.433-114.451 50.727-52.899c17.485-18.234 29.067-87.422 30.331-95.251l1.801-11.169-11.082 2.269zM228.209 161.383l19.842-20.692 93.688 2.964-48.775 50.864-64.755-33.136zm173.423 166.303l-35.822-63.308 48.776-50.865 6.886 93.482-19.84 20.691zm-69.334-50.943l-50.287-48.223L412.89 92.037l50.288 48.223-130.88 136.483zm140.711-148.707l-48.316-46.334c14.54-8.427 44.787-17.217 68.076-22.632-4.433 23.497-11.949 54.085-19.76 68.966z"/>
  <path d="M326.335 257.25l-24.628-23.614 10.816-11.28 24.628 23.615zM431.385 134.414l-11.808 12.315-11.28-10.816 11.808-12.315zM401.838 165.183l-11.28-10.816 11.807-12.314 11.28 10.816zM384.121 183.66l-11.28-10.816 11.807-12.314 11.28 10.816zM175.19 184.515l11.051 11.05-23.582 23.582-11.05-11.05zM190.903 168.796l11.05 11.052-7.863 7.86-11.05-11.052z"/>
</svg>{%endraw%}
```

</code-tabs>
<!-- prettier-ignore-end -->

## Enabling / Disabling

Generating images from SVG is quite fast but it can still add that's why by default during `rocket start` there will be no social media images created.

If you with so create them also during start you can

<!-- prettier-ignore-start -->
```js copy
export default ({
  start: {
    createSocialMediaImages: true,
  },
});
```
<!-- prettier-ignore-end -->

Similarly, if you never want to create social media images even during build then you can globally disable it via

<!-- prettier-ignore-start -->
```js copy
export default ({
  createSocialMediaImages: true,
});
```
<!-- prettier-ignore-end -->
