import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  clearActiveRunMarker,
  buildPlan,
  buildPrompt,
  parseAgentWorkflow,
  readActiveRunMarker,
  tryReadActiveRunResult,
  validateAgentResult,
  writeActiveRunMarker,
} from './codex-issue-loop.js';

const issue = {
  absPath: '/repo/.scratch/docs-site-refresh/issues/02-remove-blog-tutorial.md',
  file: '02-remove-blog-tutorial.md',
  relPath: '.scratch/docs-site-refresh/issues/02-remove-blog-tutorial.md',
  stem: '02-remove-blog-tutorial',
  title: 'Remove Blog Tutorial',
};

describe('Test codexIssueLoop', () => {
  it('01: defaults Agent Workflow to tdd when Workflow is missing', () => {
    assert.deepEqual(parseAgentWorkflow('# Issue\n\nStatus: ready-for-agent\n'), {
      errors: [],
      value: 'tdd',
    });

    const prompt = buildPrompt({ ...issue, workflow: 'tdd' });
    assert.match(prompt, /\.agents\/skills\/tdd\/SKILL\.md/);
    assert.match(prompt, /Use the TDD skill workflow/);
    assert.match(prompt, /Leave all changes uncommitted/);
    assert.match(prompt, /Do not run git add or git commit/);
    assert.match(prompt, /commitSubject/);
    assert.match(prompt, /fix\(parser\): handle empty config/);
  });

  it('02: uses direct implementation prompt instructions for content Workflow', () => {
    assert.deepEqual(parseAgentWorkflow('Workflow: Content\n'), {
      errors: [],
      value: 'content',
    });

    const prompt = buildPrompt({ ...issue, workflow: 'content' });
    assert.doesNotMatch(prompt, /\.agents\/skills\/tdd\/SKILL\.md/);
    assert.doesNotMatch(prompt, /Use the TDD skill workflow/);
    assert.match(prompt, /Use the content workflow/);
    assert.match(prompt, /docs build, preview build, link\/path inspection, or screenshot/);
  });

  it('03: allows Codex results to omit commit hashes when wrapper owns commits', () => {
    const context = makeContext();

    assert.doesNotThrow(() =>
      validateAgentResult(context, issue, [issue], {
        commit: null,
        commitSubject: 'chore(issue-loop): block missing credentials',
        issue: issue.relPath,
        result: 'blocked',
        summary: 'Blocked before completion.',
      }),
    );
    assert.doesNotThrow(() =>
      validateAgentResult(context, issue, [issue], {
        commit: null,
        commitSubject: 'docs(setup): remove blog tutorial',
        issue: issue.relPath,
        result: 'issue_done',
        summary: 'Completed and left uncommitted for the wrapper.',
      }),
    );
  });

  it('04: rejects commitSubject values outside the mini commit format', () => {
    const context = makeContext();

    assert.throws(
      () =>
        validateAgentResult(context, issue, [issue], {
          commit: null,
          commitSubject: 'Complete issue 02-remove-blog-tutorial: Remove Blog Tutorial',
          issue: issue.relPath,
          result: 'issue_done',
          summary: 'Completed and left uncommitted for the wrapper.',
        }),
      /commitSubject must match/,
    );

    assert.throws(
      () =>
        validateAgentResult(context, issue, [issue], {
          commit: null,
          commitSubject: 'docs(setup): remove blog tutorial.',
          issue: issue.relPath,
          result: 'issue_done',
          summary: 'Completed and left uncommitted for the wrapper.',
        }),
      /must not end with a period/,
    );
  });

  it('05: reports duplicate and unknown workflow metadata errors', () => {
    assert.deepEqual(parseAgentWorkflow('Workflow: content\nWorkflow: tdd\n', 'issues/01.md'), {
      errors: ['issues/01.md has multiple Workflow lines'],
      value: 'content',
    });

    assert.deepEqual(parseAgentWorkflow('Workflow: docs\n', 'issues/02.md'), {
      errors: ['issues/02.md has unknown Workflow: docs'],
      value: 'tdd',
    });

    assert.deepEqual(parseAgentWorkflow('Workflow:\n', 'issues/03.md'), {
      errors: ['issues/03.md has empty Workflow value'],
      value: 'tdd',
    });
  });

  it('06: stops issue planning on workflow metadata errors', () => {
    const featureDir = mkdtempSync(path.join(tmpdir(), 'rocket-issue-workflow-'));
    const issuesDir = path.join(featureDir, 'issues');
    mkdirSync(issuesDir);

    try {
      writeFileSync(
        path.join(issuesDir, '01-bad-workflow.md'),
        `# Bad Workflow

Status: ready-for-agent
Agent state: pending
Workflow: docs

## Blocked by

None - can start immediately
`,
      );
      writeFileSync(
        path.join(issuesDir, '02-valid-workflow.md'),
        `# Valid Workflow

Status: ready-for-agent
Agent state: pending
Workflow: content

## Blocked by

None - can start immediately
`,
      );

      const plan = buildPlan({
        featureDir,
        issuesDir,
        options: {},
        repoRoot: featureDir,
      });

      assert.deepEqual(plan.errors, ['issues/01-bad-workflow.md has unknown Workflow: docs']);
      assert.equal(plan.selected, undefined);
      assert.deepEqual(plan.skipped[0].reasons, [
        'issues/01-bad-workflow.md has unknown Workflow: docs',
      ]);
      assert.deepEqual(plan.skipped[1].reasons, ['issue planning errors must be fixed first']);
    } finally {
      rmSync(featureDir, { recursive: true, force: true });
    }
  });

  it('07: adds resume instructions only for active-run resumes', () => {
    const normalPrompt = buildPrompt({ ...issue, workflow: 'tdd' });
    const resumePrompt = buildPrompt({ ...issue, workflow: 'tdd' }, { resume: true });

    assert.doesNotMatch(normalPrompt, /resuming a previous timed-out issue-loop run/);
    assert.match(resumePrompt, /resuming a previous timed-out issue-loop run/);
    assert.match(resumePrompt, /Inspect the current uncommitted changes/);
    assert.match(resumePrompt, /Preserve useful partial work/);
    assert.match(resumePrompt, /return the normal JSON result/);
  });

  it('08: records and classifies active-run recovery markers', () => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), 'rocket-active-run-'));
    const featureDir = path.join(repoRoot, '.scratch/page-collections');
    const issuesDir = path.join(featureDir, 'issues');
    mkdirSync(issuesDir, { recursive: true });

    try {
      const context = {
        featureDir,
        issuesDir,
        options: {},
        repoRoot,
      };
      const marker = {
        issue: '.scratch/page-collections/issues/03-validate.md',
        resultPath: '.scratch/page-collections/.codex-issue-loop/result.json',
        transcriptPath: '.scratch/page-collections/.codex-issue-loop/codex.log',
        beforeHead: '1234567890abcdef',
        startedAt: '2026-05-25T08:00:00.000Z',
      };

      writeActiveRunMarker(context, marker);
      assert.deepEqual(readActiveRunMarker(context), marker);
      assert.equal(tryReadActiveRunResult(context, marker).kind, 'missing');

      writeFileSync(
        path.join(repoRoot, marker.resultPath),
        `${JSON.stringify({
          commit: null,
          commitSubject: 'feat(build): add pagination',
          issue: marker.issue,
          result: 'issue_done',
          summary: 'Done.',
        })}\n`,
      );
      assert.equal(tryReadActiveRunResult(context, marker).kind, 'recoverable');

      writeFileSync(
        path.join(repoRoot, marker.resultPath),
        `${JSON.stringify({
          commit: null,
          commitSubject: 'chore(issue-loop): noop',
          issue: marker.issue,
          result: 'complete',
          summary: 'No work.',
        })}\n`,
      );
      assert.equal(tryReadActiveRunResult(context, marker).kind, 'invalid');

      clearActiveRunMarker(context);
      assert.equal(readActiveRunMarker(context), undefined);
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

function makeContext() {
  return {
    featureDir: '/repo/.scratch/docs-site-refresh',
    issuesDir: '/repo/.scratch/docs-site-refresh/issues',
    repoRoot: '/repo',
  };
}
