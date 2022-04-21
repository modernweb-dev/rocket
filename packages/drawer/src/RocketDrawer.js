/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LitElement, html } from 'lit-element';
import { OverlayMixin, withModalDialogConfig } from '@lion/overlays';

/** @typedef {import('@lion/overlays/types/OverlayConfig').OverlayConfig} OverlayConfig */

/**
 * @param {HTMLElement} el
 */
function transitionend(el) {
  return new Promise(resolve => {
    el.addEventListener('transitionend', resolve, { once: true });
  });
}

// @ts-expect-error
export class RocketDrawer extends OverlayMixin(LitElement) {
  static get properties() {
    return {
      useOverlay: { type: Boolean, reflect: true },
      useOverlayMediaQuery: { type: String },
      mediaMatcher: { type: Object },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  // @ts-ignore
  _defineOverlayConfig() {
    return /** @type {OverlayConfig} */ {
      ...withModalDialogConfig(),
      hidesOnOutsideClick: true,
      viewportConfig: {
        placement: 'slide',
      },
    };
  }

  _setupOverlayCtrl() {
    if (this.useOverlay) {
      super._setupOverlayCtrl();

      /* eslint-disable no-param-reassign */
      this._overlayCtrl.transitionHide = async ({ contentNode }) => {
        contentNode.style.transition = 'transform 0.20s cubic-bezier(0.4, 0.0, 0.2, 1)';
        contentNode.style.transform = 'translateX(-100%)';
        await transitionend(contentNode);
        // contentNode.style.display = 'none';
      };
      this._overlayCtrl.transitionShow = async ({ contentNode }) => {
        contentNode.style.display = 'block';
        contentNode.style.transform = 'translateX(-100%)';
        contentNode.style.transition = 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)';
        // wait for display block to be "updated in the dom" and then translate otherwise there will be no animation
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        contentNode.style.transform = 'translateX(0)';
        await transitionend(contentNode);
      };
      /* eslint-enable no-param-reassign */

      this._overlayCtrl.contentNode.style.transform = 'translateX(-100%)';
      this._overlayCtrl.contentNode.style.willChange = 'transform';

      // gesture
      this.containerEl = this._overlayCtrl.contentNode;
    }
  }

  _teardownOverlayCtrl() {
    super._teardownOverlayCtrl();
    this._overlayCtrl.contentNode.style.transform = 'translateX(0)';
  }

  /** @param {import('lit-element').PropertyValues } changedProperties */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('opened')) {
      if (this.opened) {
        document.body.addEventListener('touchstart', this.onGestureStart, { passive: true });
      } else {
        document.body.removeEventListener('touchstart', this.onGestureStart);
      }
    }

    if (changedProperties.has('useOverlay')) {
      if (this.useOverlay) {
        this._setupOverlayCtrl();
      } else {
        if (this._overlayCtrl) {
          this._teardownOverlayCtrl();
        }
      }
    }
    if (changedProperties.has('useOverlayMediaQuery')) {
      this.mediaMatcher.removeEventListener('change', this.onMatchMedia);

      this.mediaMatcher = window.matchMedia(this.useOverlayMediaQuery);
      this.mediaMatcher.addEventListener('change', this.onMatchMedia);
      this.useOverlay = !!this.mediaMatcher.matches;
    }
  }

  /**
   * @param { MediaQueryListEvent } query
   */
  onMatchMedia(query) {
    this.useOverlay = !!query.matches;
  }

  _setupOpenCloseListeners() {
    super._setupOpenCloseListeners();
    if (this._overlayInvokerNode) {
      this._overlayInvokerNode.addEventListener('click', this.__toggle);
    }
  }

  _teardownOpenCloseListeners() {
    super._teardownOpenCloseListeners();
    if (this._overlayInvokerNode) {
      this._overlayInvokerNode.removeEventListener('click', this.__toggle);
    }
  }

  __toggle() {
    this.opened = !this.opened;
  }

  // ********************* GESTURE ***********************

  constructor() {
    super();
    this.useOverlay = false;
    this.useOverlayMediaQuery = '(max-width: 1024px)';

    this.__toggle = this.__toggle.bind(this);

    this.onMatchMedia = this.onMatchMedia.bind(this);
    this.onGestureStart = this.onGestureStart.bind(this);
    this.onGestureMove = this.onGestureMove.bind(this);
    this.onGestureEnd = this.onGestureEnd.bind(this);
    this.updateFromTouch = this.updateFromTouch.bind(this);

    this.mediaMatcher = window.matchMedia(this.useOverlayMediaQuery);
    this.mediaMatcher.addEventListener('change', this.onMatchMedia);

    this._startX = 0;
    this._currentX = 0;
    this._velocity = 0;
    this._left = 0;
    this.__touching = false;
    this._timestamp = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.useOverlay = !!this.mediaMatcher.matches;
  }

  render() {
    return html`
      <slot name="invoker"></slot>
      <slot name="_overlay-shadow-outlet"></slot>
      <div id="overlay-content-node-wrapper">
        <slot name="content"></slot>
      </div>
    `;
  }

  /**
   * @param {TouchEvent} ev
   */
  onGestureStart(ev) {
    if (!this.containerEl) {
      return;
    }
    this.__touching = true;
    this._left = this.containerEl.getBoundingClientRect().left;
    this._startX = ev.targetTouches[0].clientX;
    this._currentX = this._startX;
    this._timestamp = new Date().getTime();
    this._velocity = 0;

    this._overlayCtrl.contentNode.style.transition = '';

    document.body.addEventListener('touchmove', this.onGestureMove, { passive: true });
    document.body.addEventListener('touchend', this.onGestureEnd, { passive: true });
    document.body.addEventListener('touchcancel', this.onGestureEnd, { passive: true });
    requestAnimationFrame(this.updateFromTouch);
  }

  /**
   * @param {number} dDist
   * @param {number} dTime
   */
  addVelocitySample(dDist, dTime) {
    if (dTime === 0) {
      return;
    }

    const velocitySample = dDist / dTime;

    // Low pass filter.
    const alpha = 0.75;
    this._velocity *= alpha;
    this._velocity += (1 - alpha) * velocitySample;
  }

  /**
   * @param {TouchEvent} ev
   */
  onGestureMove(ev) {
    if (!this.__touching) {
      return;
    }
    const lastTimestamp = this._timestamp;
    this._timestamp = new Date().getTime();
    const dTime = this._timestamp - lastTimestamp;
    const lastX = this._currentX;
    this._currentX = ev.targetTouches[0].clientX;
    const dX = this._currentX - lastX;
    this.addVelocitySample(dX, dTime);
  }

  onGestureEnd() {
    if (!this.__touching || !this.containerEl) {
      this.opened = false;
      return;
    }

    this.__touching = false;
    let endOpenedState;

    // Check for fling.
    if (Math.abs(this._velocity) > 1) {
      endOpenedState = this._velocity > 0;
    } else {
      // Check depending on percentage visible.
      const { left } = this.containerEl.getBoundingClientRect();
      const width = this.containerEl.clientWidth;
      const percentageVisible = (left + width) / width;
      endOpenedState = percentageVisible >= 0.5;
    }

    this._overlayCtrl.contentNode.style.transition =
      'transform 0.20s cubic-bezier(0.4, 0.0, 0.2, 1)';

    this.containerEl.style.transform = '';
    this.opened = endOpenedState;

    document.body.removeEventListener('touchmove', this.onGestureMove);
    document.body.removeEventListener('touchend', this.onGestureEnd);
    document.body.removeEventListener('touchcancel', this.onGestureEnd);
  }

  updateFromTouch() {
    if (!this.__touching || !this.containerEl) {
      return;
    }
    requestAnimationFrame(this.updateFromTouch);

    const translateX = Math.min(0, this._currentX - this._startX + this._left);
    this.containerEl.style.transform = `translateX(${translateX}px)`;
  }
}
