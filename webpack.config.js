const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const minimize = process.argv.indexOf('--optimize-minimize') !== -1;

console.log('are we minimizing?', minimize);

const plugins = minimize ? [new UglifyJsPlugin()] : [];

module.exports = {
  entry: './src/index.js',
  output: {
    filename: minimize ? 'colonyWallet.min.js' : 'colonyWallet.js',
    path: path.resolve(__dirname, 'lib/umd'),
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
