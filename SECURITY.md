# Security Policy

## Supported Versions

Rocket is in public alpha. Security fixes target the latest published `0.1.x` release and the
`main` branch unless a release note says otherwise.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately through GitHub Security Advisories:

https://github.com/modernweb-dev/rocket/security/advisories/new

If GitHub advisories are unavailable, contact the maintainers through the Modern Web Discord and
request a private security contact. Do not open a public issue for an active vulnerability.

## Release Security

Rocket's public alpha is the adoption status. npm is the release channel for `@rocket/js`.
Maintainers should publish npm releases from GitHub Actions, not local machines. The release workflow
is configured for trusted publishing and npm provenance. Published `@rocket/js` versions have
already been released through the trusted publisher, and the npm package is configured to require
two-factor authentication and disallow token-based publishing.

Before the public alpha announcement, maintainers should verify:

- README, docs, package metadata, roadmap, changelog, and release notes call Rocket a public alpha at
  the latest `0.1.x` version; avoid suggesting the already-published package is not yet available
  on npm.
- npm organization 2FA is enabled for maintainers and publishers.
- The `@rocket/js` npm package settings still show the GitHub Actions trusted publisher for
  `modernweb-dev/rocket`, `.github/workflows/release.yml`, and the `main` branch.
- The npm package publishing policy still requires 2FA and disallows token-based publishing; unused
  automation tokens are revoked.
- `.github/workflows/release.yml` keeps `id-token: write`, uses GitHub-hosted runners, disables the
  package-manager cache for release installs, and does not publish with `NPM_TOKEN` or
  `NODE_AUTH_TOKEN`.
- `package.json` has a public `repository.url` that matches the GitHub repository used by trusted
  publishing and provenance.
- Release PRs keep `package-lock.json` synchronized with `package.json`, include required
  changesets, and update changelog output.
- Dependency changes pass GitHub dependency review.
- `npm pack --dry-run` output contains only intended package files.
- The npm package page shows provenance for the latest published version; maintainers can also run
  `npm audit signatures` with the latest npm CLI from a project that installs `@rocket/js`.
