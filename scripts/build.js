const jobs = require('./jobs');

jobs.clean('Removed the \'lib\' folder for a clean build');

jobs.umd('Built UMD package for browsers');

jobs.umdMinified('Built minified UMD package for browsers');

jobs.esModules('Built ES6 modules');

jobs.flowTypes('Exported RAW Flow types');

jobs.cjsModules('Built CommonJS modules');
