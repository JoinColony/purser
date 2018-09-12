const denodeify = require('denodeify');
const fs = require('fs');
const readDir = denodeify(fs.readdir);

const populateIndividualModule = require('./populate-individual-module');
const PATHS = require('./paths');

const { MODULES } = PATHS;

const populate = async () => {
  const modules = await readDir(MODULES);
  return modules.map(populateIndividualModule);
};

populate();
