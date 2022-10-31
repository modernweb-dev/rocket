export class IssueManager {
  renderErrorsOnAdd = true;
  logger = console.log;

  /**
   * @type {(import('./Issue.js').Issue | import('./PageIssue.js').PageIssue | import('./ReferenceIssue.js').ReferenceIssue)[]}
   */
  issues = [];

  /**
   * 
   * @param {import('./Issue.js').Issue | import('./PageIssue.js').PageIssue | import('./ReferenceIssue.js').ReferenceIssue} issue 
   */
  add(issue) {
    this.issues.push(issue);
    if (this.renderErrorsOnAdd) {
      issue.render(this.logger);
    }
  }

  all() {
    return this.issues;
  }
}
