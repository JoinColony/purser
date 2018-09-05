const path = require('path');
const run = require('./utils').run;
const PATHS = require('./paths');

const { FOLDERS, MODULES } = PATHS;

/*
 * Build default, CommonJS pattern of the module
 */
const buildCommonJS = (source, destination, message) => run(
  `babel --out-dir ${destination} ${source}`,
  { BABEL_ENV: 'cjs' },
  message
);

const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const sourceFolder = path.resolve(modulePath, FOLDERS.SOURCE);
  const buildFolder = path.resolve(modulePath, FOLDERS.BUILD);
  buildCommonJS(
    sourceFolder,
    buildFolder,
    `Building CommonJS module for package @colony/${moduleName}`,
  );
};

module.exports = buildIndividualModule;
