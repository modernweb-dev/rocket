import { Issue } from './Issue.js';

export class PageIssue extends Issue {
  constructor(options = {}) {
    super({
      message: '',
      title: 'Page Issue',
      ...options,
    });
  }
}
