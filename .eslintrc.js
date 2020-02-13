module.exports = {
  extends: ['lokua'],
  rules: {
    'no-unused-vars': [
      1,
      { varsIgnorePattern: 'log', ignoreRestSiblings: true },
    ],
  },
}
