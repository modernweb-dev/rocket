# Security Policy

## Supported Versions

Rocket is in alpha. Security fixes target the latest published `0.1.x` release and the `main`
branch unless a release note says otherwise.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately through GitHub Security Advisories:

https://github.com/modernweb-dev/rocket/security/advisories/new

If GitHub advisories are unavailable, contact the maintainers through the Modern Web Discord and
request a private security contact. Do not open a public issue for an active vulnerability.

## Release Security

Maintainers should publish npm releases from GitHub Actions, not local machines. The release workflow
is configured for npm provenance. For npm trusted publishing, configure the `@rocket/js` package on
npm to trust this repository and `.github/workflows/release.yml` on the `main` branch.

Before public npm launch, maintainers should verify:

- npm organization 2FA is enabled for maintainers and publishers.
- npm trusted publishing is configured for the release workflow.
- The package page shows provenance for the published version.
- Release PRs keep `package-lock.json` synchronized with `package.json`.
- Dependency changes pass GitHub dependency review.
