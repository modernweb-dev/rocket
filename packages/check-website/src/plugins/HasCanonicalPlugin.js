import path from 'path';
import { PageIssue } from '../issues/PageIssue.js';
import { Plugin } from './Plugin.js';

/** @typedef {import('../assets/HtmlPage.js').HtmlPage} HtmlPage */
/** @typedef {import('../../types/main.js').CheckContext} CheckContext */
/** @typedef {import('../../types/main.js').Reference} Reference */
/** @typedef {import('../../types/main.js').ParseElement} ParseElement */

export class HasCanonicalPlugin extends Plugin {
  /**
   * Contains the unique absolute page URL as declared by the
   * `<link rel="canonical" href="...">` element (if any) for every page.
   *
   * @type {Map<HtmlPage, URL>}
   */
  canonicalUrls = new Map();

  /**
   * @param {ParseElement} element
   * @param {HtmlPage} page
   */
  onParseElement = (element, page) => {
    if (!this.canonicalUrls.has(page) && element.tagName === 'LINK') {
      if (element.getAttribute('rel') === 'canonical') {
        const href = element.getAttribute('href');
        if (href) {
          this.canonicalUrls.set(page, new URL(href));
        }
      }
    }
  };

  constructor(options = {}) {
    super({
      title: 'Canonical',
      checkLabel: 'pages',
      ...options,
    });
  }

  /**
   * @param {CheckContext} context
   */
  async check(context) {
    const page = /** @type {HtmlPage} */ (context.item);
    if (!this.canonicalUrls.has(page)) {
      context.report(
        new PageIssue({
          title: 'Missing canonical',
          message: 'The page is missing a <link rel="canonical" href="...">',
          page,
          filePath: './' + path.relative(process.cwd(), page.localPath),
          icon: '🦄',
        }),
      );
    }
    return;
  }
  //   if (this.canonicalUrls.has(context.item)) {
  //     // return CHECK_RESULT.PASSED;
  //   }

  //   page.addIssue(
  //     new PageIssue({
  //       title: 'Missing canonical',
  //       message: 'The page is missing a <link rel="canonical" href="...">',
  //       filePath: './' + path.relative(process.cwd(), page.localPath),
  //       icon: '🦄',
  //     }),
  //   );

  //   // return CHECK_RESULT.FAILED;
  // }
}
