const path = require('path');
const run = require('./utils').run;
const PATHS = require('./paths');

const { FOLDERS, MODULES } = PATHS;

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



const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const sourceFolder = path.resolve(modulePath, FOLDERS.SOURCE);
  const buildFolder = path.resolve(modulePath, FOLDERS.BUILD);
  /*
   * @NOTE The build step is silent
   * It won't output anyhting
   */
  squeakyClean(buildFolder);
  /*
   * Build CommonJS
   */
  buildCommonJS(
    sourceFolder,
    buildFolder,
    `Building CommonJS module for package @colony/${moduleName}`,
  );
};

module.exports = buildIndividualModule;
