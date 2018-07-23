const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const paths = require('./scripts/paths');

let mode = 'development';

if (process.env.NODE_ENV === 'production') {
  mode = 'production';
}

const minimize = process.argv.indexOf('--optimize-minimize') !== -1;

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  mode,
  output: {
    filename: minimize ? 'colonyWallet.min.js' : 'colonyWallet.js',
    path: paths.umd,
    library: 'colonyWallet',
    libraryTarget: 'umd',
    libraryExport: "default",
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
  optimization: {
    minimize: minimize ? true : false,
  },
};
