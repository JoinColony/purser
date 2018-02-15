const run = require('./utils').run;
const paths = require('./paths');

run(`rm -rf ${paths.lib}`, {}, 'Removed the \'lib\' folder for a clean build');

run('webpack', {}, 'Built UMD package for browsers');

run('webpack --optimize-minimize', {}, 'Built minified UMD package for browsers');

run(`babel --out-dir ${paths.modules} ${paths.source}`, { BABEL_ENV: 'es' }, 'Built ES6 modules');

run(`flow-copy-source --ignore "**/__tests__/**" ${paths.source} ${paths.modules}`, {}, 'Exported Raw Flow types');

run(`babel --out-dir ${paths.lib} ${paths.source}`, { BABEL_ENV: 'cjs' }, 'Built CommonJS modules');
