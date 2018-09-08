const path = require('path');

/*
 * Paths
 */

const MODULES = path.resolve('.', 'modules', 'node_modules', '@colony');

const FOLDERS = {
  BUILD: 'lib',
  SOURCE: 'src',
  DOCS: 'docs',
};

const SUBFOLDERS = {
  ES_MODULES: 'es',
  UMD: 'umd',
};

const FILES = {
  LICENSE: 'LICENSE',
};

module.exports = {
  MODULES,
  FOLDERS,
  FILES,
  SUBFOLDERS,
};
