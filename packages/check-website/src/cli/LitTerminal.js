/* eslint-disable @typescript-eslint/ban-ts-comment */
import { hideCursor } from './helpers.js';

const terminal = process.stderr;

export class LitTerminal {
  dynamicRender = true;

  /**
   * They dynamic cli view.
   * It can only render as many lines as the terminal height which is usually around 24-40.
   * If you write more dynamic lines, an error will be thrown.
   * To display more information you can use logStatic() to render lines that will not by dynamic.
   *
   * Why?
   * If you write more lines than the terminal height then scrolling will happen and at this point it is
   * no longer accessible by the terminal itself.
   * Scrolling is a feature of terminal simulators, not the terminal itself.
   * This means that once content got scrolled out of the terminal, it is no longer adjustable.
   *
   * @example
   *   render() {
   *     return cli`
   *       Counter: ${this.counter}
   *     `;
   *   }
   *
   * @returns {string}
   */
  render() {
    return '';
  }

  constructor() {
    /** @type {typeof LitTerminal} */ (this.constructor).__finalize();
  }

  /**
   * Log a static string that is rendered above the dynamic view.
   *
   * Use it to display information like a list of errors or completed tasks.
   * This content will not be cleared when the dynamic view is rendered and will always be reachable via scrolling.
   *
   * @param {string} message
   */
  logStatic(message) {
    this.#staticLogs.push(message);
    this.requestUpdate();
  }

  /**
   * Request a rerender of the dynamic view.
   * You can call this as often as you want and it will only rerender once per LitTerminal.renderInterval.
   * Typically you don't need to call this manually as it is called automatically when you update a property or use logStatic().
   * You can use it to create your own getters/setters
   * @example
   *   _counter = 0;
   *   set counter(counter) {
   *     this._counter = counter;
   *     this.requestUpdate();
   *   }
   *   get counter() {
   *     return this._counter;
   *   }s
   */
  requestUpdate() {
    if (this.#updateRequested === false) {
      this.#updateRequested = true;
      setTimeout(() => {
        this._render();
        this.#updateRequested = false;
      }, /** @type {typeof LitTerminal} */ (this.constructor).renderInterval);
    }
  }

  /**
   * This actually
   */
  execute() {
    hideCursor();
  }

  //
  // End of public API
  //

  #lastRender = '';

  /** @type {string[]} */
  #staticLogs = [];

  #updateRequested = false;

  /**
   * How often (in ms) the dynamic view should be rerendered [defaults to 100]
   */
  static renderInterval = 100;

  /**
   * This writes the result of render() & logStatic() to the terminal.
   * It compares the last render with the current render and only clears and writes the changed lines.
   *
   * It throws an error you render() tries to write more lines than the terminal height.
   */
  _render() {
    if (this.dynamicRender === false) {
      for (const staticLog of this.#staticLogs) {
        console.log(staticLog);
      }
      this.#staticLogs = [];
      return;
    }

    const render = this.render();
    const renderLines = render.split('\n');

    const windowSize = terminal.getWindowSize();
    if (renderLines.length > windowSize[1]) {
      throw new Error(
        `You rendered ${renderLines.length} lines while the terminal height is only ${windowSize[1]}. For non dynamic parts use logStatic()`,
      );
    }

    if (render !== this.#lastRender || this.#staticLogs.length) {
      const lastRenderLines = this.#lastRender.split('\n');
      if (lastRenderLines.length > 0) {
        terminal.moveCursor(0, lastRenderLines.length * -1);
        terminal.cursorTo(0);
      }

      const staticLength = this.#staticLogs.length;
      if (staticLength) {
        for (const staticLog of this.#staticLogs) {
          terminal.clearLine(0);
          console.log(staticLog);
        }
        this.#staticLogs = [];
      }

      for (const [index, line] of renderLines.entries()) {
        if (line.length !== lastRenderLines[index - staticLength]?.length) {
          terminal.clearLine(0);
        }
        console.log(line);
      }
      terminal.clearScreenDown();

      this.#lastRender = render;
    }
  }

  //
  // ***********************************************************************************************
  // Below if inspired by ReactiveElement
  // https://github.com/lit/lit/blob/main/packages/reactive-element/src/reactive-element.ts
  //

  static finalized = false;
  static properties = {};

  /**
   * Creates property accessors for registered properties, sets up element
   * styling, and ensures any superclasses are also finalized. Returns true if
   * the element was finalized.
   * @nocollapse
   */
  static __finalize() {
    if (this.finalized) {
      return false;
    }
    this.finalized = true;
    // // finalize any superclasses
    // const superCtor = Object.getPrototypeOf(this);
    // superCtor.finalize();

    if (this.properties) {
      const props = this.properties;
      // support symbols in properties (IE11 does not support this)
      const propKeys = [
        ...Object.getOwnPropertyNames(props),
        ...Object.getOwnPropertySymbols(props),
      ];
      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }
    return true;
  }

  /**
   * Creates a property accessor on the element prototype if one does not exist
   * and stores a {@linkcode PropertyDeclaration} for the property with the
   * given options. The property setter calls the property's `hasChanged`
   * property option or uses a strict identity check to determine whether or not
   * to request an update.
   *
   * This method may be overridden to customize properties; however,
   * when doing so, it's important to call `super.createProperty` to ensure
   * the property is setup correctly. This method calls
   * `getPropertyDescriptor` internally to get a descriptor to install.
   * To customize what properties do when they are get or set, override
   * `getPropertyDescriptor`. To customize the options for a property,
   * implement `createProperty` like this:
   *
   * ```ts
   * static createProperty(name, options) {
   *   options = Object.assign(options, {myOption: true});
   *   super.createProperty(name, options);
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   * @param {PropertyKey} name Name of property
   * @param {PropertyDeclaration} options Property declaration
   */
  static createProperty(name, options) {
    // Note, since this can be called by the `@property` decorator which
    // is called before `finalize`, we ensure finalization has been kicked off.
    this.__finalize();

    this.elementProperties.set(name, options);

    // Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it
    if (!options.noAccessor && !this.prototype.hasOwnProperty(name)) {
      const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        Object.defineProperty(this.prototype, name, descriptor);
      }
    }
  }

  /**
   * Returns a property descriptor to be defined on the given named property.
   * If no descriptor is returned, the property will not become an accessor.
   * For example,
   *
   * ```ts
   * class MyElement extends LitElement {
   *   static getPropertyDescriptor(name, key, options) {
   *     const defaultDescriptor =
   *         super.getPropertyDescriptor(name, key, options);
   *     const setter = defaultDescriptor.set;
   *     return {
   *       get: defaultDescriptor.get,
   *       set(value) {
   *         setter.call(this, value);
   *         // custom action.
   *       },
   *       configurable: true,
   *       enumerable: true
   *     }
   *   }
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   * @param {string} name
   * @param {string} key
   * @param {*} options
   * @returns
   */
  static getPropertyDescriptor(name, key, options) {
    return {
      /**
       * @this {LitTerminal}
       */
      get() {
        // @ts-ignore
        return this[key];
        // return (this as {[key: string]: unknown})[key as string];
      },
      /**
       * @param {unknown} value
       * @this {LitTerminal}
       */
      set(value) {
        // const oldValue = this[name];
        // @ts-ignore
        this[key] = value;
        this.requestUpdate();
        // this.requestUpdate(name, oldValue, options);
      },
      configurable: true,
      enumerable: true,
    };
  }

  static elementProperties = new Map();

  /**
   * Returns the property options associated with the given property.
   * These options are defined with a `PropertyDeclaration` via the `properties`
   * object or the `@property` decorator and are registered in
   * `createProperty(...)`.
   *
   * Note, this method should be considered "final" and not overridden. To
   * customize the options for a given property, override
   * {@linkcode createProperty}.
   *
   * @nocollapse
   * @final
   * @category properties
   * @param {string | symbol} name
   */
  static getPropertyOptions(name) {
    return this.elementProperties.get(name) || defaultPropertyDeclaration;
  }

  /**
   * Returns a Promise that resolves when the element has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * To await additional asynchronous work, override the `getUpdateComplete`
   * method. For example, it is sometimes useful to await a rendered element
   * before fulfilling this Promise. To do this, first await
   * `super.getUpdateComplete()`, then any subsequent state.
   *
   * @category updates
   * @returns {Promise<boolean>} A promise of a boolean that resolves to true if the update completed
   *   without triggering another update.
   */
  get updateComplete() {
      return new Promise(resolve => setTimeout(resolve, 100));
    // TODO: implement actual waiting for a finished render
    // return this.getUpdateComplete();
  }

  /**
   * Override point for the `updateComplete` promise.
   *
   * It is not safe to override the `updateComplete` getter directly due to a
   * limitation in TypeScript which means it is not possible to call a
   * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
   * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
   * This method should be overridden instead. For example:
   *
   * ```ts
   * class MyElement extends LitElement {
   *   override async getUpdateComplete() {
   *     const result = await super.getUpdateComplete();
   *     await this._myChild.updateComplete;
   *     return result;
   *   }
   * }
   * ```
   *
   * @returns {Promise<boolean>} A promise of a boolean that resolves to true if the update completed
   *     without triggering another update.
   * @category updates
   */
  getUpdateComplete() {
    return this.__updatePromise;
  }
}

const defaultPropertyDeclaration = {
  type: String,
  hasChanged: notEqual,
};

/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 * @param {unknown} value The new value
 * @param {unknown} old The old value
 */
export function notEqual(value, old) {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value);
}
