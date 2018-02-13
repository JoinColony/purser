const BABEL_ENV = process.env.BABEL_ENV

module.exports = {
  presets: [
    ['env', { modules: BABEL_ENV != undefined && BABEL_ENV !== 'cjs' ? false : 'commonjs' }],
  ],
  plugins: [
    ['transform-runtime', { polyfill: false, regenerator: true }]
  ]
}
