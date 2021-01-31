---
title: Web Components Basics
eleventyNavigation:
  key: Web Components Basics
  parent: Codelabs
---

In this codelab, you will learn about the basics of Web Components and how they work.

Web Components are a set of low-level browser features that allow us to write modular, encapsulated and reusable HTML elements. Web Components are based on web standards and work in any environment that supports basic HTML and JavaScript. This means that there is no complex setup required for you to get started.

Web Components align with the way that browsers have always worked, they are pretty low level and straightforward. For most projects you will still want to use libraries or frameworks. But instead of each framework developing their own component model, they can use the features that are already baked into the browser.

Web components are quite flexible and have a multitude of possible use cases. The more prominent use case is to build reusable UI components. This is especially powerful, for the reason that UI components can be reused in applications that are built with different technologies.

Furthermore, Web Components can also be used to compose entire applications and are also a perfect fit for static/server-rendered pages where the components just add interactivity after the initial render.

**What you need**

- A web browser that supports Web Components: Firefox, Safari, Chrome or any Chromium-based browser.
- Basic knowledge of HTML, CSS, and JavaScript.
- Familiarity with the following concepts:
  - [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
  - [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

**What you'll learn**

Browsers are moving pretty fast, and new features and APIs are being added all the time. In this codelab you will learn about the three main browser features that Web Components consist of:

- Custom Elements
- Templates
- Shadow DOM

**How it works**

This codelab will take you through Web Components step by step, explaining each section as you go along. At the bottom of each section, there is a "View final result" button. This will show you the correct code that you should end up with, in case you get stuck. The steps are sequential, thus results from the previous steps carry over to the next step.

## Setup

You can follow this codelab using anything that is able to display a simple HTML page. We recommend using an [online code editor like jsbin](https://jsbin.com/?html,output), but you can also create your own HTML page using your favorite IDE.

To get started, let's create a basic HTML page:

```html
<!DOCTYPE html>

<html>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

If you run this in the browser and see hello world, you're good to go!
