import { Issue } from './Issue.js';

export class ReferenceIssue extends Issue {
  constructor(options = {}) {
    super({
      title: 'Not Found',
      icon: '🔗',
      ...options,
    });
  }
}
