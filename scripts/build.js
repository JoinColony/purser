const run = require('./utils').run;

run('rm -rf lib', {}, 'Removed the \'lib\' folder for a clean build');

run('webpack', {}, 'Built UMD package for browsers');

run('webpack --optimize-minimize', {}, 'Built minified UMD package for browsers');

run('babel --out-dir lib/es src', { BABEL_ENV: 'es' }, 'Built ES6 modules');

run('flow-copy-source --ignore "**/__tests__/**" src lib/es', {}, 'Exported Raw Flow types');

run('babel --out-dir lib src', { BABEL_ENV: 'cjs' }, 'Built CommonJS modules');
