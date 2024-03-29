import { EventEmitter } from 'events';

/**
 * This class emits events asynchronously.
 * It can be used for time measurements during a build.
 */
export class AsyncEventEmitter extends EventEmitter {
  /**
   * @param {string} type - The event name to emit.
   * @param {*[]} args - Additional arguments that get passed to listeners.
   * @returns {Promise<*[]>} - Promise resolves once all listeners were invoked
   */
  async dispatchEventDone(type, ...args) {
    let listeners = this.listeners(type);
    if (listeners.length === 0) {
      return [];
    }

    return Promise.all(listeners.map(listener => listener.apply(this, args)));
  }
}
