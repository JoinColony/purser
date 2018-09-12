const denodeify = require('denodeify');
const fs = require('fs');
const readDir = denodeify(fs.readdir);

const buildIndividualModule = require('./build-individual-module');
const PATHS = require('./paths');

const { MODULES } = PATHS;

const build = async () => {
  const modules = await readDir(MODULES);
  return modules.map(buildIndividualModule);
};

build();
