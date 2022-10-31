# Check HTML Links

A fast checker for broken links/references in HTML.

## Installation

```shell
npm i -D check-html-links
```

## Usage

```bash
npx check-html-links _site
```

For docs please see our homepage [https://rocket.modern-web.dev/tools/check-html-links/overview/](https://rocket.modern-web.dev/tools/check-html-links/overview/).

## Comparison

Checking the output of the [11ty-website](https://github.com/11ty/11ty-website) with 13 missing reference targets (used by 516 links) while checking 501 files. (on January 17, 2021)

| Tool             | Lines printed | Times  | Lang | Dependency Tree |
| ---------------- | ------------- | ------ | ---- | --------------- |
| check-html-links | 38            | ~2.5s  | node | 19              |
| link-checker     | 3000+         | ~11s   | node | 106             |
| hyperlink        | 68            | 4m 20s | node | 481             |
| htmltest         | 1000+         | ~0.7s  | GO   | -               |
