const path = require('path');

const config = {
  projectName: 'plant-scanner-miniapp',
  date: '2026-1-22',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'));

      // Force single React instance from root node_modules
      const rootNodeModules = path.resolve(__dirname, '..', '..', '..', 'node_modules');
      chain.resolve.alias
        .set('react', path.join(rootNodeModules, 'react'))
        .set('react-dom', path.join(rootNodeModules, 'react-dom'))
        .set('@tanstack/react-query', path.join(rootNodeModules, '@tanstack/react-query'));

      chain.module.rule('tsx').exclude.add(path.resolve(__dirname, '..', 'src/pages/auth/auth.tsx'));
    }
  },
  h5: {},
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@plant-scanner/core': path.resolve(__dirname, '../../packages/core/src'),
    '@plant-scanner/ui': path.resolve(__dirname, '../../packages/ui/src')
  }
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
