const { resolve } = require('path');

module.exports = {
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: [resolve(__dirname, '../..'), resolve(__dirname)] },
    ],
  },
};
