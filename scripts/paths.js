const path = require('path');

/*
 * Paths
 */

/*
 * Folders
 */
// const source = path.resolve('.', 'src');
// const lib = path.resolve('.', 'lib');
// const modules = path.resolve(lib, 'es');
// const umd = path.resolve(lib, 'umd');
const MODULES = path.resolve('.', 'modules', 'node_modules', '@colony');

/*
 * Files
 */
// const files = {
//   defaults: 'defaults.js',
//   messages: 'messages.js',
// }

/*
 * Glob patterns
 */
// const globs = {
//   tests: "**/__tests__/**",
//   mocks: "**/__mocks__/**",
// };

/*
 * Folder names for individual modules
 */
const FOLDERS = {
  BUILD: 'lib',
  SOURCE: 'src',
};

const SUBFOLDERS = {
  ES_MODULES: 'es',
  UMD: 'umd',
};

module.exports = {
  MODULES,
  FOLDERS,
  SUBFOLDERS,
  // source,
  // lib,
  // modules,
  // umd,
  // globs,
  // files,
  // packages,
  // buildFolder,
  // sourceFolder,
};
