module.exports = {
  extends: ['lokua'],
  rules: {
    'no-unused-vars': [
      1,
      { varsIgnorePattern: 'debug', ignoreRestSiblings: true },
    ],
    'no-sparse-arrays': 0,
  },
}
