const path = require('path');
const run = require('./utils').run;
const webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
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

/*
 * @TODO Move webpack build logic into `utils`
 */
const buildUmd = (source, buildFolder, message, minimize = false) => {
  /*
   * @TODO Reduce wasted cycles
   * There's an argument here that it will be better to just pass down the module name instead
   * of reversing it from the folder's name...
   */
  const rootModulePath = path.resolve(source);
  const moduleName = path.basename(rootModulePath);
  const moduleFileName = camelCase(`colony-${moduleName}`);
  return webpack(
    {
      entry: [source],
      mode: BUILD_MODE,
      output: {
        filename: minimize ? `${moduleFileName}.min.js` : `${moduleFileName}.js`,
        path: buildFolder,
        library: moduleFileName,
        libraryTarget: 'umd',
        libraryExport: "default",
      },
      /*
       * @TODO Fix `alias` workaround
       *
       * This is to do with the fact that we 'build' the final packages file before publishing,
       * so webpack doesn't actually know where to import the `core` module from
       */
      resolve: {
        alias: {
          // '@colony/purser-core': path.resolve(MODULES, 'purser-core', 'src'),
        },
      },
      module: {
        rules: [
          {
            test: /\.js?$/,
            /*
             * Exclude JUST the top-level `node_modules`, otherwise our own folder
             * structure will also be excluded
             */
            exclude: path.resolve('.', 'node_modules'),
            use: {
              loader: 'babel-loader',
            },
          },
        ],
      },
      optimization: {
        minimize: minimize ? true : false,
      },
    },
    (err, stats) => {
      if (err || stats.hasErrors()) {
      // Handle errors here
      }
      console.log(message);
    },
  )
};

/*
 * Wrapper for the `buildUmd` so that we have a consistent message call signature
 */
const buildMinifiedUmd = (source, buildFolder, message) =>
  buildUmd(source, buildFolder, message, true);

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
  /*
   * Build UMD Modules
   */
  buildUmd(
    modulePath,
    umdBuildFolder,
    `Building ${chalk.green(
      'UMD Module'
    )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
      moduleName
    )}${chalk.white(' @ ')}${chalk.white.bold(
      packageFile.version
    )}`,
  );
  /*
   * Build Minified UMD Modules
   */
  buildMinifiedUmd(
    modulePath,
    umdBuildFolder,
    `Building ${chalk.green(
      'Minified UMD Module'
    )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
      moduleName
    )}${chalk.white(' @ ')}${chalk.white.bold(
      packageFile.version
    )}`,
  );
};

module.exports = buildIndividualModule;