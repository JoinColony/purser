const path = require('path');

/*
 * Paths
 */

const MODULES = path.resolve('.', 'modules', 'node_modules', '@colony');

const FOLDERS = {
  SOURCE: 'src',
  DOCS: 'docs',
  CJS_MODULES: 'lib',
  ES_MODULES: 'es',
};

const FILES = {
  LICENSE: 'LICENSE',
  README: 'README.md',
  PACKAGE: 'package.json'
};

module.exports = {
  MODULES,
  FOLDERS,
  FILES,
};
