const path = require('path');

const config = {
  projectName: 'plant-scanner-h5',
  date: '2026-1-22',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-platform-h5'],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: false,
  },
  mini: {},
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['@nutui/nutui-react-taro'],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    devServer: {
      port: 10086,
      host: '0.0.0.0',
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'));

      // Add TypeScript support for workspace packages using babel
      const corePath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'src');
      const uiPath = path.resolve(__dirname, '..', '..', '..', 'packages', 'ui', 'src');
      chain.module
        .rule('typescript')
        .test(/\.tsx?$/)
        .include.add(corePath)
        .add(uiPath)
        .end()
        .use('babel-loader')
        .loader('babel-loader')
        .options({
          presets: [['@babel/preset-typescript', { allowNamespaces: true }]],
        });
    },
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@plant-scanner/core': path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'src'),
    '@plant-scanner/ui': path.resolve(__dirname, '..', '..', '..', 'packages', 'ui', 'src'),
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
