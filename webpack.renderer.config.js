const path = require('path');
const { spawn, execSync } = require('child_process');
const CopyPlugin = require('copy-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version } = require('./package.json');

const WebpackBar = require('webpackbar');
const SOURCE = path.resolve(__dirname, 'src');
const isDev = process.env.NODE_ENV === 'development';
const publicPath = isDev ? '/' : '../../';

let electronProcess;
let babelConfig = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react'
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: 2
        }
      ]
    ]
  }
};

const generateHtmlWebpackPlugins = pages => pages.map(page => new HtmlWebpackPlugin({
  filename: `pages/${page}/index.html`,
  template: 'src/renderer/static/templates/app.html',
  chunks: [`pages/${page}/index`, 'vendor']
}));

const generateEntries = pages => {
  const rt = {};
  pages.forEach(page => {
    rt[`pages/${page}/index`] = path.resolve(__dirname, `src/renderer/pages/${page}/index.tsx`);
  });
  return rt;
};

const pages = [
  'app',
];

const plugins = [
  new WebpackBar(),
  new CopyPlugin([
    {
      from: 'package.json',
      to: 'package.json'
    }
  ]),
  ...generateHtmlWebpackPlugins(pages),
];

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  entry: generateEntries(pages),
  stats: 'errors-warnings',

  watch: isDev,
  watchOptions: {
    ignored: ['**/!src/**']
  },
  output: {
    path: path.resolve(__dirname, 'dist/assets/'),
    publicPath,
    filename: '[name].[contenthash].js'
  },
  optimization: {
    minimize: !isDev,
    nodeEnv: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: /node_modules/,
          enforce: true
        },
      }
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.tsx|ts$/,
        use: [
          babelConfig,
          {
            loader: 'ts-loader',
            options: {
              experimentalWatchApi: isDev,
              // TODO: set transpileOnly=false and strictly follow the rules of typescript
              transpileOnly: true,
              compilerOptions: {
              }
            },
          },
        ],
        include: SOURCE,
      },
      { test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, loader: 'url-loader', options: { name: 'musics/[name].[hash:8].[ext]' } },
      {
        test: /\.(js|jsx|mjs)$/,
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules/@ies/semi-ui-react')],
        use: [
          babelConfig
        ]
      },
      {
        test: /\.css$/, use: [
          {
            loader: 'style-loader',
            options: {}
          },
          {
            loader: 'css-loader',
            options: { importLoaders: true }
          }
        ], include: [Array], exclude: []
      },

      {
        test: /\.gif$|\.jpe?g$|\.png$|\.webp$/,
        loader: 'url-loader', options: {
          limit: 10000,
          name: 'imgs/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
            options: {}
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: true,
            }
          },
          {
            loader: 'sass-loader',
            options: {}
          }
        ],
        include: [Array],
        exclude: []
      },
      { test: /\.(svg)(\?.*)?$/, loader: 'url-loader', options: { name: 'svg/[name].[hash:8].[ext]' } },
      { test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, loader: 'url-loader', options: { name: 'font/[name].[hash:8].[ext]' } }

    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
    alias: {
      '@': SOURCE,
    },
  },
  plugins,
  externals: {
  },
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  /**
   * Set target to Electron specific node.js env.
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-renderer',
  devServer: {
    contentBase: path.join(__dirname, 'dist/assets/'),
    compress: true,
    port: 3000
  }
};
