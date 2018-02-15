const run = require('./utils').run;
const path = require('path');

const source = path.resolve('.', 'src');
const lib = path.resolve('.', 'lib');
const libModules = path.resolve('.', 'lib', 'es');

run(`rm -rf ${lib}`, {}, 'Removed the \'lib\' folder for a clean build');

run('webpack', {}, 'Built UMD package for browsers');

run('webpack --optimize-minimize', {}, 'Built minified UMD package for browsers');

run(`babel --out-dir ${libModules} ${source}`, { BABEL_ENV: 'es' }, 'Built ES6 modules');

run(`flow-copy-source --ignore "**/__tests__/**" ${source} ${libModules}`, {}, 'Exported Raw Flow types');

run(`babel --out-dir ${lib} ${source}`, { BABEL_ENV: 'cjs' }, 'Built CommonJS modules');
