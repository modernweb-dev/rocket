---
title: Custom Elements
eleventyNavigation:
  key: Custom Elements
  parent: Web Components Basics
---

First, we will take a look at the most important Web Component feature: Custom Elements.

Modify your HTML to wrap the "Hello world" message in an element called `<cool-heading>`:

```html
<cool-heading>
  <h1>Hello world!</h1>
</cool-heading>
```

Currently, your browser does not recognize the `<cool-heading>` tag. When the browser encounters an unknown HTML tag like `<cool-heading>`, it will just render it as an inline element and move on. With the custom elements API, we can tell the browser what to do with the HTML tag that we have just created.

We need to do this in JavaScript, so let's add a script tag to the bottom of our `<body>` element:

```html
<script>
  // your code will go here
</script>
```

To create a custom element we need to declare a class that extends the `HTMLElement` class. This is the base class that powers all other native elements such as the `<input>` and `<button>` elements. Now, let's go ahead and create a new class for our `<cool-heading>` element:

```js
class CoolHeading extends HTMLElement {
  connectedCallback() {
    console.log('cool heading connected!');
  }
}
```

After creating our class we can associate it with a tagname by defining it in the custom elements registry. This way, whenever the browser's parser gets to the `<cool-heading>` tag, it will instantiate and apply our class to that specific element:

```js
customElements.define('cool-heading', CoolHeading);
```

<details>
  <summary>
    View final result
  </summary>

```html
<!DOCTYPE html>

<html>
  <body>
    <cool-heading>
      <h1>Hello world!</h1>
    </cool-heading>

    <script>
      class CoolHeading extends HTMLElement {
        connectedCallback() {
          console.log('cool heading connected!');
        }
      }

      customElements.define('cool-heading', CoolHeading);
    </script>
  </body>
</html>
```

</details>
