import {
  DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH,
  defaultSocialPreviewTemplate,
} from './defaultSocialPreviewTemplate.js';

const DEFAULT_TITLE = 'Runtime Guide';
const DEFAULT_DESCRIPTION = 'Learn how Acme UI components load, render, and ship with Rocket.';
const DEFAULT_SITE_NAME = 'Acme Docs';
const DEFAULT_SITE_LANGUAGE = 'en';
const DEFAULT_CANONICAL_URL = 'https://docs.example.com/guides/runtime';

/**
 * @typedef {object} SocialPreviewPage
 * @property {string} path
 * @property {string=} title
 * @property {string=} description
 * @property {string=} downloadFilename
 */

/**
 * @typedef {object} SocialPreviewPlaygroundConfig
 * @property {string} siteName
 * @property {string} siteLanguage
 * @property {string} canonicalUrl
 * @property {string} defaultTitle
 * @property {string} defaultDescription
 * @property {string} selectedPath
 * @property {'left' | 'top'} controlsPosition
 * @property {string} templateUrl
 * @property {string} imageUrl
 * @property {string} workflowUrl
 * @property {boolean} showPages
 * @property {boolean} showDownload
 * @property {boolean} syncHistory
 * @property {SocialPreviewPage[]} pages
 */

/**
 * @typedef {object} SocialPreviewPlaygroundState
 * @property {string} selectedPath
 * @property {string} title
 * @property {string} description
 */

export class SocialPreviewPlayground extends HTMLElement {
  constructor() {
    super();
    /** @type {SocialPreviewPlaygroundConfig} */
    this.config = {
      siteName: DEFAULT_SITE_NAME,
      siteLanguage: DEFAULT_SITE_LANGUAGE,
      canonicalUrl: DEFAULT_CANONICAL_URL,
      defaultTitle: DEFAULT_TITLE,
      defaultDescription: DEFAULT_DESCRIPTION,
      selectedPath: '',
      controlsPosition: 'top',
      templateUrl: '',
      imageUrl: '',
      workflowUrl: '',
      showPages: false,
      showDownload: false,
      syncHistory: false,
      pages: [],
    };
    /** @type {SocialPreviewPlaygroundState} */
    this.state = {
      selectedPath: '',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };
    /** @type {ResizeObserver | undefined} */
    this.resizeObserver = undefined;
    /** @type {HTMLSelectElement | null} */
    this.pageSelect = null;
    /** @type {HTMLInputElement | null} */
    this.titleInput = null;
    /** @type {HTMLTextAreaElement | null} */
    this.descriptionInput = null;
    /** @type {HTMLIFrameElement | null} */
    this.templateFrame = null;
    /** @type {HTMLAnchorElement | null} */
    this.pngLink = null;
  }

  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }
    this.config = this.readConfig();
    this.state = this.initialState(this.config);
    const shadowRoot = this.attachShadow({ mode: 'open' });
    this.render();
    this.connectControls();
    this.updatePreviewResources();
    this.resizePreviewFrame();
    const frame = shadowRoot.querySelector('[data-social-preview-frame-shell]');
    if (frame && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.resizePreviewFrame());
      this.resizeObserver.observe(frame);
    }
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  /** @returns {SocialPreviewPlaygroundConfig} */
  readConfig() {
    const pages = this.readPages();
    const showPages = this.hasAttribute('show-pages') && pages.length > 0;
    const imageUrl = this.getAttribute('image-url') ?? '';
    return {
      siteName: this.getAttribute('site-name') || DEFAULT_SITE_NAME,
      siteLanguage: this.getAttribute('site-language') || DEFAULT_SITE_LANGUAGE,
      canonicalUrl: this.getAttribute('canonical-url') || DEFAULT_CANONICAL_URL,
      defaultTitle: this.getAttribute('preview-title') || DEFAULT_TITLE,
      defaultDescription: this.getAttribute('preview-description') || DEFAULT_DESCRIPTION,
      selectedPath: this.getAttribute('selected-path') || pages[0]?.path || '',
      controlsPosition: this.getAttribute('controls-position') === 'left' ? 'left' : 'top',
      templateUrl: this.getAttribute('template-url') ?? '',
      imageUrl,
      workflowUrl: this.getAttribute('workflow-url') ?? '',
      showPages,
      showDownload: this.hasAttribute('show-download') && Boolean(imageUrl),
      syncHistory: this.hasAttribute('sync-history'),
      pages,
    };
  }

  /** @returns {SocialPreviewPage[]} */
  readPages() {
    const pagesScript = this.querySelector('script[data-social-preview-pages]');
    if (!pagesScript?.textContent) {
      return [];
    }
    try {
      const pages = JSON.parse(pagesScript.textContent);
      return Array.isArray(pages)
        ? pages
            .filter(page => page && typeof page.path === 'string')
            .map(page => ({
              path: page.path,
              title: typeof page.title === 'string' ? page.title : undefined,
              description: typeof page.description === 'string' ? page.description : undefined,
              downloadFilename:
                typeof page.downloadFilename === 'string' ? page.downloadFilename : undefined,
            }))
        : [];
    } catch {
      return [];
    }
  }

  /**
   * @param {SocialPreviewPlaygroundConfig} config
   * @returns {SocialPreviewPlaygroundState}
   */
  initialState(config) {
    const page = config.pages.find(candidate => candidate.path === config.selectedPath);
    return {
      selectedPath: page?.path ?? config.selectedPath,
      title: config.defaultTitle || page?.title || DEFAULT_TITLE,
      description: config.defaultDescription || page?.description || DEFAULT_DESCRIPTION,
    };
  }

  /** @returns {SocialPreviewPage | undefined} */
  selectedPage() {
    return this.config.pages.find(page => page.path === this.state.selectedPath);
  }

  render() {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) {
      return;
    }
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-block: var(--wa-content-spacing, 1rem);
        }

        * {
          box-sizing: border-box;
        }

        .playground {
          display: grid;
          gap: 0.875rem;
        }

        .playground[data-controls-position='left'] {
          gap: 1.5rem;
          align-items: start;
        }

        .controls {
          display: grid;
          gap: 0.75rem;
        }

        .playground[data-controls-position='left'] .controls {
          position: sticky;
          top: 1.5rem;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #d7dde7;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 12px 30px rgb(15 23 42 / 8%);
        }

        .fields {
          display: grid;
          gap: 0.75rem;
        }

        .page-controls {
          display: grid;
          grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
          gap: 0.5rem;
          align-items: end;
        }

        .page-controls[hidden],
        .download-link[hidden] {
          display: none;
        }

        label {
          display: grid;
          gap: 0.35rem;
          min-width: 0;
          color: #213142;
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.3;
        }

        input,
        textarea,
        select,
        button {
          font: inherit;
        }

        input,
        textarea,
        select {
          width: 100%;
          min-width: 0;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #182230;
          line-height: 1.4;
          padding: 0.6rem 0.7rem;
        }

        textarea {
          min-height: 5.25rem;
          resize: vertical;
        }

        .playground[data-controls-position='left'] textarea {
          min-height: 7.5rem;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        button,
        .download-link {
          min-height: 2.25rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #213142;
          cursor: pointer;
          font-weight: 700;
          padding: 0 0.75rem;
        }

        .download-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        button:hover,
        .download-link:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        .page-button {
          width: 2.75rem;
          padding: 0;
          font-size: 1.35rem;
          line-height: 1;
        }

        .preview-panel {
          min-width: 0;
          display: grid;
          justify-items: center;
          overflow: hidden;
        }

        .preview-frame {
          width: min(100%, ${DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH}px);
          aspect-ratio: ${DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH} / ${DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT};
          overflow: hidden;
          border: 1px solid #cbd5e1;
          background: #020617;
        }

        iframe {
          display: block;
          width: ${DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH}px;
          height: ${DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT}px;
          border: 0;
          transform: scale(var(--social-preview-scale, 1));
          transform-origin: 0 0;
        }

        @media (min-width: 720px) {
          .playground:not([data-controls-position='left']) .fields {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
        }

        @media (min-width: 960px) {
          .playground[data-controls-position='left'] {
            grid-template-columns: minmax(20rem, 26rem) minmax(0, 1fr);
          }
        }

        @media (max-width: 959px) {
          .playground[data-controls-position='left'] .controls {
            position: static;
          }
        }
      </style>
      <section
        class="playground"
        aria-label="Default Social Preview Image playground"
        data-controls-position="${this.config.controlsPosition}"
      >
        <div class="controls" data-social-preview-controls>
          <div class="page-controls" ${this.config.showPages ? '' : 'hidden'}>
            <button class="page-button" type="button" title="Previous Page" aria-label="Previous Page" data-social-preview-previous-page>&larr;</button>
            <label>
              Page
              <select name="page" data-social-preview-page-select></select>
            </label>
            <button class="page-button" type="button" title="Next Page" aria-label="Next Page" data-social-preview-next-page>&rarr;</button>
          </div>
          <div class="fields">
            <label>
              Title
              <input data-social-preview-title-input />
            </label>
            <label>
              Description
              <textarea data-social-preview-description-input></textarea>
            </label>
          </div>
          <div class="actions">
            <button type="button" data-social-preview-reset>Reset</button>
            <a class="download-link" data-social-preview-png-link ${this.config.showDownload ? '' : 'hidden'}>Download PNG</a>
          </div>
        </div>
        <section class="preview-panel">
          <div class="preview-frame" data-social-preview-frame-shell>
            <iframe
              title="Social Preview Template"
              width="${DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH}"
              height="${DEFAULT_SOCIAL_PREVIEW_IMAGE_HEIGHT}"
              scrolling="no"
              data-social-preview-template-frame
            ></iframe>
          </div>
        </section>
      </section>
    `;
    this.pageSelect = /** @type {HTMLSelectElement | null} */ (
      shadowRoot.querySelector('[data-social-preview-page-select]')
    );
    this.titleInput = /** @type {HTMLInputElement | null} */ (
      shadowRoot.querySelector('[data-social-preview-title-input]')
    );
    this.descriptionInput = /** @type {HTMLTextAreaElement | null} */ (
      shadowRoot.querySelector('[data-social-preview-description-input]')
    );
    this.templateFrame = /** @type {HTMLIFrameElement | null} */ (
      shadowRoot.querySelector('[data-social-preview-template-frame]')
    );
    this.pngLink = /** @type {HTMLAnchorElement | null} */ (
      shadowRoot.querySelector('[data-social-preview-png-link]')
    );
    this.renderPageOptions();
    this.syncControlsFromState();
  }

  connectControls() {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) {
      return;
    }
    const { pageSelect, titleInput, descriptionInput } = this;
    pageSelect?.addEventListener('change', () => {
      this.state.selectedPath = pageSelect.value;
      this.syncTextFromSelectedPage();
      this.updatePreviewResources();
    });
    titleInput?.addEventListener('input', () => {
      this.state.title = titleInput.value;
      this.updatePreviewResources();
    });
    descriptionInput?.addEventListener('input', () => {
      this.state.description = descriptionInput.value;
      this.updatePreviewResources();
    });
    shadowRoot
      .querySelector('button[data-social-preview-previous-page]')
      ?.addEventListener('click', () => this.movePage(-1));
    shadowRoot
      .querySelector('button[data-social-preview-next-page]')
      ?.addEventListener('click', () => this.movePage(1));
    shadowRoot
      .querySelector('button[data-social-preview-reset]')
      ?.addEventListener('click', () => this.reset());
  }

  renderPageOptions() {
    if (!(this.pageSelect instanceof HTMLSelectElement)) {
      return;
    }
    this.pageSelect.replaceChildren(
      ...this.config.pages.map(page => {
        const option = document.createElement('option');
        option.value = page.path;
        option.textContent = `${page.path} - ${page.title || page.path}`;
        option.dataset.title = page.title ?? '';
        option.dataset.description = page.description ?? '';
        option.dataset.downloadFilename = page.downloadFilename ?? 'social-preview.png';
        option.selected = page.path === this.state.selectedPath;
        return option;
      }),
    );
  }

  syncControlsFromState() {
    if (this.titleInput instanceof HTMLInputElement) {
      this.titleInput.value = this.state.title;
    }
    if (this.descriptionInput instanceof HTMLTextAreaElement) {
      this.descriptionInput.value = this.state.description;
    }
    if (this.pageSelect instanceof HTMLSelectElement) {
      this.pageSelect.value = this.state.selectedPath;
    }
  }

  syncTextFromSelectedPage() {
    const page = this.selectedPage();
    this.state.title = page?.title || this.config.defaultTitle;
    this.state.description = page?.description || this.config.defaultDescription;
    this.syncControlsFromState();
  }

  /** @param {number} direction */
  movePage(direction) {
    if (!(this.pageSelect instanceof HTMLSelectElement) || this.pageSelect.options.length === 0) {
      return;
    }
    this.pageSelect.selectedIndex =
      (this.pageSelect.selectedIndex + direction + this.pageSelect.options.length) %
      this.pageSelect.options.length;
    this.state.selectedPath = this.pageSelect.value;
    this.syncTextFromSelectedPage();
    this.updatePreviewResources();
  }

  reset() {
    if (this.config.showPages) {
      this.syncTextFromSelectedPage();
    } else {
      this.state.title = this.config.defaultTitle;
      this.state.description = this.config.defaultDescription;
      this.syncControlsFromState();
    }
    this.updatePreviewResources();
  }

  updatePreviewResources() {
    if (!(this.templateFrame instanceof HTMLIFrameElement)) {
      return;
    }
    if (this.config.templateUrl) {
      this.templateFrame.src = this.socialPreviewResourcePath(this.config.templateUrl);
    } else {
      this.templateFrame.srcdoc = this.previewHtml();
    }
    if (this.pngLink instanceof HTMLAnchorElement && this.config.imageUrl) {
      this.pngLink.href = this.socialPreviewResourcePath(this.config.imageUrl);
      this.pngLink.download = this.selectedPage()?.downloadFilename ?? 'social-preview.png';
    }
    if (this.config.syncHistory && this.config.workflowUrl) {
      window.history.replaceState(
        null,
        '',
        this.socialPreviewResourcePath(this.config.workflowUrl),
      );
    }
  }

  /** @param {string} pathname */
  socialPreviewResourcePath(pathname) {
    const params = new URLSearchParams();
    if (this.state.selectedPath) {
      params.set('page', this.state.selectedPath);
    }
    const selectedPage = this.selectedPage();
    if (
      this.state.title &&
      this.state.title !== (selectedPage?.title ?? this.config.defaultTitle)
    ) {
      params.set('title', this.state.title);
    }
    if (
      this.state.description &&
      this.state.description !== (selectedPage?.description ?? this.config.defaultDescription)
    ) {
      params.set('description', this.state.description);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  previewHtml() {
    return defaultSocialPreviewTemplate({
      site: {
        language: this.config.siteLanguage,
        name: this.config.siteName,
      },
      page: {
        title: this.state.title || ' ',
        description: this.state.description || ' ',
        canonicalUrl: this.config.canonicalUrl,
      },
    });
  }

  resizePreviewFrame() {
    const frame = this.shadowRoot?.querySelector('[data-social-preview-frame-shell]');
    if (!(frame instanceof HTMLElement)) {
      return;
    }
    frame.style.setProperty(
      '--social-preview-scale',
      String(frame.clientWidth / DEFAULT_SOCIAL_PREVIEW_IMAGE_WIDTH),
    );
  }
}
