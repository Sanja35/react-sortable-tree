module.exports = {
  setupFilesAfterEnv: ['./test-config/test-setup.js'],
  setupFiles: ['./test-config/shim.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '\\.(css|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironment: 'enzyme',
  testEnvironmentOptions: {
    enzymeAdapter: 'react16',
  },
  testTimeout: 10000,
  testPathIgnorePatterns: ['storyshots.test.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
