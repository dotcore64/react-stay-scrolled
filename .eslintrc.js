module.exports = {
  extends: 'airbnb',
  env: {
    browser: true
  },
  rules: {
    'no-multi-assign': 0,
    'max-len': ['error', 150],
    'func-names': 0,
    'new-cap': [2, {
      capIsNewExceptions: ['Velocity']
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'test/**',
        'karma.conf.js',
        'rollup.config.js',
        'examples/rollup.config.js',
      ]
    }]
  }
}
