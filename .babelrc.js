module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        corejs: '3.33',
        useBuiltIns: 'usage',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: { node: 'current' },
            useBuiltIns: 'usage',
            corejs: '3.33'
          },
        ],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
};
