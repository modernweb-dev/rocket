---
title: Introducing Check HTMl Links - no more bad links
published: true
description: A fast link checker for static HTML
tags: [html, javascript, webdev, node]
cover_image: https://dev-to-uploads.s3.amazonaws.com/i/an9z6f4hdll2jlne43u3.jpg
---

**TL;DR : I created a standalone tool that can help you fix all the broken links in your websites/documentation. You can check it out [on npm as check-html-links](https://www.npmjs.com/package/check-html-links)**

In my developer career, I have put live multiple websites and honestly often within a few days, there was always this one issue raised. "This link on xxx is broken". 🤦‍♂️

Often these things happen as somewhere a page got moved or renamed and not every location got updated.
It's really hard to catch especially if you have a dynamic page like with WordPress or an SPA. And for users, there is nothing worse than landing on your documentation only to find a 404 staring back at them.

Luckily, with the rise of SSG (Static Site Generators), this problem becomes easier to tackle and can be solved in large part. The reason for that is that with all HTML rendered upfront as static files we can read all of them and check every link.

## Evaluation and the Decision for a New Tool

Of course, I am not the first one to come up with that idea and there are multiple tools available on the market already.
However, when checking existing solutions I found out that most of them didn't satisfy me in at least one way 😅. Things I noticed: slow to execute, deprecated, large dependency tree, confusing output for the user, ...

Reviewing these tools I decided to create my own, with the following requirements :

- Blazing fast
- User-focused output
- Few dependencies, to keep it lean
- Preferably in the Node.js ecosystem

## Focusing on Useful Output

Most tools evaluated check files individually and report on their findings individually. That means if you have a broken link in your header or footer, you will get one line (or even multiple lines) of an error message(s) for EVERY page.

I tested this on the [11ty-website](https://github.com/11ty/11ty-website) and there are currently 516 broken links in 501 files. However, **the source of those 516 broken links is just 13 missing pages/resources**.

In my implementation, I decided to switch from an "Error in File Focused" method to a "Missing File Focused". Let's see this with examples

### Error in File Focused

This is what a lot of current existing solutions implement. Here is part of the output that is being produced:

```
[...]
authors/ryzokuken/index.html
  target does not exist --- authors/ryzokuken/index.html --> /speedlify/
authors/alex_kaul/index.html
  target does not exist --- authors/alex_kaul/index.html --> /speedlify/
docs/config/index.html
  target does not exist --- docs/config/index.html --> /speedlify/
  hash does not exist --- docs/config/index.html --> /docs/copy/#disabling-passthrough-file-copy
authors/cramforce/index.html
  target does not exist --- authors/cramforce/index.html --> /speedlify/
authors/accudio/index.html
  target does not exist --- authors/accudio/index.html --> /speedlify/
[...]
```

We get ~2000 lines of errors for `/speedlify/` as it's not found ~500 times. In the middle of those errors, we also see some other broken links.
Because the reporting is focusing first on the files, and then on the actual error **it is difficult to know where most errors originate from**.

### Missing File Focused

Let us turn that around and focus on missing references indeed. Here is the output for the same input website :

```
[...]
  1. missing reference target _site/speedlify/index.html
    from _site/404.html:1942:13 via href="/speedlify/"
    from _site/authors/_amorgunov/index.html:2031:13 via href="/speedlify/"
    from _site/authors/_coolcut/index.html:2031:13 via href="/speedlify/"
    ... 495 more references to this target

  2. missing id="disabling-passthrough-file-copy" in _site/docs/copy/index.html
    from _site/docs/config/index.html:2527:267 via href="/docs/copy/#disabling-passthrough-file-copy"

  3. missing reference target _site/authors/dkruythoff/github.com/dkruythoff/darius-codes
    from _site/authors/dkruythoff/index.html:2102:234 via href="github.com/dkruythoff/darius-codes"
[...]
```

We get one 5 line error for `/speedlify/` and it tells us it's missing 495 times + 3 examples usages.
Afterward, we find very clearly more missing references and where they occurred.

### A Clear Winner

Comparing those two outputs makes it pretty clear to me that `Missing File Focused` will make more sense if there is a chance that some links will be broken everywhere. My implementation focuses on missing links in its output. This is crucial because it allows developers to know where to focus their efforts first to get the biggest wins.

## Focusing on Speed

Speed is always nice to have but in this case, it's probably vital. I need this to be fast so that I can run it potentially on every save. Speed is also very important in case the tool runs in a CI for example. For projects with extensive documentation, we don't want to hog the CI only to check for documentation.

Luckily HTML is an awesome language to analyze as it's declarative, which means you can read and analyze it at the same time. This may even mean that the HTML is already processed by the time the file is done reading.

With this knowledge I was hopeful - but reality didn't deliver 😅. The only tool that could keep up with the speed I needed was implemented in [Go](https://golang.org/).

It seems that most tools use sophisticated parsers meant to create full syntax trees of your HTML.
In reality for link checking all you need to know are the _id_ and the _href_ attributes.

I have been using [sax-wasm](https://github.com/justinwilaby/sax-wasm) in a few situations before and I knew it supported streaming. I knew that way it could be FAST 🤞!

How fast are we talking about though?

As a rule of thumb, I decided that the analysis should be finished within 1s for a small site (up to 200 pages).
The main reason is already listed above: To not disturb during writing/development as it will run on every save.
For medium sites (200 - 1000 pages), it's reasonable if it takes a little longer - let's aim for less than 5 seconds. This will probably be a breaking point where you execute it only on-demand and in the CI instead of executing it on every save.

Results are gatherd on January 26, 2021:

| Website     | Pages | Duration |
| ----------- | ----- | -------- |
| open-wc.org | 90    | ~0.4s    |
| 11ty.dev    | 501   | ~2.5s    |
| web.dev     | 830   | ~3.7s    |
| eslint.org  | 3475  | ~12.4s   |

## Being Part of the Node.js Ecosystem

My daily workflow is hugely dominated by JavaScript, so it was only natural to want to stay in the same environment if I could reach my earlier requirements with it.
On top of this, the end goal is to integrate it within a bigger WIP system called [Rocket](https://github.com/modernweb-dev/rocket) which is node-based so therefore it will need to at least support Node.js. Having it standalone (usable via `npx`) also makes it more versatile and easier to maintain/test.

## Focusing on a Small Dependency Tree

The JavaScript and Node.js ecosystem is very active and constantly shifting. Lots of changes/improvements happen all the time. It's often hard to keep up. Therefore having a small dependency tree is something to always thrive for because it will reduce the maintenance burden down the line. And as an added benefit, it makes it smaller and easily embeddable as less stuff has to go down the wire. Lean is king 👑.

## Solution

As already mentioned I went on and implement a link checker myself 😅. So far it fits all my requirements so I call it a success 🎉! You can find it [on npm](https://www.npmjs.com/package/check-html-links).

I called it `check-html-links` and its slogan is "no more broken links or assets".

The features so far are:

- extracts every attribute value of id, href, src, srcset
- use a Wasm parser (sax-wasm)
- streams the HTML for performance
- check if file or id within file exist
- focus on missing references/sources

## Usage

It checks your final HTML output so you need to execute it after your Static Site Generator.

```
npx check-html-links _site
```

## GitHub Action Usage

[Julien](https://twitter.com/jlengrand) created a GitHub action available for the tool, so you can easily plug it in your existing CI. You can find it [on the GitHub Marketplace](https://github.com/marketplace/actions/check-html-links-action).

Here is a complete example workflow that will check the result of the folder `_site` in the root of your repository on each push:

```yml
on: [push]

jobs:
  check_html_links_job:
    runs-on: ubuntu-latest
    name: A job to test check-html-links-action
    steps:
      - uses: actions/checkout@v2
      - name: check-html-links-action step
        id: check-links
        uses: modernweb-dev/check-html-links-action@v1
        with:
          doc-folder: '_site_'
```

## Comparison

Checking the output of the [11ty-website](https://github.com/11ty/11ty-website) with 13 missing reference targets (used by 516 links) while checking 501 files. (on January 17, 2021)

| Tool             | Lines printed | Duration | Lang | Dependency Tree |
| ---------------- | ------------- | -------- | ---- | --------------- |
| check-html-links | 38            | ~2.5s    | node | 19              |
| link-checker     | 3000+         | ~11s     | node | 106             |
| hyperlink        | 68            | 4m 20s   | node | 481             |
| htmltest         | 1000+         | ~0.7s    | GO   | -               |

## Future

The basic functionality is finished and it's reasonabley fast.

Topic to work on:

- Allow to ignore folders (potentially via a cli parameter)
- Support for `<base href="/">`
- Big Sites Speed improvements (potentially running multiple parsers in parallel for 1000+ pages)
- Speed improvements by introducing a "permanent cache" for the parse result (if file did not change, parse result will not change - we still check all links)
- Memory consumption check (see if there is room for improvements)
- Improve node api
- Check external links

## Acknowledgements

Thank you for following along on my journey on creating `check-html-links`. You can find the code on [GitHub](https://github.com/modernweb-dev/rocket/tree/main/packages/check-html-links).

Follow us on [Twitter](https://twitter.com/modern_web_dev), or follow me on my personal [Twitter](https://twitter.com/dakmor).

Thanks to [Julien](https://twitter.com/jlengrand) for feedback and helping turn my scribbles to a followable story.

If you think my open source work is valuable then I would like you to check out my personal [GitHub Sponsor Page](https://github.com/sponsors/daKmoR). Or you can support our whole group via the [Modern Web Open Collective](https://opencollective.com/modern-web).

---

<span>Photo by <a href="https://unsplash.com/@mihaiteslariu0?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Teslariu Mihai</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
