# Contributing

We welcome all contributions to the Purser library!

Here are a few ways you can contribute:
- Extending the functionality by adding in support for other wallet types
- Testing existing wallet types on your own hardware or your system
- Maintaining and improving existing functionality by squashing bug that turn up, or by keeping the various wallets APIs in sync with they're upstream changes _(look for `help-wanted` and `good-first-issue` labels)_
- Finding bugs and submitting them to the [issues tracker](https://github.com/JoinColony/purser/issues).
- Maintaining, improving or fixing documentation pages in the [docs](https://docs.colony.io/purser/docs-overview).

If you plan to make a larger change, please consult with the team beforehand.

## How to report issues

To report an issue, use the [GitHub issues tracker](https://github.com/JoinColony/purser/issues).

## Workflow for Pull Requests

In order to contribute, please fork off of the `master` branch and make your changes there. Keep your branch up to date with master by using `rebase` instead of `merge`.

### Branch naming
Use the following naming schema for your PR branch: [feature/fix/maintenance/...]/[issue-#]-[a-meaningful-description-in-kebab-case] e.g. `feature/936-add-support-for-random-wallet`

### Commit messages
- The 60/80 rule. The first line should be capitalized and can go up to _(but not exceed)_ 60 chars, following lines should preferably be wrapped at around 80
- Bullet points are good, please use indentation though. For the bullet, you can choose between asterisks or hyphens
For the first line, try to be specific. e.g: "Ensure colony keys are unique" instead of "Fix a bug with contract setup"
If you're adding or changing existing tests, they should go on the same commit.

## Code of Conduct
Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.
