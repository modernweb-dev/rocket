#!/usr/bin/env node
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const CHECKS = [
  ['npm', ['run', 'types']],
  ['npm', ['test']],
  ['npm', ['run', 'lint']],
];

const AGENT_STATES = new Set(['pending', 'done', 'blocked']);
const DEFAULT_AGENT_WORKFLOW = 'tdd';
const AGENT_WORKFLOWS = new Set([DEFAULT_AGENT_WORKFLOW, 'content']);
const ACTIVE_RUN_FILE = 'active-run.json';
const COMMIT_SUBJECT_TYPES = ['feat', 'fix', 'docs', 'test', 'refactor', 'chore', 'build', 'ci'];
const COMMIT_SUBJECT_PATTERN = new RegExp(
  `^(${COMMIT_SUBJECT_TYPES.join('|')})\\([a-z0-9][a-z0-9-]*\\): \\S.{0,99}$`,
);

const RESULT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['result', 'issue', 'commit', 'commitSubject', 'summary'],
  properties: {
    result: {
      type: 'string',
      enum: ['issue_done', 'blocked', 'complete'],
    },
    issue: {
      type: 'string',
    },
    commit: {
      type: ['string', 'null'],
    },
    commitSubject: {
      type: 'string',
    },
    summary: {
      type: 'string',
    },
  },
};

if (isCliEntrypoint()) {
  main().catch(error => {
    process.stderr.write(`codex-issue-loop: ${error.message}\n`);
    process.exit(1);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const repoRoot = capture('git', ['rev-parse', '--show-toplevel'], process.cwd()).trim();
  const featureDir = resolveFeatureDir(repoRoot, options.featureDir);
  const issuesDir = join(featureDir, 'issues');

  if (!existsSync(featureDir)) {
    throw new Error(`feature directory does not exist: ${options.featureDir}`);
  }

  if (!existsSync(issuesDir)) {
    throw new Error(
      `feature directory has no issues directory: ${posixPath(relative(repoRoot, issuesDir))}`,
    );
  }

  const context = {
    repoRoot,
    featureDir,
    issuesDir,
    options,
  };

  const branch = capture('git', ['branch', '--show-current'], repoRoot).trim();
  const worktreeStatus = capture('git', ['status', '--porcelain'], repoRoot);
  let plan = buildPlan(context);
  const activeRun = readActiveRunMarker(context);

  if (options.dryRun) {
    printDryRun(context, branch, worktreeStatus, plan, activeRun);
    return;
  }

  const startState = await prepareStartState(context, branch, worktreeStatus, activeRun);

  if (startState.exit) {
    return;
  }

  if (startState.resumeIssue) {
    plan = buildPlan(context);
    if (plan.errors.length > 0) {
      throw new Error(formatPlanErrors(plan.errors));
    }
    await runIssue(context, startState.resumeIssue, 1, { resume: true });
    await runEligibleIssues(context, 2);
    return;
  }

  plan = buildPlan(context);

  if (plan.errors.length > 0) {
    throw new Error(formatPlanErrors(plan.errors));
  }

  if (!options.skipBaselineChecks) {
    await runChecks(repoRoot, 'baseline');
  }

  await runEligibleIssues(context, 1);
}

async function runEligibleIssues(context, startIteration) {
  for (let iteration = startIteration; iteration <= context.options.max; iteration += 1) {
    const currentPlan = buildPlan(context);

    if (currentPlan.errors.length > 0) {
      throw new Error(formatPlanErrors(currentPlan.errors));
    }

    if (!currentPlan.selected) {
      printNoEligibleIssues(currentPlan);
      return;
    }

    await runIssue(context, currentPlan.selected, iteration);
  }
}

function parseArgs(argv) {
  const options = {
    allowMain: false,
    dryRun: false,
    featureDir: undefined,
    help: false,
    max: 1,
    recoverActiveRun: false,
    resumeActiveRun: false,
    skipBaselineChecks: false,
    timeoutMinutes: 60,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--allow-main') {
      options.allowMain = true;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--recover-active-run') {
      options.recoverActiveRun = true;
      continue;
    }

    if (arg === '--resume-active-run') {
      options.resumeActiveRun = true;
      continue;
    }

    if (arg === '--skip-baseline-checks') {
      options.skipBaselineChecks = true;
      continue;
    }

    if (arg === '--max') {
      index += 1;
      options.max = parsePositiveInteger(argv[index], '--max');
      continue;
    }

    if (arg.startsWith('--max=')) {
      options.max = parsePositiveInteger(arg.slice('--max='.length), '--max');
      continue;
    }

    if (arg === '--timeout-minutes') {
      index += 1;
      options.timeoutMinutes = parsePositiveInteger(argv[index], '--timeout-minutes');
      continue;
    }

    if (arg.startsWith('--timeout-minutes=')) {
      options.timeoutMinutes = parsePositiveInteger(
        arg.slice('--timeout-minutes='.length),
        '--timeout-minutes',
      );
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`unknown option: ${arg}`);
    }

    if (options.featureDir) {
      throw new Error(`unexpected positional argument: ${arg}`);
    }

    options.featureDir = arg;
  }

  if (options.recoverActiveRun && options.resumeActiveRun) {
    throw new Error('--recover-active-run and --resume-active-run cannot be used together');
  }

  return options;
}

function resolveFeatureDir(repoRoot, featureArg) {
  if (!featureArg) {
    return resolveDefaultFeatureDir(repoRoot);
  }

  if (featureArg.startsWith('.') || featureArg.includes('/') || featureArg.includes('\\')) {
    return resolve(process.cwd(), featureArg);
  }

  return join(repoRoot, '.scratch', featureArg);
}

function resolveDefaultFeatureDir(repoRoot) {
  const scratchDir = join(repoRoot, '.scratch');

  if (!existsSync(scratchDir)) {
    throw new Error('no feature directory provided and .scratch does not exist');
  }

  const candidates = readdirSync(scratchDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(scratchDir, entry.name))
    .filter(featureDir => existsSync(join(featureDir, 'issues')))
    .sort((a, b) => a.localeCompare(b));

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length === 0) {
    throw new Error('no feature directory provided and no .scratch/*/issues directories exist');
  }

  throw new Error(
    `no feature directory provided and multiple feature directories exist:\n${candidates
      .map(candidate => `- ${posixPath(relative(repoRoot, candidate))}`)
      .join('\n')}\nPass one explicitly, for example: npm run ai:do -- ${basename(candidates[0])}`,
  );
}

function parsePositiveInteger(value, optionName) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || String(parsed) !== String(value)) {
    throw new Error(`${optionName} must be a positive integer`);
  }

  return parsed;
}

function printUsage() {
  process.stdout.write(`Usage: npm run ai:do -- [feature-dir-or-slug] [options]

Feature selection:
  no argument                Use the only .scratch/*/issues feature directory.
  component-hydration        Resolve as .scratch/component-hydration.
  .scratch/component-hydration
                             Use an explicit path.

Common commands:
  npm run ai:check           Dry-run the next issue.
  npm run ai:do              Run one issue.
  npm run ai:do-loop         Run up to six issues.

Options:
  --max <count>              Run at most this many issues. Defaults to 1.
  --dry-run                  Print selection and guards without invoking Codex.
  --recover-active-run       Validate and commit the active run result, then exit.
  --resume-active-run        Re-run the active issue against partial uncommitted work.
  --timeout-minutes <count>  Bound each Codex invocation. Defaults to 60.
  --allow-main               Allow running on the main branch.
  --skip-baseline-checks     Skip pre-run baseline checks.
  -h, --help                 Show this help.
`);
}

function isCliEntrypoint() {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function prepareStartState(context, branch, worktreeStatus, activeRun) {
  guardBranch(context.options, branch);

  if (context.options.recoverActiveRun) {
    await recoverActiveRun(context, activeRun);
    return { exit: true };
  }

  if (context.options.resumeActiveRun) {
    return {
      resumeIssue: prepareActiveRunResume(context, activeRun, worktreeStatus),
    };
  }

  if (worktreeStatus.trim()) {
    if (!activeRun) {
      throw new Error(
        'refusing to run with a dirty worktree and no active run marker. Commit, stash, or revert the changes before rerunning.',
      );
    }

    validateActiveRunHead(context, activeRun);
    const resultStatus = tryReadActiveRunResult(context, activeRun);
    if (resultStatus.kind === 'recoverable') {
      printLine(
        `Dirty worktree belongs to active run ${activeRun.issue}; recovering result before selecting more issues.`,
      );
      await recoverActiveRun(context, activeRun);
      return { recovered: true };
    }

    throw new Error(
      `refusing to run with a dirty worktree for active run ${activeRun.issue}: ${formatActiveRunResultStatus(
        resultStatus,
      )}. Use --resume-active-run to continue the same issue, or commit, stash, or revert intentionally.`,
    );
  }

  if (activeRun) {
    clearStaleCleanActiveRun(context, activeRun);
  }

  return {};
}

function guardBranch(options, branch) {
  if (branch === 'main' && !options.allowMain) {
    throw new Error('refusing to run on main without --allow-main');
  }
}

function prepareActiveRunResume(context, activeRun, worktreeStatus) {
  if (!activeRun) {
    throw new Error('--resume-active-run requires an active run marker');
  }

  if (!worktreeStatus.trim()) {
    throw new Error('--resume-active-run requires a dirty worktree with partial issue changes');
  }

  validateActiveRunHead(context, activeRun);
  const resultStatus = tryReadActiveRunResult(context, activeRun);
  if (resultStatus.kind === 'recoverable') {
    throw new Error(
      `active run ${activeRun.issue} already has a recoverable result. Use --recover-active-run or rerun normally to recover it.`,
    );
  }

  const issue = resolveActiveRunIssue(context, activeRun);
  if (issue.agentState !== 'pending') {
    throw new Error(
      `cannot resume active run ${issue.relPath} because Agent state is ${issue.agentState}`,
    );
  }

  return issue;
}

async function recoverActiveRun(context, activeRun) {
  if (!activeRun) {
    throw new Error('--recover-active-run requires an active run marker');
  }

  validateActiveRunHead(context, activeRun);
  const resultStatus = tryReadActiveRunResult(context, activeRun);
  if (resultStatus.kind !== 'recoverable') {
    throw new Error(
      `active run ${activeRun.issue} cannot be recovered: ${formatActiveRunResultStatus(
        resultStatus,
      )}`,
    );
  }

  const issue = resolveActiveRunIssue(context, activeRun);
  printLine(`Recovering active run for ${issue.relPath}`);
  await processAgentResult(context, issue, resultStatus.result, {
    beforeHead: activeRun.beforeHead,
    clearActiveRun: true,
  });
}

function clearStaleCleanActiveRun(context, activeRun) {
  const currentHead = capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
  if (activeRun.beforeHead !== currentHead) {
    clearActiveRunMarker(context);
    printLine(`Cleared stale active run marker for ${activeRun.issue}; HEAD has moved.`);
    return;
  }

  const issue = resolveActiveRunIssue(context, activeRun);
  if (issue.agentState === 'done' || issue.agentState === 'blocked') {
    clearActiveRunMarker(context);
    printLine(
      `Cleared stale active run marker for ${issue.relPath}; Agent state is ${issue.agentState}.`,
    );
    return;
  }

  throw new Error(
    `active run marker exists for ${issue.relPath}, but the worktree is clean. Remove ${posixPath(
      relative(context.repoRoot, activeRunMarkerPath(context)),
    )} if it is stale, or use --resume-active-run after restoring the partial changes.`,
  );
}

function resolveActiveRunIssue(context, activeRun) {
  const issues = readIssues(context);
  resolveBlockers(context, issues);
  const matches = findIssueMatches(context, issues, activeRun.issue);

  if (matches.length === 0) {
    throw new Error(`active run issue does not exist: ${activeRun.issue}`);
  }

  if (matches.length > 1) {
    throw new Error(
      `active run issue is ambiguous: ${activeRun.issue} (${matches
        .map(match => match.relPath)
        .join(', ')})`,
    );
  }

  return matches[0];
}

function validateActiveRunHead(context, activeRun) {
  const currentHead = capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
  if (activeRun.beforeHead !== currentHead) {
    throw new Error(
      `active run ${activeRun.issue} started at ${shortHash(
        activeRun.beforeHead,
      )}, but HEAD is now ${shortHash(currentHead)}. Commit, stash, or revert intentionally before rerunning.`,
    );
  }
}

function activeRunMarkerPath(context) {
  return join(context.featureDir, '.codex-issue-loop', ACTIVE_RUN_FILE);
}

function readActiveRunMarker(context) {
  const markerPath = activeRunMarkerPath(context);
  if (!existsSync(markerPath)) {
    return undefined;
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(markerPath, 'utf8'));
  } catch (error) {
    throw new Error(
      `active run marker is not valid JSON: ${posixPath(
        relative(context.repoRoot, markerPath),
      )}: ${error.message}`,
      { cause: error },
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('active run marker must be a JSON object');
  }

  const marker = /** @type {Record<string, unknown>} */ (parsed);
  for (const field of ['issue', 'resultPath', 'transcriptPath', 'beforeHead', 'startedAt']) {
    if (typeof marker[field] !== 'string' || !marker[field]) {
      throw new Error(`active run marker is missing ${field}`);
    }
  }

  return {
    issue: /** @type {string} */ (marker.issue),
    resultPath: /** @type {string} */ (marker.resultPath),
    transcriptPath: /** @type {string} */ (marker.transcriptPath),
    beforeHead: /** @type {string} */ (marker.beforeHead),
    startedAt: /** @type {string} */ (marker.startedAt),
  };
}

function writeActiveRunMarker(context, marker) {
  const markerPath = activeRunMarkerPath(context);
  mkdirSync(join(context.featureDir, '.codex-issue-loop'), { recursive: true });
  writeFileSync(markerPath, `${JSON.stringify(marker, null, 2)}\n`);
}

function clearActiveRunMarker(context) {
  rmSync(activeRunMarkerPath(context), { force: true });
}

function tryReadActiveRunResult(context, activeRun) {
  const resultPath = resolveActiveRunPath(context, activeRun.resultPath);
  if (!existsSync(resultPath)) {
    return { kind: 'missing', resultPath };
  }

  let result;
  try {
    result = JSON.parse(readFileSync(resultPath, 'utf8').trim());
  } catch (error) {
    return { kind: 'invalid', reason: `result JSON is invalid: ${error.message}`, resultPath };
  }

  if (!result || typeof result !== 'object') {
    return { kind: 'invalid', reason: 'result JSON is not an object', resultPath };
  }

  const maybeResult = /** @type {Record<string, unknown>} */ (result);
  if (maybeResult.result !== 'issue_done' && maybeResult.result !== 'blocked') {
    return {
      kind: 'invalid',
      reason: `result is not recoverable: ${String(maybeResult.result)}`,
      resultPath,
    };
  }

  return { kind: 'recoverable', result, resultPath };
}

function resolveActiveRunPath(context, markerPath) {
  if (markerPath.startsWith('/')) {
    return markerPath;
  }

  return resolve(context.repoRoot, markerPath);
}

function formatActiveRunResultStatus(resultStatus) {
  if (resultStatus.kind === 'missing') {
    return `result file is missing at ${posixPath(relative(process.cwd(), resultStatus.resultPath))}`;
  }

  if (resultStatus.kind === 'invalid') {
    return resultStatus.reason;
  }

  return `recoverable result exists at ${posixPath(relative(process.cwd(), resultStatus.resultPath))}`;
}

function buildPlan(context) {
  const issues = readIssues(context);
  const errors = [...collectIssueMetadataErrors(issues), ...resolveBlockers(context, issues)];
  const skipped = [];
  let selected;

  for (const issue of issues) {
    const reasons = skipReasons(issue);

    if (errors.length === 0 && reasons.length === 0 && !selected) {
      selected = issue;
      continue;
    }

    skipped.push({
      issue,
      reasons:
        reasons.length === 0
          ? [
              errors.length === 0
                ? 'another lower-numbered issue is selected first'
                : 'issue planning errors must be fixed first',
            ]
          : reasons,
    });
  }

  return {
    errors,
    issues,
    selected,
    skipped,
  };
}

function readIssues(context) {
  return readdirSync(context.issuesDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b))
    .map(file => {
      const absPath = join(context.issuesDir, file);
      const content = readFileSync(absPath, 'utf8');
      const stem = basename(file, '.md');
      const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? stem;
      const status = content.match(/^Status:\s*(.+?)\s*$/m)?.[1]?.trim() ?? '';
      const explicitAgentState = content.match(/^Agent state:\s*(.+?)\s*$/m)?.[1]?.trim();
      const agentState = (explicitAgentState ?? 'pending').toLowerCase();
      const workflow = parseAgentWorkflow(content, posixPath(relative(context.repoRoot, absPath)));

      return {
        absPath,
        acceptanceCriteria: parseAcceptanceCriteria(content),
        agentState,
        blockerErrors: [],
        blockerRefs: parseBlockedBy(content),
        blockers: [],
        content,
        file,
        relPath: posixPath(relative(context.repoRoot, absPath)),
        stem,
        status,
        title,
        workflow: workflow.value,
        workflowErrors: workflow.errors,
      };
    });
}

function parseAgentWorkflow(content, relPath = 'issue') {
  const matches = [...content.matchAll(/^Workflow:\s*(.*?)\s*$/gm)];

  if (matches.length === 0) {
    return {
      errors: [],
      value: DEFAULT_AGENT_WORKFLOW,
    };
  }

  const rawValue = matches[0][1].trim();
  const value = rawValue.toLowerCase();
  const errors = [];

  if (matches.length > 1) {
    errors.push(`${relPath} has multiple Workflow lines`);
  }

  if (!rawValue) {
    errors.push(`${relPath} has empty Workflow value`);
  } else if (!AGENT_WORKFLOWS.has(value)) {
    errors.push(`${relPath} has unknown Workflow: ${rawValue}`);
  }

  return {
    errors,
    value: AGENT_WORKFLOWS.has(value) ? value : DEFAULT_AGENT_WORKFLOW,
  };
}

function collectIssueMetadataErrors(issues) {
  return issues.flatMap(issue => issue.workflowErrors);
}

function parseBlockedBy(content) {
  const section = readMarkdownSection(content, 'Blocked by');

  if (!section) {
    return [];
  }

  const refs = [];

  for (const line of section.split(/\r?\n/)) {
    const cleaned = line
      .trim()
      .replace(/^[-*]\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim();

    if (!cleaned || /^none\b/i.test(cleaned)) {
      continue;
    }

    refs.push(cleaned.replace(/^`|`$/g, ''));
  }

  return refs;
}

function parseAcceptanceCriteria(content) {
  const section = readMarkdownSection(content, 'Acceptance criteria');

  if (!section) {
    return [];
  }

  return section
    .split(/\r?\n/)
    .map(line => line.match(/^\s*-\s+\[([ xX])\]\s+(.+)$/))
    .filter(Boolean)
    .map(match => ({
      checked: match[1].toLowerCase() === 'x',
      text: match[2],
    }));
}

function readMarkdownSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'i');
  const start = lines.findIndex(line => headingPattern.test(line));

  if (start === -1) {
    return '';
  }

  const sectionLines = [];

  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      break;
    }

    sectionLines.push(lines[index]);
  }

  return sectionLines.join('\n').trim();
}

function resolveBlockers(context, issues) {
  const errors = [];

  for (const issue of issues) {
    for (const ref of issue.blockerRefs) {
      const matches = findIssueMatches(context, issues, ref);

      if (matches.length === 0) {
        const message = `${issue.relPath} has unresolved blocker reference: ${ref}`;
        issue.blockerErrors.push(message);
        errors.push(message);
        continue;
      }

      if (matches.length > 1) {
        const message = `${issue.relPath} has ambiguous blocker reference: ${ref} (${matches
          .map(match => match.relPath)
          .join(', ')})`;
        issue.blockerErrors.push(message);
        errors.push(message);
        continue;
      }

      issue.blockers.push(matches[0]);
    }
  }

  return errors;
}

function findIssueMatches(context, issues, ref) {
  const normalizedRef = normalizeReference(ref);
  const normalizedRefWithoutMd = stripMd(normalizedRef);

  return issues.filter(issue => {
    const candidates = [
      posixPath(issue.absPath),
      issue.stem,
      issue.file,
      issue.relPath,
      posixPath(relative(context.featureDir, issue.absPath)),
      posixPath(relative(context.issuesDir, issue.absPath)),
    ];

    return candidates.some(candidate => {
      const normalizedCandidate = normalizeReference(candidate);
      return (
        normalizedCandidate === normalizedRef ||
        stripMd(normalizedCandidate) === normalizedRefWithoutMd
      );
    });
  });
}

function normalizeReference(ref) {
  return posixPath(ref.trim()).replace(/^\.\//, '');
}

function stripMd(ref) {
  return ref.endsWith('.md') ? ref.slice(0, -3) : ref;
}

function skipReasons(issue) {
  const reasons = [];
  const normalizedStatus = issue.status.toLowerCase();

  if (normalizedStatus !== 'ready-for-agent') {
    reasons.push(issue.status ? `Status is ${issue.status}` : 'Status is missing');
  }

  if (!AGENT_STATES.has(issue.agentState)) {
    reasons.push(`Agent state is invalid: ${issue.agentState}`);
  } else if (issue.agentState !== 'pending') {
    reasons.push(`Agent state is ${issue.agentState}`);
  }

  reasons.push(...issue.workflowErrors);
  reasons.push(...issue.blockerErrors);

  for (const blocker of issue.blockers) {
    if (blocker.agentState !== 'done') {
      reasons.push(`blocked by ${blocker.relPath} (Agent state: ${blocker.agentState})`);
    }
  }

  return reasons;
}

function printDryRun(context, branch, worktreeStatus, plan, activeRun) {
  printLine('codex-issue-loop dry run');
  printLine(`Feature: ${posixPath(relative(context.repoRoot, context.featureDir))}`);
  printLine(`Branch: ${branch || '(detached HEAD)'}`);
  printLine(
    `Worktree: ${
      worktreeStatus.trim()
        ? activeRun
          ? 'dirty (real run may recover or require --resume-active-run)'
          : 'dirty (real run would fail)'
        : 'clean'
    }`,
  );
  printLine(`Active run: ${activeRun ? activeRun.issue : 'none'}`);
  printLine(`Max issues: ${context.options.max}`);
  printLine(`Timeout: ${context.options.timeoutMinutes} minutes`);
  printLine(
    `Baseline checks: ${context.options.skipBaselineChecks ? 'skipped' : CHECKS.map(formatCommand).join(', ')}`,
  );

  if (branch === 'main' && !context.options.allowMain) {
    printLine('Main branch guard: real run would require --allow-main');
  }

  if (plan.errors.length > 0) {
    printLine('\nIssue planning errors:');
    for (const error of plan.errors) {
      printLine(`- ${error}`);
    }
  }

  printLine('\nSelected issue:');
  if (plan.selected) {
    printLine(
      `- ${plan.selected.relPath}: ${plan.selected.title} (Workflow: ${plan.selected.workflow})`,
    );
  } else {
    printLine('- none');
  }

  if (plan.skipped.length > 0) {
    printLine('\nSkipped issues:');
    for (const skipped of plan.skipped) {
      printLine(`- ${skipped.issue.relPath}: ${skipped.reasons.join('; ')}`);
    }
  }

  if (plan.selected) {
    const logDir = posixPath(join(context.featureDir, '.codex-issue-loop'));
    const command = [
      'codex',
      '-a',
      'never',
      'exec',
      '-C',
      context.repoRoot,
      '-s',
      'workspace-write',
      '--output-schema',
      `${logDir}/result-schema.json`,
      '--output-last-message',
      `${logDir}/result-<timestamp>.json`,
      '<prompt>',
    ];

    printLine('\nCodex command:');
    printLine(command.map(shellQuote).join(' '));
  }
}

function printNoEligibleIssues(plan) {
  printLine('No eligible issues.');

  if (plan.skipped.length > 0) {
    printLine('Skipped issues:');
    for (const skipped of plan.skipped) {
      printLine(`- ${skipped.issue.relPath}: ${skipped.reasons.join('; ')}`);
    }
  }
}

async function runIssue(context, issue, iteration, runOptions = {}) {
  const beforeHead = capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
  const startedAt = new Date().toISOString();
  const timestamp = startedAt.replace(/[:.]/g, '-');
  const logDir = join(context.featureDir, '.codex-issue-loop');
  const schemaPath = join(logDir, 'result-schema.json');
  const resultPath = join(logDir, `result-${timestamp}.json`);
  const transcriptPath = join(logDir, `codex-${timestamp}.log`);
  const timeoutMs = context.options.timeoutMinutes * 60 * 1000;

  mkdirSync(logDir, { recursive: true });
  writeFileSync(schemaPath, `${JSON.stringify(RESULT_SCHEMA, null, 2)}\n`);
  writeActiveRunMarker(context, {
    issue: issue.relPath,
    resultPath: posixPath(relative(context.repoRoot, resultPath)),
    transcriptPath: posixPath(relative(context.repoRoot, transcriptPath)),
    beforeHead,
    startedAt,
  });

  printLine(
    `\n[${iteration}/${context.options.max}] ${
      runOptions.resume ? 'Resuming' : 'Running'
    } Codex for ${issue.relPath}`,
  );

  const prompt = buildPrompt(issue, { resume: runOptions.resume });
  const codexArgs = [
    '-a',
    'never',
    'exec',
    '-C',
    context.repoRoot,
    '-s',
    'workspace-write',
    '--output-schema',
    schemaPath,
    '--output-last-message',
    resultPath,
    prompt,
  ];

  const codexResult = await runProcess('codex', codexArgs, {
    cwd: context.repoRoot,
    label: 'codex exec',
    logPath: transcriptPath,
    timeoutMs,
  });

  if (codexResult.timedOut) {
    throw new Error(
      `Codex timed out after ${context.options.timeoutMinutes} minutes. Rerun normally to recover a completed active run, or use --resume-active-run to continue partial changes for the same issue.`,
    );
  }

  const result = readAgentResult(resultPath);
  await processAgentResult(context, issue, result, {
    beforeHead,
    clearActiveRun: true,
  });
}

async function processAgentResult(context, issue, result, options) {
  const afterHead = capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
  const currentIssues = readIssues(context);
  resolveBlockers(context, currentIssues);
  const currentIssue = currentIssues.find(candidate => candidate.relPath === issue.relPath);

  if (!currentIssue) {
    throw new Error(`selected issue disappeared after Codex run: ${issue.relPath}`);
  }

  validateAgentResult(context, issue, currentIssues, result);

  if (result.result === 'complete') {
    throw new Error('agent returned complete even though the wrapper selected an issue');
  }

  let commitHash;
  if (afterHead !== options.beforeHead) {
    validateCommitHash(result.commit, afterHead);
    assertCleanWorktree(context.repoRoot, 'agent left uncommitted changes after its commit');
    commitHash = afterHead;
  }

  if (result.result === 'issue_done') {
    validateCompletedIssue(currentIssue);
    if (!commitHash) {
      commitHash = createCompletedIssueCommit(context, issue, result.commitSubject);
    }
    await runChecks(context.repoRoot, 'post-commit');
    assertCleanWorktree(context.repoRoot, 'post-commit checks left uncommitted changes');
    if (options.clearActiveRun) {
      clearActiveRunMarker(context);
    }
    printLine(`Completed ${issue.relPath} in ${shortHash(commitHash)}`);
    return;
  }

  if (result.result === 'blocked') {
    validateBlockedIssueState(currentIssue);
    if (commitHash) {
      validateBlockedCommit(context, currentIssue);
      if (options.clearActiveRun) {
        clearActiveRunMarker(context);
      }
      printLine(`Marked ${issue.relPath} blocked in ${shortHash(commitHash)}`);
      return;
    }

    commitHash = createBlockedIssueCommitIfNeeded(context, currentIssue, result.commitSubject);
    if (options.clearActiveRun) {
      clearActiveRunMarker(context);
    }
    if (commitHash) {
      printLine(`Marked ${issue.relPath} blocked in ${shortHash(commitHash)}`);
    } else {
      printLine(`Marked ${issue.relPath} blocked without a git commit`);
    }
    return;
  }

  throw new Error(`unsupported agent result: ${result.result}`);
}

function buildPrompt(issue, options = {}) {
  const readBeforeEditing = [
    'AGENTS.md',
    'docs/agents/issue-tracker.md',
    ...(issue.workflow === 'tdd' ? ['.agents/skills/tdd/SKILL.md'] : []),
    issue.relPath,
  ];
  const workflowInstruction = workflowPromptInstruction(issue.workflow);
  const resumeInstruction = options.resume
    ? `You are resuming a previous timed-out issue-loop run for this exact issue.
- Inspect the current uncommitted changes before editing.
- Preserve useful partial work, finish the issue, and still return the normal JSON result.
- If the partial changes are unrelated or unsafe, mark the issue blocked instead of guessing.`
    : '';

  return `Run one Codex issue-loop iteration for this repo.

${resumeInstruction ? `${resumeInstruction}\n` : ''}

Read before editing:
${readBeforeEditing.map(item => `- ${item}`).join('\n')}

Implement exactly this issue and no other issue:
${issue.relPath}

${workflowInstruction}

Before returning a completed issue, run the full gates with capped failure output so passing checks do not fill the model context:
- npm run types > /tmp/codex-types.log 2>&1 || (tail -120 /tmp/codex-types.log && false)
- npm test > /tmp/codex-test.log 2>&1 || (tail -120 /tmp/codex-test.log && false)
- npm run lint > /tmp/codex-lint.log 2>&1 || (tail -120 /tmp/codex-lint.log && false)

If a Wireit-backed check reports that it skipped work because the cache is valid, treat that as a passing check.

If a capped check fails, inspect only the relevant log excerpts needed to fix it. Do not paste full check logs into issue notes or the final JSON summary.

If the issue is completed:
- Set or update "Agent state: done" in ${issue.relPath}.
- Check every completed acceptance criterion in ${issue.relPath}.
- Append a concise "## Agent Run Notes" entry with the change and check summary. Do not include a commit hash because the wrapper creates the commit after your run.
- Leave all changes uncommitted. Do not run git add or git commit; the issue-loop wrapper owns git commits because this Codex process may not be able to write to .git.
- Choose a commitSubject that follows AGENTS.md commit message rules, such as "fix(parser): handle empty config". Describe the implementation change, not the issue-loop mechanics.
- Return a JSON result with "result": "issue_done".

If the issue cannot be completed:
- Do not wait for interaction.
- Revert or avoid partial implementation changes.
- Set "Agent state: blocked" in ${issue.relPath}.
- Update "Status:" to "needs-info" or "ready-for-human" only if the blocker changes delegability.
- Append a precise "## Agent Run Notes" entry explaining the blocker and commands run.
- Leave all changes uncommitted. Do not run git add or git commit; the issue-loop wrapper owns git commits because this Codex process may not be able to write to .git.
- Use a commitSubject like "chore(issue-loop): block <short reason>" if the wrapper needs to commit issue-tracker notes.
- Return a JSON result with "result": "blocked".

Use "result": "complete" only if there is truly no selected work to do.

The final response must be JSON matching the provided output schema. Include:
- result: "issue_done", "blocked", or "complete"
- issue: "${issue.relPath}"
- commit: null, unless a commit already existed before these instructions were followed
- commitSubject: mini Conventional Commit subject, for example "docs(setup): clarify build command"
- summary: one concise sentence`;
}

function workflowPromptInstruction(workflow) {
  if (workflow === 'content') {
    return 'Use the content workflow: implement the requested docs, website, examples, navigation, or static content changes directly. Do not force a red-green-refactor loop. Add or update tests only when they protect executable behavior or prevent a meaningful regression. Run relevant content-specific checks for the touched surface and issue acceptance criteria, such as a docs build, preview build, link/path inspection, or screenshot when visual layout is affected. Do not modify Agent state for other issues.';
  }

  return 'Use the TDD skill workflow: add one behavior test, implement the minimum code to pass it, repeat as needed, then refactor only while tests are green. Keep tests focused on public behavior. Do not modify Agent state for other issues.';
}

function readAgentResult(resultPath) {
  if (!existsSync(resultPath)) {
    throw new Error(`Codex did not write result file: ${resultPath}`);
  }

  const raw = readFileSync(resultPath, 'utf8').trim();

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Codex result was not valid JSON: ${error.message}`, { cause: error });
  }
}

function validateAgentResult(context, selectedIssue, currentIssues, result) {
  if (!result || typeof result !== 'object') {
    throw new Error('Codex result must be an object');
  }

  if (!['issue_done', 'blocked', 'complete'].includes(result.result)) {
    throw new Error(`invalid Codex result: ${result.result}`);
  }

  if (typeof result.issue !== 'string') {
    throw new Error('Codex result is missing issue path');
  }

  if (result.commit !== null && typeof result.commit !== 'string') {
    throw new Error('Codex result commit must be a string or null');
  }

  if (result.result !== 'complete') {
    validateCommitSubject(result.commitSubject);
  }

  if (typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('Codex result is missing summary');
  }

  const matches = findIssueMatches(context, currentIssues, result.issue);

  if (!matches.some(issue => issue.relPath === selectedIssue.relPath)) {
    throw new Error(
      `Codex result issue does not match selected issue: expected ${selectedIssue.relPath}, got ${result.issue}`,
    );
  }
}

function validateCommitHash(resultCommit, actualHead) {
  if (!resultCommit || typeof resultCommit !== 'string') {
    throw new Error('Codex result did not include a commit hash');
  }

  if (!actualHead.startsWith(resultCommit)) {
    throw new Error(`Codex result commit ${resultCommit} does not match HEAD ${actualHead}`);
  }
}

function validateCompletedIssue(issue) {
  if (issue.agentState !== 'done') {
    throw new Error(`${issue.relPath} is not marked Agent state: done`);
  }

  if (issue.acceptanceCriteria.length === 0) {
    throw new Error(`${issue.relPath} has no acceptance criteria to verify`);
  }

  const unchecked = issue.acceptanceCriteria.filter(item => !item.checked);

  if (unchecked.length > 0) {
    throw new Error(
      `${issue.relPath} still has unchecked acceptance criteria: ${unchecked
        .map(item => item.text)
        .join('; ')}`,
    );
  }
}

function validateBlockedIssueState(issue) {
  if (issue.agentState !== 'blocked') {
    throw new Error(`${issue.relPath} is not marked Agent state: blocked`);
  }
}

function validateBlockedCommit(context, issue) {
  const changedFiles = capture(
    'git',
    ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'],
    context.repoRoot,
  )
    .split(/\r?\n/)
    .filter(Boolean)
    .map(posixPath);

  if (changedFiles.length !== 1 || changedFiles[0] !== issue.relPath) {
    throw new Error(
      `blocked commits must update only ${issue.relPath}; HEAD changed: ${
        changedFiles.length > 0 ? changedFiles.join(', ') : '(no files)'
      }`,
    );
  }
}

function createCompletedIssueCommit(context, issue, commitSubject) {
  const statusEntries = gitStatusEntries(context.repoRoot);

  if (statusEntries.length === 0) {
    throw new Error('agent reported issue_done without tracked changes to commit');
  }

  capture('git', ['add', '--all'], context.repoRoot);
  assertStagedChanges(context.repoRoot, 'completed issue has no staged changes');
  capture('git', ['commit', '-m', commitSubject], context.repoRoot);
  return capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
}

function createBlockedIssueCommitIfNeeded(context, issue, commitSubject) {
  const statusEntries = gitStatusEntries(context.repoRoot);

  if (statusEntries.length === 0) {
    return undefined;
  }

  const unexpected = statusEntries.filter(entry => entry.path !== issue.relPath);
  if (unexpected.length > 0) {
    throw new Error(
      `blocked result left tracked changes outside ${issue.relPath}: ${unexpected
        .map(entry => entry.path)
        .join(', ')}`,
    );
  }

  capture('git', ['add', '--', issue.relPath], context.repoRoot);
  assertStagedChanges(context.repoRoot, 'blocked issue has no staged changes');
  capture('git', ['commit', '-m', commitSubject], context.repoRoot);
  return capture('git', ['rev-parse', 'HEAD'], context.repoRoot).trim();
}

function validateCommitSubject(subject) {
  if (typeof subject !== 'string' || !subject.trim()) {
    throw new Error('Codex result is missing commitSubject');
  }

  if (subject !== subject.trim()) {
    throw new Error('Codex result commitSubject must not have leading or trailing whitespace');
  }

  if (subject.includes('\n')) {
    throw new Error('Codex result commitSubject must be a single line');
  }

  if (subject.endsWith('.')) {
    throw new Error('Codex result commitSubject must not end with a period');
  }

  if (!COMMIT_SUBJECT_PATTERN.test(subject)) {
    throw new Error(
      `Codex result commitSubject must match "<type>(<module>): <short message>" using one of: ${COMMIT_SUBJECT_TYPES.join(
        ', ',
      )}`,
    );
  }
}

function assertStagedChanges(repoRoot, message) {
  const staged = capture('git', ['diff', '--cached', '--name-only'], repoRoot);

  if (!staged.trim()) {
    throw new Error(message);
  }
}

function gitStatusEntries(repoRoot) {
  return capture('git', ['status', '--porcelain'], repoRoot)
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => ({
      path: posixPath(line.slice(3).trim()),
      status: line.slice(0, 2),
    }));
}

async function runChecks(repoRoot, label) {
  printLine(`\nRunning ${label} checks`);

  for (const [command, args] of CHECKS) {
    printLine(`$ ${formatCommand([command, args])}`);
    await runProcess(command, args, {
      cwd: repoRoot,
    });
  }
}

function assertCleanWorktree(repoRoot, message) {
  const status = capture('git', ['status', '--porcelain'], repoRoot);

  if (status.trim()) {
    throw new Error(`${message}:\n${status.trim()}`);
  }
}

function runProcess(command, args, options) {
  const stdio = options.logPath ? ['ignore', 'pipe', 'pipe'] : 'inherit';

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio,
    });

    let timedOut = false;
    let killTimer;
    let logStream;

    if (options.logPath) {
      logStream = createWriteStream(options.logPath, { flags: 'a' });

      child.stdout.on('data', chunk => {
        process.stdout.write(chunk);
        logStream.write(chunk);
      });

      child.stderr.on('data', chunk => {
        process.stderr.write(chunk);
        logStream.write(chunk);
      });
    }

    const timeout = options.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill('SIGTERM');
          killTimer = setTimeout(() => child.kill('SIGKILL'), 5_000);
        }, options.timeoutMs)
      : undefined;

    child.on('error', error => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (killTimer) {
        clearTimeout(killTimer);
      }
      if (logStream) {
        logStream.end();
      }
      reject(error);
    });

    child.on('close', (code, signal) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (killTimer) {
        clearTimeout(killTimer);
      }
      if (logStream) {
        logStream.end();
      }

      if (timedOut) {
        resolvePromise({
          code,
          signal,
          timedOut,
        });
        return;
      }

      if (code !== 0) {
        reject(
          new Error(
            `${options.label ?? formatCommand([command, args])} failed with exit code ${code}`,
          ),
        );
        return;
      }

      resolvePromise({
        code,
        signal,
        timedOut,
      });
    });
  });
}

function capture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${formatCommand([command, args])} failed: ${result.stderr.trim()}`);
  }

  return result.stdout;
}

function formatPlanErrors(errors) {
  return `issue planning errors:\n${errors.map(error => `- ${error}`).join('\n')}`;
}

function formatCommand(commandTuple) {
  const [command, args] = commandTuple;
  return [command, ...args].map(shellQuote).join(' ');
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

function posixPath(value) {
  return value.replaceAll('\\', '/');
}

function shortHash(hash) {
  return hash.slice(0, 7);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function printLine(value = '') {
  process.stdout.write(`${value}\n`);
}

export {
  buildPlan,
  buildPrompt,
  clearActiveRunMarker,
  parseAgentWorkflow,
  readActiveRunMarker,
  tryReadActiveRunResult,
  validateAgentResult,
  writeActiveRunMarker,
};
