const fs = require('fs-extra');
const path = require('path');

const PATHS = require('./paths');

const { FOLDERS, MODULES, FILES } = PATHS;

const populateIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  /*
   * Copy over the docs folder
   */
  const docsSourcePath = path.resolve('.', FOLDERS.DOCS);
  const docsDestPath = path.resolve(modulePath, FOLDERS.CJS_MODULES, FOLDERS.DOCS);
  await fs.copy(docsSourcePath, docsDestPath);
  /*
   * Copy over the license file
   */
  const licenseSourcePath = path.resolve('.', FILES.LICENSE);
  const licenseDestPath = path.resolve(modulePath, FOLDERS.CJS_MODULES, FILES.LICENSE);
  await fs.copy(licenseSourcePath, licenseDestPath);
  /*
   * Copy over the readme file
   */
   const readmeSourcePath = path.resolve(modulePath, FILES.README);
   const readmeDestPath = path.resolve(modulePath, FOLDERS.CJS_MODULES, FILES.README);
   await fs.copy(readmeSourcePath, readmeDestPath);
   /*
    * Copy over the package json file
    */
    const packageSourcePath = path.resolve(modulePath, FILES.PACKAGE);
    const packageDestPath = path.resolve(modulePath, FOLDERS.CJS_MODULES, FILES.PACKAGE);
    await fs.copy(packageSourcePath, packageDestPath);
};

module.exports = populateIndividualModule;
