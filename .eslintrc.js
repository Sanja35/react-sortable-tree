module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb', 'airbnb-typescript', 'prettier', 'plugin:storybook/recommended'],
  overrides: [],
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'jest'],
  settings: {
    jest: {
      version: require('jest/package.json').version,
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react/destructuring-assignment': 0,
    'react/jsx-filename-extension': 0,
    'react/prefer-stateless-function': 0,
    'react/sort-comp': 0,
    'react/jsx-props-no-spreading': 0,
    'import/no-extraneous-dependencies': 0,
  },
};
