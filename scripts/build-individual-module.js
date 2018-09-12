const path = require('path');
const run = require('./utils').run;
const camelCase = require('camelcase');
const chalk = require('chalk');

const PATHS = require('./paths');

const { FOLDERS, MODULES } = PATHS;

let BUILD_MODE = 'development';
if (process.env.NODE_ENV === 'production') {
  BUILD_MODE = 'production';
}

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

const exportFlowTypes = (source, buildFolder, message) => run(
  `flow-copy-source --ignore ${source}/${FOLDERS.CJS_MODULES} --ignore ${source}/${FOLDERS.ES_MODULES} ${source} ${buildFolder}`,
  {},
  message,
);

const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const cjsBuildFolder = path.resolve(modulePath, FOLDERS.CJS_MODULES);
  const esBuildFolder = path.resolve(modulePath, FOLDERS.ES_MODULES);
  const packageFile = require(`${modulePath}/package.json`);
  /*
   * @NOTE The build step is silent
   * It won't output anything
   */
  squeakyClean(cjsBuildFolder);
  squeakyClean(esBuildFolder);
  /*
   * Build CommonJS
   */
  buildCommonJS(
    modulePath,
    cjsBuildFolder,
    `Building ${chalk.green(
      'CommonJS Module'
    )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
      moduleName
    )}${chalk.white(' @ ')}${chalk.white.bold(
      packageFile.version
    )}`,
  );cjsBuildFolder
  /*
   * Build ES Modules
   */
  buildEs(
    modulePath,
    esBuildFolder,
    `Building ${chalk.green(
      'ES Module'
    )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
      moduleName
    )}${chalk.white(' @ ')}${chalk.white.bold(
      packageFile.version
    )}`,
  );
  /*
   * Flow types
   */
  exportFlowTypes(
    modulePath,
    esBuildFolder,
    `Exporting ${chalk.green(
      'Flow Types'
    )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
      moduleName
    )}${chalk.white(' @ ')}${chalk.white.bold(
      packageFile.version
    )}`,
  );
};

module.exports = buildIndividualModule;
