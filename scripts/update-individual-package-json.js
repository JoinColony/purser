const path = require('path');
const chalk = require('chalk');
const findImports = require('find-imports');
var fs = require('fs');

const PATHS = require('./paths');

const { MODULES, FOLDERS, SUBFOLDERS } = PATHS;

const rootPackageFile = require(path.resolve('.', 'package.json'));
const corePackageFile = require(path.resolve(MODULES, 'purser-core', 'package.json'));

const PACKAGES = {
  BABEL_RUNTIME: '@babel/runtime',
  CORE: '@colony/purser-core',
  ETHERS: 'ethers',
};

const buildIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const sourceFolder = path.resolve(modulePath, FOLDERS.SOURCE);
  const cjsBuildFolder = path.resolve(modulePath, FOLDERS.BUILD);
  const esBuildFolder = path.resolve(cjsBuildFolder, SUBFOLDERS.ES_MODULES);
  const packageFilePath = path.resolve(modulePath, 'package.json');
  const packageFile = require(packageFilePath);
  const rawModuleDependencies = findImports(`${esBuildFolder}/**/*.js`, { flatten: true });
  const filteredModuleDependencies = rawModuleDependencies
    /*
     * Filter out babel runtime
     */
    .filter(packageName => !packageName.includes(PACKAGES.BABEL_RUNTIME))
    /*
     * Unify core ES module imports
     */
    .map(packageName => packageName.includes(PACKAGES.CORE) ? PACKAGES.CORE : packageName)
    /*
     * Unify ethers ES module imports
     */
    .map(packageName => packageName.includes(PACKAGES.ETHERS) ? PACKAGES.ETHERS : packageName)
    /*
     * Remove duplicates
     */
    .filter(
      (possibileDuplicate, index, packages) => packages.indexOf(possibileDuplicate) === index
    )
    /*
     * Sort packages alphabetically
     */
    .sort();
  const moduleDependencies = {};
  filteredModuleDependencies.map(dependency => {
    /*
     * @TODO Error catching
     * If a certain package is not available
     */
    if (dependency === PACKAGES.CORE) {
      return moduleDependencies[PACKAGES.CORE] = corePackageFile.version;
    }
    return moduleDependencies[dependency] = rootPackageFile.dependencies[dependency];
  });
  const updatedPackageFile = Object.assign(
    {},
    packageFile,
    {
      private: false,
      /*
       * Library entry points
       */
      main: 'lib/index.js',
      module: 'es/index.js',
      /*
       * Folders to include
       */
      files: [
        'es',
        'lib',
        'docs',
      ],
      /*
       * Add links to the monorepo and author/license
       */
      repository: rootPackageFile.repository,
      author: rootPackageFile.author,
      license: rootPackageFile.license,
      bugs: rootPackageFile.bugs,
      homepage: rootPackageFile.homepage,
      /*
       * Add dependencies object
       */
      dependencies: moduleDependencies,
    },
  );
  const jsonUpdatePackageFile = JSON.stringify(updatedPackageFile, null, '  ') + '\n';
  fs.writeFileSync(packageFilePath, jsonUpdatePackageFile, 'utf8');
};

module.exports = buildIndividualModule;
