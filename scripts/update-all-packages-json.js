const denodeify = require('denodeify');
const fs = require('fs');
const readDir = denodeify(fs.readdir);

const updateIndividualPackage = require('./update-individual-package-json');
const PATHS = require('./paths');

const { MODULES } = PATHS;

const update = async () => {
  const modules = await readDir(MODULES);
  return modules.map(updateIndividualPackage);
};

update();
