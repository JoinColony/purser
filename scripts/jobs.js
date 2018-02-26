const run = require('./utils').run;
const paths = require('./paths');

const clean = message => run(`rm -rf ${paths.lib}`, {}, message);

const umd = message => run('webpack-cli', {}, message);

const umdMinified = message => run('webpack-cli --optimize-minimize', {}, message);

const esModules = message => run(`babel --out-dir ${paths.modules} ${paths.source}`, { BABEL_ENV: 'es' }, message);

const cjsModules = message => run(`babel --out-dir ${paths.lib} ${paths.source}`, { BABEL_ENV: 'cjs' }, message);

const flowTypes = message => run(`flow-copy-source --ignore "**/__tests__/**" ${paths.source} ${paths.modules}`, {}, message);

module.exports = {
  clean,
  umd,
  umdMinified,
  esModules,
  cjsModules,
  flowTypes,
};
