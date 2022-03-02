```js server
/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = '10--docs/20--basics/90--assets.rocket.md';
import { html, layout, setupUnifiedPlugins } from '../../recursive.data.js';
export { html, layout, setupUnifiedPlugins };
/* END - Rocket auto generated - do not touch */
```

# Assets

One of the best aspects of Rocket is it is *pretty much* HTML, CSS, Markdown, and JS. This means using assets (images, videos, CSS files, GIFs, etc.) is as easy as it normally is in the "vanilla" context of each of those languages.

## Source Assets

### HTML 

```html
<img src="../path/to/your/image.jpg" alt="My Image" />
```

### CSS

```css
.my-class {
  background-image: url('../path/to/your/image.jpg');
}
```

### Markdown

```md
![My Image](../path/to/your/image.jpg)
```

### Javascript

This would be similar to HTML since it would be inside of an html template literal

```js
export default () => html`
<img src="../path/to/your/image.jpg" alt="My Image" />
`
```

## Static Assets

Oftentimes, you have files such as robots.txt, .htaccess (redirects), favicons, etc. that do not need to be in your `src/` directory. For these types of files that simply need to be copied to the built site you will want to place them in your `site/public/` folder. Anything is this folder will be copied over into the built site completely untouched.

**Note:** Since these files are simply copied over during the build process, anything you place in the `src/public/` directory will not be optimized, bundled, or minified by Rocket.

## The :resolve Function

Rocket includes a special `:resolve` function that will resolve npm imports for assets.
This means any npm package, script, image, video, css file, etc. can be used as the value of the src attribute.

Here is an example of css file being imported using the `:resolve` function

```css
<link rel="stylesheet" href="resolve:@example/blog/styles/blog.css" />
```