module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    'jest/globals': true,
  },
  files: ['*.js', 'src/*.js', 'test/*.js'],
  extends: ['airbnb', 'plugin:prettier/recommended'],
  plugins: ['jest', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: { 'no-param-reassign': ['error', { props: false }] },
}
