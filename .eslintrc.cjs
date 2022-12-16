module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    'jest/globals': true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  plugins: ['jest', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: { 'no-param-reassign': ['error', { props: false }] },
}
