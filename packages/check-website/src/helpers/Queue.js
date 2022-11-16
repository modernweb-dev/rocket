import { formatPerformance } from './formatPerformance.js';
import PQueue from 'p-queue';

/** @typedef {import('p-queue').QueueAddOptions} QueueAddOptions */
/** @typedef {import('p-queue').PriorityQueue} PriorityQueue  */

export class Queue extends PQueue {
  #total = 0;

  /** @type {[number, number] | undefined} */
  #durationStart;
  /** @type {[number, number] | undefined} */
  duration;

  isIdle = true;

  /**
   * @param {import('p-queue').Options<PriorityQueue, QueueAddOptions>} [options]
   */
  constructor(options) {
    super(options);
    this.on('active', () => {
      if (!this.#durationStart) {
        this.#durationStart = process.hrtime();
      }
      this.isIdle = false;
    });
    this.on('completed', () => {
      this.duration = process.hrtime(this.#durationStart);
    });
    this.on('idle', () => {
      this.isIdle = true;
    });
    this.on('add', () => {
      this.#total += 1;
    });
  }

  getDuration() {
    return this.duration ? formatPerformance(this.duration) : '0.00';
  }

  getDone() {
    return this.#total - this.size - this.pending;
  }

  getTotal() {
    return this.#total;
  }
}
