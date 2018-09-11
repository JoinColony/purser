![purser](https://github.com/JoinColony/purser/blob/master/.assets/purser_200.svg)

## Purser

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/colony-wallet.svg?token=114044dbcad9f33395dffb9087c3e665bf5862cf49f66dd9d03d808663aa72bc&ts=1518703816619)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/JoinColony/colony-wallet/tree/master.svg?style=shield&circle-token=b465d9d46f98d87d322ef5fe438dd3aa4936cc80)](https://circleci.com/gh/JoinColony/colony-wallet/tree/master)

Monorepo for the Purser collection of ethereum wallet libraries:
- [`purser-core`](https://github.com/JoinColony/purser/blob/master/modules/node_modules/@colony/purser-core): A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual purser modules.
- [`purser-ledger`](https://github.com/JoinColony/purser/blob/master/modules/node_modules/@colony/purser-ledger): A `javascript` library to interact with a [Ledger](https://www.ledger.com/) based ethereum wallet.
- [`purser-metamask`](https://github.com/JoinColony/purser/blob/master/modules/node_modules/@colony/purser-metamask): A `javascript` library to interact with the a [Metamask](https://metamask.io/) based ethereum wallet.
- [`purser-software`](https://github.com/JoinColony/purser/blob/master/modules/node_modules/@colony/purser-software): A `javascript` library to interact with a software ethereum wallet, based on the [ethers.js](https://github.com/ethers-io/ethers.js/) library.
- [`purser-trezor`](https://github.com/JoinColony/purser/blob/master/modules/node_modules/@colony/purser-trezor): A `javascript` library to interact with a [Trezor](https://trezor.io/) based ethereum wallet.


To learn more about Colony, you can visit [the website](https://colony.io/) or read the [white paper](https://colony.io/whitepaper.pdf).


### Documentation

Please see the [documentation](https://docs.colony.io/purser/) with detailed examples and explanations.

### Contributing

We welcome all contributions to Purser.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### Developing

This monorepo follows the [alle](https://github.com/boennemann/alle) monorepo management and publishing pattern.

All interactions with it are made through custom scripts and clever folder structures.

#### Building

Builds are handled internally by a script that outputs two versions of the modules. One that's in the `CommonJS` and one in `ES`.

This script is exposed via the `yarn build` command which will build each individual module in:
```bash
modules/node_modules/@colony/purser-<type>/lib
```

#### Linting code

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

#### Testing

`jest` is set up as the default test runner for this project.

You can run the following test commands that were set up as `npm` scripts:
- `yarn test` makes a simple pass and runs all the tests
- `yarn test:watch` will watch the source folder and re-run tests on file change

**A note on `jest`**

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

#### Continuous Integration

Circle CI handles this project's builds. It has two workflows set up: one for commit pushed, and one that it scheduled to run during the night.

The commit workflow will trigger every time you push to a branch. If that branch push was triggered by `greenkeeper` it will build it, and if it succeeds it will re-push with the updated `yarn` lockfile and build again.

The nightly build workflow will run every night at 4 AM and will build the latest changes added to the `master` branch.

#### Dependency Management

This project makes use of `greenkeeper` for dependency management.

If a new version of a package is found _(either public or private scoped)_ it will create a new branch with the package change and try to build it. If the build succeeds it will push changes to the `yarn` lockfile and re-build again.

When the builds succeeds one of two things will happen: if the package update was to a in-range version, the branch will be deleted _(this is by design, as the package will be updated to this version when you reinstall `node_modules`)_. If the package update was out of range _(or one of the two previous builds failed)_ than a PR will be created so that it can be reviewed and fixed.

### License

The purser monorepo and each individual purser library are [MIT licensed](LICENSE).
