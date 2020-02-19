module.exports = {
  extends: ['lokua'],
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': [
      1,
      { varsIgnorePattern: /debug|trace/, ignoreRestSiblings: true },
    ],
    'no-sparse-arrays': 0,
  },
}
