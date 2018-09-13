## [@colony/](https://www.npmjs.com/org/colony)purser-core

A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual [purser](https://github.com/JoinColony/purser) modules.

Unless you want something specific found in this module, it doesn't need to be manually required as each module already makes use of it internally.

### Installation
```js
yarn add @colony/purser-core
```

### Quick Usage
```js
import { bigNumber } from '@colony/purser-core/utils'

const value = bigNumber('0.00000001').toWei();

console.log(value); // { negative: 0, words: Array(4), length: 4, red: null }
```

### Documentation

You can find more in-depth description for this module's API in the [purser docs](https://docs.colony.io/purser/modules-@colonypurser-core/).

### Contributing

This package is part of the [purser monorepo](https://github.com/JoinColony/purser) package.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The `purser-core` library along with the whole purser monorepo are [MIT licensed](https://github.com/JoinColony/purser/blob/master/LICENSE).
