const fs = require('fs-extra');
const path = require('path');

const PATHS = require('./paths');

const { FOLDERS, MODULES, FILES } = PATHS;

const populateIndividualModule = async (moduleName) => {
  const modulePath = path.resolve(MODULES, moduleName);
  const docsSoucePath = path.resolve('.', FOLDERS.DOCS);
  const docsDestPath = path.resolve(modulePath, FOLDERS.DOCS);
  const licenseSoucePath = path.resolve('.', FILES.LICENSE);
  const licenseDestPath = path.resolve(modulePath, FILES.LICENSE);
  /*
   * Copy over the docs folder
   */
  await fs.copy(docsSoucePath, docsDestPath);
  /*
   * Copy over the license file
   */
  await fs.copy(licenseSoucePath, licenseDestPath);
};

module.exports = populateIndividualModule;
