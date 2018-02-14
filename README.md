## Colony Wallet

A set of utilities to interface with ethereum addresses

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
