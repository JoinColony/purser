const path = require('path');
const run = require('./utils').run;
const PATHS = require('./paths');

const { FOLDERS, SUBFOLDERS, MODULES } = PATHS;

/*
 * Clean the build folder before building
 */
const squeakyClean = buildFolder => run(`rm -rf ${buildFolder}`, {}, false);

/*
 * Build default, CommonJS pattern of the module
 */
const buildCommonJS = (source, buildFolder, message) => run(
  `babel --out-dir ${buildFolder} ${source}`,
  { BABEL_ENV: 'cjs' },
  message
);

const buildEs = (source, buildFolder, message) => run(
  `babel --out-dir ${buildFolder} ${source}`,
  { BABEL_ENV: 'es' },
  message
);

const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const sourceFolder = path.resolve(modulePath, FOLDERS.SOURCE);
  const cjsBuildFolder = path.resolve(modulePath, FOLDERS.BUILD);
  const esBuildFolder = path.resolve(cjsBuildFolder, SUBFOLDERS.ES_MODULES);
  /*
   * @NOTE The build step is silent
   * It won't output anyhting
   */
  squeakyClean(cjsBuildFolder);
  /*
   * Build CommonJS
   */
  buildCommonJS(
    sourceFolder,
    cjsBuildFolder,
    `Building CommonJS Module for @colony/${moduleName}`,
  );
  /*
   * Build ES Modules
   */
  buildEs(
    sourceFolder,
    esBuildFolder,
    `Building ES Module for @colony/${moduleName}`,
  );
};

module.exports = buildIndividualModule;
