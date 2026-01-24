const path = require('path');

const config = {
  projectName: 'plant-scanner-h5',
  date: '2026-1-22',
  designWidth: 375,
  deviceRatio: {
    640: 1.17,
    750: 1,
    828: 0.905,
    375: 1.0
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-platform-h5'],
  defineConstants: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
  },
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
      pxtransform: {
        enable: true,
        config: {
          designWidth: 375,
          deviceRatio: {
            640: 1.17,
            750: 1,
            828: 0.905,
            375: 1.0
          }
        },
      },
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
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'));

      // Force single React instance from root node_modules
      const rootNodeModules = path.resolve(__dirname, '..', '..', '..', 'node_modules');
      chain.resolve.alias
        .set('react', path.join(rootNodeModules, 'react'))
        .set('react-dom', path.join(rootNodeModules, 'react-dom'))
        .set('@tanstack/react-query', path.join(rootNodeModules, '@tanstack/react-query'));

      chain.merge({
        ignoreWarnings: [
          (warning) =>
            typeof warning?.message === 'string' &&
            warning.message.includes('taro-video-core.js') &&
            warning.message.includes('webpackExports'),
        ],
      });

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
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
