const exec = require('child_process').exec;
const chalk = require('chalk');
const crypto = require('crypto');

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
    if (!!successMsg) {
      console.log(successMsg);
    }
    return stdout;
  }
);

/**
 * Create a hash checksum of string of data
 *
 * @method checksum
 *
 * @param {string} data String of data (can also take in data from `fs.readFile`)
 * @param {string} algorithm Algorithm to use for hashing. (Get all available hashing methods using `crypto.getHashes()`)
 * @param {string} encoding Encoding type
 *
 * @return {string} String of the hashed data
 */
const checksum = (data, algorithm, encoding) => crypto.createHash(algorithm || 'sha256').update(data, 'utf8').digest(encoding || 'hex');

module.exports = {
  run,
  checksum,
};
