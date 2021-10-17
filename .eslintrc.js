module.exports = {
  extends: ['airbnb', 'plugin:react/jsx-runtime'],
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-multi-assign': 0,
    'max-len': ['error', 150],
    'func-names': 0,
    'new-cap': [2, {
      capIsNewExceptions: ['Velocity'],
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'karma.conf.js',
        'rollup.config.js',
        'examples/rollup.config.js',
      ],
    }],
  },
};
