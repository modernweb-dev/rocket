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
    skip: false,
  };

  /**
   * @param {Partial<{}>} options
   */
  constructor(options = {}) {
    this.options = { ...this.options, ...options };
  }

  /**
   * @param {(msg: string) => void} logger
   * @returns {void}
   */
  render(logger) {
    const useLogger = logger || this.options.logger;
    if (this.options.duplicate) {
      return;
    }
    useLogger(`${this.options.icon} ${this.options.title}: ${this.options.message}`);
    useLogger(`  🛠️  ${this.options.filePath}`);
  }
}
