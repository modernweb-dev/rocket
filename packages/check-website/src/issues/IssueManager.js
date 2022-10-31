export class IssueManager {
  renderErrorsOnAdd = true;
  logger = console.log;

  issues = [];

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
