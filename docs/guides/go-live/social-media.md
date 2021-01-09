# Go Live >> Social Media ||20

Having a nice preview image for social media can be very helpful.
For that reason Rocket creates those automatically with the title, parent title, section and your logo.

It will look like this but with your logo

<img src="{{ socialMediaImage }}" width="1200" height="630" alt="Social Media Image of this page" style="border: 1px solid #000" />

There are multiple ways you can modify it.

## Setting it via frontMatter

You can create your own image and link it with something like this

```
---
socialMediaImage: path/to/my/image.png
---
```

## Providing your own text

Sometimes extracting the title + title of parent is not enough but you still want to use the "default image".

You can create an `11tydata.cjs` file next to your page. If your page is `docs/guides/overview.md` then you create a `docs/guides/overview.11tydata.cjs`.

In there you can use the default `createPageSocialImage` but provide your own values.

```js
const { createPageSocialImage } = require('@rocket/cli');

module.exports = async function () {
  const socialMediaImage = await createPageSocialImage({
    title: 'Learning Rocket',
    subTitle: 'Have a website',
    subTitle2: 'in 5 Minutes',
    footer: 'Rocket Guides',
  });
  return {
    socialMediaImage,
  };
};
```
