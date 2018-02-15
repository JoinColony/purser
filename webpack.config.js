const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const paths = require('./scripts/paths');

const minimize = process.argv.indexOf('--optimize-minimize') !== -1;
const plugins = minimize ? [new UglifyJsPlugin()] : [];

module.exports = {
  entry: './src/index.js',
  output: {
    filename: minimize ? 'colonyWallet.min.js' : 'colonyWallet.js',
    path: paths.umd,
    library: 'colonyWallet',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins,
};
