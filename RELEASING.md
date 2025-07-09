# Release Process

This project uses [Release Please Action](https://github.com/marketplace/actions/release-please-action) to manage the release process. Release Please simplifies the release workflow by analyzing commit messages, maintaining the CHANGELOG, and proposing version change pull requests.

## Commit Convention

For Release Please to correctly identify change types and automatically generate the changelog, all commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
<type>(<scope>): <subject>
```

Common `type` categories include:

* `feat`: New features or functionality
* `fix`: Bug fixes
* `docs`: Documentation changes only
* `style`: Changes that don't affect code meaning (whitespace, formatting, missing semicolons, etc.)
* `refactor`: Code changes that neither fix bugs nor add features
* `perf`: Code changes that improve performance
* `test`: Adding or correcting tests
* `build`: Changes that affect the build system or external dependencies (e.g., webpack, npm)
* `ci`: Changes to CI configuration files and scripts
* `chore`: Other changes that don't modify src or test files
* `revert`: Revert a previous commit

For changes that affect multiple packages, you can specify in the scope, for example: `feat(core,types): add new type definitions`

## Release Process

In the Release Please-based version management workflow, releases follow these steps:

1. Developers commit features or fixes to the main branch
2. When merged to the main branch, Release Please Action automatically creates or updates a "release PR"
3. This PR includes version updates, CHANGELOG updates, and will automatically create the corresponding GitHub Release when merged
4. CI will automatically publish the updated packages

## Configuration Files

This project's Release Please configuration uses the following two files:

* `release-please-config.json`: Defines version management strategy, release types, etc.
* `.release-please-manifest.json`: Tracks the current version of each package

## Manual Release Triggering

Typically, Release Please will automatically create or update a release PR after new commits that follow the conventional commit specification. If you need to trigger it manually:

1. Go to the GitHub repository's Actions page
2. Select the "Release Please" workflow
3. Click the "Run workflow" button, select the "main" branch, and execute

## Updating Major Version

If you need to release a major version update, you can use the following commit message format:

```
feat!: introduce incompatible API changes
```

or

```
feat(api)!: significant API design change
```

Commits marked with `!` will trigger a major version update.

## Prerelease Versions

For prerelease versions (such as beta, alpha, etc.), you can set the `prerelease` property to true in the `release-please-config.json` file and specify the `prerelease-type`:

```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "prerelease": true,
      "prerelease-type": "beta"
    }
  }
}
```

## Monorepo

For monorepos like this project, Release Please can manage versions for multiple packages. The `packages` section in the configuration file defines the version management strategy for each package.
