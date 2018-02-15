const chokidar = require('chokidar');
const paths = require('./paths');
const fs = require('fs');
const chalk = require('chalk');
const utils = require('./utils');
const jobs = require('./jobs');

let initialRun = true;
/*
 * We use this object to keep track of file names and they're content hashes.
 * We only update if we detect a content change.
 */
const files = {};

/*
 * Initialize watcher
 */
const sourceWatch = chokidar.watch(paths.source, { ignored: '**/__tests__', awaitWriteFinish: true });

/*
 * Build the `lib` folder after we read all the content
 */
sourceWatch.on('ready', () => {
  utils.run(`yarn build`, {}, 'Built initially...');
  initialRun = false;
});

/*
 * On any kind of change, if the content is different, re-build
 */
sourceWatch.on('all', (event, path) => {
  if (!initialRun) {
    const fileName = path.replace(`${paths.source}/`, '');
    const contentHash = utils.checksum(fs.readFileSync(path));
    if (!files[fileName] || files[fileName] !== contentHash) {
      console.log(chalk.white(contentHash), chalk.yellow(fileName), chalk.green('changed. Building...'));
      files[fileName] = contentHash;
      jobs.umd(false);
      jobs.umdMinified(false);
      jobs.esModules(false);
      jobs.flowTypes(false);
      jobs.cjsModules(false);
    }
  }
});
