---
title: Development
section: Docs
order: 2
---

This monorepo follows the [alle](https://github.com/boennemann/alle) monorepo management and publishing pattern.

All interactions with it are made through custom scripts and clever folder structures.

#### Building

Builds are handled internally by a script that outputs two versions of the modules. One that's in the `CommonJS` and one in `ES`.

This script is exposed via the `npm run build` command which will build each individual module in:
```bash
modules/node_modules/@colony/purser-<type>/lib
```

#### ES Modules Build

All individual packages also export and ES Modules build _(along with Flow types)_. This is most likely to be used if you want to tree-shake your bundle.

To use them, just append `/es` to the end of the package name when importing:

```js
import software from '@core/purser-software/es';

await software.create();
```

Also, if you use [Flow](https://flow.org/) for type declarations inside your project, it will automatically pick up the required _(optional)_ arguments and they're expected type.

#### Linting code

It's most likely that you'll use `eslint` via your editor / IDE, but just in case you don't, there are a couple of scripts set up to do this manually:

```bash
npm run lint
```

This will lint all the files inside the `src` folder and log any errors or warnings.

```bash
npm run lint:fix
```

This script will lint files in the `src` directory and also try to fix any problems it encounters. _(Makes use of `prettier`)_

If there's a error it cannot fix, it will log it to the console.

#### Flow

This project makes use of the [`flow`](https://flow.org/) system of types declaration.

As above with `eslint` this project expects your editor or IDE to show you warning or errors in real-time. But if that's not an option you can do it manually:

```bash
npm run flow
```

Will check the `src` folder for any files using the `@flow` pragma _(It runs `flow status` under the hood)_ and it will also start the `flow` `daemon` if it isn't already running.

```bash
npm run glow
```

`glow` is just a wrapper for `flow` but with a nicer console output. Use this if you want to make sense of your `flow` errors.

```bash
npm run flow:check
```

This is left in as a legacy, in case `flow status` doesn't work on your system. This is slower and will not work with `glow` but you can be certain that it will parse all your files.

#### Commit Hooks

Committing changes to `git` will trigger two commit hooks that will ensure your code follows the coding style guidelines set forth by `eslint` and `prettier`.

The first check will run `eslint` with the `fix` instruction.

The second check will be `flow`, but using the `glow` output formatting.

After these two steps, the project will auto-run the `git add` command.

#### Testing

`jest` is set up as the default test runner for this project.

You can run the following test commands that were set up as `npm` scripts:
- `npm run test` makes a simple pass and runs all the tests
- `npm run test:watch` will watch the source folder and re-run tests on file change

**A note on `jest`**

You may run into trouble running `npm run test:watch`, which will throw and error along the lines of:

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

The commit workflow will trigger every time you push to a branch. If that branch push was triggered by `greenkeeper` it will build it, and if it succeeds it will re-push with the updated `npm run` lockfile and build again.

The nightly build workflow will run every night at 4 AM and will build the latest changes added to the `master` branch.

#### Dependency Management

This project makes use of `greenkeeper` for dependency management.

If a new version of a package is found _(either public or private scoped)_ it will create a new branch with the package change and try to build it. If the build succeeds it will push changes to the `npm run` lockfile and re-build again.

When the builds succeeds one of two things will happen: if the package update was to a in-range version, the branch will be deleted _(this is by design, as the package will be updated to this version when you reinstall `node_modules`)_. If the package update was out of range _(or one of the two previous builds failed)_ than a PR will be created so that it can be reviewed and fixed.
