## Colony Wallet

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/colony-wallet.svg?token=114044dbcad9f33395dffb9087c3e665bf5862cf49f66dd9d03d808663aa72bc&ts=1518703816619)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/JoinColony/colony-wallet/tree/master.svg?style=shield&circle-token=b465d9d46f98d87d322ef5fe438dd3aa4936cc80)](https://circleci.com/gh/JoinColony/colony-wallet/tree/master)

A set of utilities to interface with ethereum addresses

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
