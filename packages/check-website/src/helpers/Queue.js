import { formatPerformance } from './formatPerformance.js';

export class Queue {
  /** @type {unknown[]} */
  #queue = [];
  #done = 0;

  #itemCallback = new Map();

  #action;
  #doneAction;

  /**
   * @param {{ action: (item: unknown) => Promise<void>, doneAction?: () => void }} params 
   */
  constructor(params) {
    if (!params?.action) {
      throw new Error(
        'Queue constructor requires an action. Example: new Queue({ action: (item) => item.executeParse(); })',
      );
    }
    this.#action = params.action;
    this.#doneAction = params.doneAction;
  }

  /**
   * @param {unknown} item
   * @param {() => void} [cb]
   */
  add(item, cb) {
    this.#queue.push(item);
    this.requestStart();
    if (cb) {
      this.#itemCallback.set(item, cb);
    }
  }

  /**
   * @param {unknown[]} items
   * @param {() => void} [cb]
   */
  addMultiple(items, cb) {
    items.forEach(item => this.add(item, cb));
  }

  #running = false;
  #requestedStart = false;
  /** @type {[number, number] | undefined} */
  #durationStart;
  /** @type {[number, number] | undefined} */
  duration;

  requestStart() {
    if (!this.#requestedStart) {
      this.#requestedStart = true;
      queueMicrotask(() => {
        this.start();
        this.#requestedStart = false;
      });
    }
  }

  async start() {
    if (this.#running) {
      return;
    }
    if (this.#queue.length > this.#done) {
      this.#running = true;
      if (!this.#durationStart) {
        this.#durationStart = process.hrtime();
      }
      let next = this.#queue[this.#done];
      while (next) {
        await this.#action(next);
        const cb = this.#itemCallback.get(next);
        if (cb) {
          cb();
        }
        this.#done += 1;
        next = this.#queue[this.#done];
        this.duration = process.hrtime(this.#durationStart);
      }
      this.#running = false;
      if (this.#doneAction) {
        this.#doneAction();
      }
    }
  }

  getDuration() {
    return this.duration ? formatPerformance(this.duration) : '0.00';
  }

  getDone() {
    return this.#done;
  }

  getTotal() {
    return this.#queue.length;
  }

  isDone() {
    return (
      this.#requestedStart === false && this.#running === false && this.#queue.length === this.#done
    );
  }
}
