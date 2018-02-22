## Colony Wallet

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/colony-wallet.svg?token=114044dbcad9f33395dffb9087c3e665bf5862cf49f66dd9d03d808663aa72bc&ts=1518703816619)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/JoinColony/colony-wallet/tree/master.svg?style=shield&circle-token=b465d9d46f98d87d322ef5fe438dd3aa4936cc80)](https://circleci.com/gh/JoinColony/colony-wallet/tree/master)

A set of utilities to interface with ethereum addresses

### Usage

_To be added_

#### Quick start

_To be added_

### Builds

Building the project will output three versions of the library. You can either build it in _dev_ or _prod_ mode, the difference between then being with setting the `NODE_ENV` variable. This will determine the verbosity of the output and if the UMD build should have a minified version:

```bash
yarn build:dev
```

```bash
yarn build:prod
```

A UMD build to be used directly inside the browser as a script source _(both minified and un-minified versions)_. A `commonjs` modules build and an `es6` modules build.

The `es6` version will also bring over the `flow` types used for this project.

### Developing

If you want to actively work on the modules, there's a `yarn` task that will watch the `src` folder and rebuild files if they were changed:

```bash
yarn watch
```

This will just rebuild files, but not run any dev suites on them _(eg: `jest`, `eslint`, `flow`)_. That responsibility falls on you and your editor.

#### Eslint

It's most likely that you'll use `eslint` via your editor / IDE, but just in case you don't, there are a couple of scripts set up to do this manually:

```bash
yarn lint
```

This will lint all the files inside the `src` folder and log any errors or warnings.

```bash
yarn lint:fix
```

This will also lint files in the `src`, but in addition it will also try to fix any problems it encounters. _(Makes use of `prettier`)_

If there's a error it cannot fix, it will log it to the console.

#### Flow

This project makes use of the [`flow`](https://flow.org/) system of types declaration.

As above with `eslint` this project expects your editor or IDE to show you warning or errors in real-time. But if that's not an option you can do it manually.

```bash
yarn flow
```

Will check the `src` folder for any files using the `@flow` pragma _(It runs `flow status` under the hood)_ and it will also start the `flow` `daemon` if it isn't already.

```bash
yarn glow
```

It's just a wrapper for `flow` but with a nicer console output. Use this if you want to make sense of your `flow` errors.

```bash
yarn flow:check
```

This is left in as a legacy, in case `flow status` doesn't work on your system. This is slower and will not work with `glow` but you can be certain that it will parse all your files.

#### Commit Hooks

Committing changes to `git` will trigger two commit hooks that will ensure your code follows the coding style guidelines set forth by `eslint` and `prettier`.

First check will run `eslint` with the `fix` instruction, second check will be `flow`, but using the `glow` output formatting.

After these two steps, the project will auto-run the `git add` command.

### Testing

`jest` is set up as the default test runner for this project.

You can run the following test commands that were set up as `npm` scripts:
- `yarn test` makes a simple pass and runs all the tests
- `yarn test:watch` will watch the source folder and re-run tests on file change
- `yarn test:coverage` will output the test coverage of the project

#### Jest

You may run into trouble running `yarn test:watch`, which will throw and error along the lines of:

```bash
ENOSPC
```
This should mean that there's no space left on the target, but it this case it actually means your system is using too many file watchers.
This can be fixed by increasing that number _(warning: `sudo` permissions required for this, as we change system settings)_:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

[More info on the fix from jest#3254](https://github.com/facebook/jest/issues/3254#issuecomment-297214395)

### Continuous Integration

Circle CI handles this project's builds. It has two workflows set up: one for commit pushed, and one that it scheduled to run during the night.

The commit workflow will trigger every time you push to a branch. If that branch push was triggered by `greenkeeper` it will build it, and if it succeeds it will re-push with the updated `yarn` lockfile and build again.

The nightly build workflow will run every night at 4 AM and will build the latest changes added to the `master` branch.

### Dependency Management

This project makes use of `greenkeeper` for dependency management.

If a new version of a package is found _(either public or private scoped)_ it will create a new branch with the package change and try to build it. If the build succeeds it will push changes to the `yarn` lockfile and re-build again.

When the builds succeeds one of two things will happen: if the package update was to a in-range version, the branch will be deleted _(this is by design, as the package will be updated to this version when you reinstall `node_modules`)_. If the package update was out of range _(or one of the two previous builds failed)_ than a PR will be created so that it can be reviewed and fixed.
