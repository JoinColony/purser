/*
 * @NOTE On using of project-wide `babel.config.js`
 * This file was renamed from `.babelrc` to `babel.config.js` because of an edge case in the new 7.x
 * Babel that would prevent configs from being applied.
 *
 * See: https://babeljs.io/docs/en/config-files#6x-vs-7x-babelrc-loading
 */
const babelConfig = {
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    [
      'transform-inline-environment-variables',
      {
        include: ['NODE_ENV'],
      },
    ],
  ],
  presets: [
    '@babel/preset-env',
    '@babel/preset-flow',
  ],
  env: {
    es: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
        '@babel/preset-flow',
      ],
    },
    cjs: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-flow',
      ],
    },
    test: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-flow',
      ],
      plugins: [
        'dynamic-import-node',
      ],
      ignore: null,
    }
  }
};

module.exports = babel => {
  babel.cache.never();
  return babelConfig;
};
