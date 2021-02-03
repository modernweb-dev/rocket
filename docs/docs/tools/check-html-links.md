# Tools >> Check HTML Links ||30

```js
import '@rocket/launch/inline-notification/inline-notification.js';
```

A fast checker for broken links/references in HTML.

<inline-notification type="tip">

Read the [Introducing Check HTMl Links - no more bad links](../../blog/introducing-check-html-links.md) Blog post to find out how it came to be and how it works.

</inline-notification>

## Features

- Checks all html files for broken local links/references (in href, src, srcset)
- Focuses on the broken reference targets and groups references to it
- Fast (can process 500-1000 documents in ~2-3 seconds)
- Has only 3 dependencies (and 19 in the full tree)
- Uses [sax-wasm](https://github.com/justinwilaby/sax-wasm) for parsing streamed HTML

## Installation

```
npm i -D check-html-links
```

## CLI flags

| Name                | Type    | Description                                                                                         |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| root-dir            | string  | the root directory to serve files from. Defaults to the current working directory                   |
| ignore-link-pattern | string  | do not check links matching the pattern                                                             |
| continue-on-error   | boolean | if present it will not exit with an error code - useful while writing or for temporary passing a ci |

## Usage Examples

```bash
# check a folder _site
npx check-html-links _site

# ignore all links like <a href="/users/123">
npx check-html-links _site --ignore-link-pattern "/users/*" "/users/**/*"

# ignore all links like <a href="/users/123"> & <a href="/users/123/details">
npx check-html-links _site --ignore-link-pattern "/users/*" "/users/**/*"
```

## Example Output

![Test Run Screenshot](./images/check-html-links-screenshot.png)

## Comparison

Checking the output of [11ty-website](https://github.com/11ty/11ty-website) with 13 missing reference targets (used by 516 links) while checking 501 files. (on January 17, 2021)

| Tool             | Lines printed | Times  | Lang | Dependency Tree |
| ---------------- | ------------- | ------ | ---- | --------------- |
| check-html-links | 38            | ~2.5s  | node | 19              |
| link-checker     | 3000+         | ~11s   | node | 106             |
| hyperlink        | 68            | 4m 20s | node | 481             |
| htmltest         | 1000+         | ~0.7s  | GO   | -               |
