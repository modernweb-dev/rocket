export class Issue {
  options = {
    sortOrder: 0,
    duplicate: false,
    filePath: '',
    title: 'Issue',
    message: '',
    icon: '❌',
    logger: console.log,
    page: null,
  };

  /**
   * @param {Partial<{}>} options
   */
  constructor(options = {}) {
    this.options = { ...this.options, ...options };
  }

  render(logger) {
    if (this.options.duplicate) {
      return;
    }
    logger(`${this.options.icon} ${this.options.title}: ${this.options.message}`);
    logger(`  🛠️  ${this.options.filePath}`);
  }
}
