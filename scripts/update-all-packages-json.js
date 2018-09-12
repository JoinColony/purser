const denodeify = require('denodeify');
const fs = require('fs');
const readDir = denodeify(fs.readdir);
const chalk = require('chalk');

const updateIndividualPackage = require('./update-individual-package-json');
const PATHS = require('./paths');

const { MODULES } = PATHS;

const update = async () => {
  const modules = await readDir(MODULES);
  return modules.map(moduleName => {
    console.log(
      `Updating release ${chalk.green(
        'package.json'
      )} for ${chalk.white('@colony/')}${chalk.whiteBright.bold(
        moduleName
      )}`,
    );
    updateIndividualPackage(moduleName);
  });
};

update();
