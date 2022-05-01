module.exports = api => ({
  presets: [
    ['@babel/env', {
      ...(api.env('test') ? {
        targets: {
          browsers: ['chrome >= 60', 'firefox >= 56'], // Test in these browsers is enough
        }
      } : {}),
    }],
    api.env("test") && ['@babel/react', { runtime: "automatic" }],
  ].filter(Boolean),
});
