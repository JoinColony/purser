const path = require('path');

/*
 * Paths
 */

/*
 * Folders
 */
const source = path.resolve('.', 'src');
const lib = path.resolve('.', 'lib');
const modules = path.resolve(lib, 'es');
const umd = path.resolve(lib, 'umd');

/*
 * Files
 */
const files = {
  defaults: 'defaults.js',
  messages: 'messages.js',
}

/*
 * Glob patterns
 */
const globs = {
  tests: "**/__tests__/**",
  mocks: "**/__mocks__/**",
};


module.exports = {
  source,
  lib,
  modules,
  umd,
  globs,
  files,
};
