## Colony Wallet

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/colony-wallet.svg?token=114044dbcad9f33395dffb9087c3e665bf5862cf49f66dd9d03d808663aa72bc&ts=1518703816619)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/JoinColony/colony-wallet/tree/master.svg?style=shield&circle-token=b465d9d46f98d87d322ef5fe438dd3aa4936cc80)](https://circleci.com/gh/JoinColony/colony-wallet/tree/master)

A set of utilities to interface with ethereum addresses

### Developing

If you want to actively work on the modules, there's a `yarn` task that will watch the `src` folder and rebuild files if they were changed:

```bash
yarn watch
```

This will just rebuild files, but not run any dev suites on them _(eg: jest, eslint, flow)_. That responsibility falls on you and your editor.

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
