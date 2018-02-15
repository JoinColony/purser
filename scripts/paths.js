const path = require('path');

const source = path.resolve('.', 'src');
const lib = path.resolve('.', 'lib');
const modules = path.resolve('.', 'lib', 'es');
const umd = path.resolve('.', 'lib', 'umd');

module.exports = {
  source,
  lib,
  modules,
  umd,
};
