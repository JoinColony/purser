const exec = require('child_process').exec;
const chalk = require('chalk');

/**
 * Simple wrapper method for node's exec() to help reduce boilerplate code
 *
 * @method run
 *
 * @param {string} command Shell command to execute
 * @param {object} env Set environment variables in the form of object key-value pairs
 * @param {string} successMsg Message string to print out when the command finished executing (optional)
 * @param {string} errorMsg Message string to print out when the command failed to executing (optional)
 */
const run = (
  command,
  env,
  successMsg = 'Command executed successfully',
  errorMsg = '%s'
) => exec(
  command,
  { env: Object.assign({}, process.env, env) },
  (err, stdout, stderr) => {
    if (err || stderr) {
      return console.log(chalk.red(errorMsg), err);
    }
    return console.log(chalk.green(successMsg));
  }
);

module.exports = {
  run,
};
