module.exports = {
  setupFiles: [
    './test/temp-polyfills.js',
    './test/setup.js',
  ],
  rootDir: '.',
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.(ts|tsx?)$': './node_modules/ts-jest/preprocessor.js',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
  ],
  moduleNameMapper: {
    'precise-ui': '<rootDir>/node_modules/precise-ui/dist/es5',
    '@zeiss/pharos': '<rootDir>/node_modules/@zeiss/pharos/dist/es5',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/unit/__mocks__/fileMock.js',
  },
};
