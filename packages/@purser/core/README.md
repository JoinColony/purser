## [@purser/core](https://www.npmjs.com/package/@purser/core)

A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual [purser](https://github.com/JoinColony/purser) modules.

Unless you want something specific found in this module, it doesn't need to be manually required as each module already makes use of it internally.

### Installation
```shell
npm install @purser/core
```

(Usually you won't install this package just on its own. It's meant to be an accompanying peer-dependency to the other @purser modules)

### Quick Usage
```js
import { bigNumber } from '@purser/core/utils'

const value = bigNumber('0.00000001').toWei();

console.log(value); // { negative: 0, words: Array(4), length: 4, red: null }
```

### Documentation

You can find more in-depth description for this module's API in the [purser docs](https://joincolony.github.io/purser/modules/_purser_core.html).

### Contributing

This package is part of the [purser monorepo](https://github.com/JoinColony/purser) package.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The `@purser/core` library along with the whole purser monorepo are [MIT licensed](https://github.com/JoinColony/purser/blob/master/LICENSE).
