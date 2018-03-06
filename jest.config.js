module.exports = {
  rootDir: 'src',
  collectCoverageFrom: ['*.{js}', '!index.js'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 80,
    },
  },
  moduleNameMapper: {
    'ethers': '<rootDir>/src/__mocks__/ethers',
  },
};
