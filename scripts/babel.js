const BABEL_ENV = process.env.BABEL_ENV

module.exports = {
  presets: [
    ['env', { modules: BABEL_ENV != undefined && BABEL_ENV !== 'cjs' ? false : 'commonjs' }],
    'flow',
  ],
  plugins: [
    ['transform-runtime', { polyfill: false, regenerator: true }]
  ],
  env: {
    test: {
      presets: ['env', 'flow'],
      plugins: ['dynamic-import-node']
    }
  },
  ignore: [
    '__tests__'
  ]
};
