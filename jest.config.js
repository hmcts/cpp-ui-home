// custom jest configuration should go in here

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

module.exports = {
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
};
