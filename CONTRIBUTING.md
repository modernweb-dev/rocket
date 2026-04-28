# Contributing

## Getting Started

> Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

First, create a fork of the [modernweb-dev/rocket](https://github.com/modernweb-dev/rocket) repository using the `Fork` button on GitHub.

Clone the upstream repository onto your computer.

```shell
git clone git@github.com:modernweb-dev/rocket.git
```

Once cloning is complete, change directory to the repository.

```shell
cd rocket
```

Now add your fork as a remote (replacing YOUR_USERNAME with your GitHub username).

```shell
git remote add fork git@github.com:<YOUR_USERNAME>/rocket.git
```

Create a new local branch.

```shell
git checkout -b my-awesome-fix
```

## Preparing Your Local Environment for Development

Rocket requires [Node.js](https://nodejs.org/) 22 or newer. After cloning the repository, install the locked dependencies.

```shell
npm ci
```

To run the documentation site locally:

```shell
npm start
```

## Making Your Changes

Make your changes in a focused branch. For code changes, keep tests close to the source file they cover.

### Type Checking

Run the TypeScript build before opening a pull request:

```shell
npm run types
```

### Running Tests

Run the Node test suite from the repository root:

```shell
npm test
```

### Linting and Formatting

Check linting and formatting before opening a pull request:

```shell
npm run lint
```

To apply automatic fixes:

```shell
npm run format
```

## Creating a Changeset

If you made changes for which you want to trigger a release, you need to create a changeset.
This documents your intent to release, and allows you to specify a message that will be put into the changelog.

[More information on changesets](https://github.com/atlassian/changesets)

Run

```shell
npm run changeset
```

Use the menu to select the package and release type. For the release type, we follow [Semantic Versioning](https://semver.org/), so please take a look if you're unfamiliar.

In short:

- A documentation change or similar chore usually does not require a release
- A bugfix requires a patch
- A new feature (feat) requires a minor
- A breaking change requires a major

Exceptions:

- For alpha (<1.0.0), bugfixes and feats are both patches, and breaking changes are allowed as minors.
- For release-candidate and other special cases, other rules may follow.

## Dependency and Lockfile Policy

Use `npm` and keep `package-lock.json` committed. When `package.json` changes, update the lockfile in
the same pull request. Do not switch package managers or add a second lockfile.

Dependency changes should be intentional and explained in the pull request. Prefer existing
dependencies and platform APIs before adding new runtime dependencies. Pull requests that change
dependencies are expected to pass dependency review in GitHub Actions.

## Security Reports

Please report suspected vulnerabilities through the process in [SECURITY.md](./SECURITY.md). Do not
open a public issue for an active vulnerability.

## Committing Your Changes

Commit messages must follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/)
using a short lowercase scope for the area you changed. For example:

```shell
fix(hydration): handle idle callback fallback
```

## Create a Pull Request

Now it's time to push your branch that contains your committed changes to your fork.

```shell
git push -u fork my-awesome-fix
```

After a successful push, if you visit your fork on GitHub, you should see a button that will allow you to create a Pull Request from your forked branch, to our main branch.
