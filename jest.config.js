module.exports = {
  rootDir: 'src',
  collectCoverageFrom: ['*.{js}', '!index.js'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 80,
    },
  },
};
