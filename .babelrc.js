module.exports = api => ({
  presets: [
    ['@babel/env', {
      ...(api.env('test') ? {
        targets: {
          browsers: ['chrome >= 60', 'firefox >= 56'], // Test in these browsers is enough
        }
      } : {}),
    }],
    '@babel/react',
  ],
  plugins: [
    'dev-expression',
    api.env('test') && ['istanbul', { exclude: ['test/*.jsx'] }],
  ].filter(Boolean),
});
