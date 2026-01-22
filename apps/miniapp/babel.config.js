module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5'
    }]
  ],
  plugins: [],
  parserOpts: {
    syntax: 'ecmascript',
    jsx: true,
    dynamicImport: true
  }
};
