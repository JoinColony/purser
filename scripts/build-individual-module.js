const path = require('path');
const run = require('./utils').run;
const camelCase = require('camelcase');
const chalk = require('chalk');

const PATHS = require('./paths');

const { FOLDERS, SUBFOLDERS, MODULES } = PATHS;

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

const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const cjsBuildFolder = path.resolve(modulePath, FOLDERS.BUILD);
  const esBuildFolder = path.resolve(cjsBuildFolder, SUBFOLDERS.ES_MODULES);
  const umdBuildFolder = path.resolve(cjsBuildFolder, SUBFOLDERS.UMD);
  const packageFile = require(`${modulePath}/package.json`);
  /*
   * @NOTE The build step is silent
   * It won't output anything
   */
  squeakyClean(cjsBuildFolder);
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
  );
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
};

module.exports = buildIndividualModule;
