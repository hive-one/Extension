module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    webextensions: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'linebreak-style': 0,
    'object-curly-spacing': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'keyword-spacing': 'error',
    'no-extra-semi': 'error',
    semi: ['error', 'always'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-console': 0,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  },
  globals: {
    chrome: false
  },
  settings: {
    react: {
      pragma: 'h'
    }
  }
};
