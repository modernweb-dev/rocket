---
title: Introducing check html links - no more bad links
published: false
description: A fast link checker for static html
tags: [html, links, lint, validate]
cover_image: https://dev-to-uploads.s3.amazonaws.com/i/an9z6f4hdll2jlne43u3.jpg
---

In my developer career, I have put live multiple websites and honestly often within a few days, there was always this one issue raised. "This link on xxx is broken". 🤦‍♂️

Often these things happen as somewhere a page got moved or renamed and not every location got updated.
It's really hard to catch especially if you have a dynamic page like with WordPress or an SPA.

However, with the rise of SSG (Static Site Generators) this problem can be solved for good. The reason for that is that with all HTML rendered upfront as static files we can read all of them and check every link.

## Evaluation

Luckily I am not the first to think of such a solution so I tested a few tools.
However, each had its own "blockers". Too slow, unclear output, too many dependencies, not node based, ...
Based on these findings the following requirements became clear.

## Requirement Useful Output

Most tools evaluated check files individually and report on their findings individually. That means if you have a broken link in your header or footer. You will get one line (or even multiple lines) of an error message(s) for EVERY page.

I tested this on the [11ty-website](https://github.com/11ty/11ty-website) and there are currently 516 broken links in 501 files. However, the source of those 516 broken links is just 13 missing pages/resources.

Let's compare those two separate methods I will call "Error in File Focused" and "Missing File Focused".

### Error in File Focused

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

We get ~2000 lines of errors for `/speedlify/` as it's not found ~500 times (I guess - I didn't count) and somewhere in the middle we see some other broken links.
It's really hard to see what is important in all that noise.

### Missing File Focused

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

### Verdict Requirement Useful Output

Comparing those two outputs makes it pretty clear to me that `Missing File Focused` will make more sense if there is a chance that some links will be broken everywhere.
The main reason being that it will not drown useful information in a lot of similar errors.

## Requirement Speed

Speed is always nice to have but in this case, it's probably vital. I need this to be fast so that I can run it potentially on every save.

Luckily html is an awesome language to analyze as it's declarative which means you can read and analyze it at the same time. This may even mean that the html is already processed by the time the file is done reading.

With this knowledge I was hopeful but reality didn't deliver 😅
The only tool that could keep up with the speed I needed was implemented in GO.

It seems that most tools use sophisticated parsers meant to create full syntax trees of your html.
However in reality for link checking all you need to know are the ids and the hrefs.

I have been using [sax-wasm](https://github.com/justinwilaby/sax-wasm) in a few situations before and it seems to support streaming.
So that could be fast 🤞

So we know that theoretically, it should be possible to be fast - but what should be our goal?
To not disturb too much during writing/development it should be finished within 1s for a small site (up to 200 pages).
For medium sites (2000-1000 pages), it's reasonable if it takes a little longer - let's aim for less than 5 seconds. This will probably be a breaking point where you execute it only on-demand and in the CI instead of executing it on every save.

## Requirement Node Based & Small Dependency Tree

The end goal is to integrate it within a bigger WIP system called Rocket which is node-based so therefore it will need to at least support node. Having it standalone makes it more versatile and easier to maintain/test.

Last but not least the JavaScript ecosystem is a "violent" environment. Lot's of changes/improvements happen all the time. It's often hard to keep up. Therefore having a small dependency tree is something to always thrive for.

## Solution

In the end because of the requirements I had to implement yet another solution 😅

I call it `check-html-links` - e.g. no broken links or assets

The Features are:

- extracts all href, src, srset
- use a wasm parser (sax-wasm)
- stream the html for performance
- check if file or id within file exist
- focus on missing references/sources

## Usage

It does check your final html output so you need to execute it after your Static Site Generator.

```
npx check-html-links _site
```

## Usage Github Action

There is a Github action available for it. You can find it in the marketplace at https://github.com/marketplace/actions/check-html-links-action.

Here is a complete Example workflow that will check the result of the folder `_site` in the root of your repository on each push:

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

Checking the output of [11ty-website](https://github.com/11ty/11ty-website) with 13 missing reference targets (used by 516 links) while checking 501 files. (on January 17, 2021)

| Tool             | Lines printed | Duration | Lang | Dependency Tree |
| ---------------- | ------------- | -------- | ---- | --------------- |
| check-html-links | 38            | ~2.5s    | node | 19              |
| link-checker     | 3000+         | ~11s     | node | 106             |
| hyperlink        | 68            | 4m 20s   | node | 481             |
| htmltest         | 1000+         | ~0.7s    | GO   | -               |


## Thanks

Thank you for following along on my journey on creating `check-html-links`. You can find the code on [Github](https://github.com/modernweb-dev/rocket/tree/main/packages/check-html-links). 

If you think my open source work is valuable then I would like you to check out my personal [Github Sponsor Page](https://github.com/sponsors/daKmoR). Or you can support our whole group via the [Modern Web Open Collective](https://opencollective.com/modern-web).

---

<span>Photo by <a href="https://unsplash.com/@mihaiteslariu0?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Teslariu Mihai</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
