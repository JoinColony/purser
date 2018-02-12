const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'unnamed-wallet-library.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'unnamedWalletLibrary',
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
};
