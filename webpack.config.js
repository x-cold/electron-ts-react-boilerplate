const path = require('path');
const { spawn, execSync } = require('child_process');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const { version } = require('./package.json');

const SOURCE = path.resolve(__dirname, 'src');
const isDev = process.env.NODE_ENV === 'development';

let electronProcess;

const config = {
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  watch: Boolean(isDev),
  watchOptions: {
    ignored: ['**/!src/**']
  },
  output: {
    path: path.resolve(__dirname, 'dist/assets/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx|ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              experimentalWatchApi: isDev,
              // TODO: set transpileOnly=false and strictly follow the rules of typescript
              transpileOnly: true,
            },
          },
        ],
        include: SOURCE,
      }
    ]
  },
  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
    alias: {
      '@': SOURCE,
    },
  },
  externals: {
    worker_threads: 'worker_threads',
  },
  optimization: {
    minimize: !isDev,
    nodeEnv: false
  },
  plugins: [],

};

function getConfig(...cfg) {
  return merge(config, ...cfg);
}


const mainConfig = getConfig({
  entry: {
    index: path.join(__dirname, 'src/main/index.ts'),
  },
  plugins: [
    new CopyPlugin([
      {
        from: 'package.json',
        to: 'package.json'
      }, {
        from: './statics/',
        to: 'statics'
      }
    ]),
  ],

  /**
   * Set target to Electron specific node.js env.
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-main',
});

if (isDev) {
  mainConfig.plugins.push({
    apply: compiler => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
        if (electronProcess) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /pid ${electronProcess.pid} /f /t`);
            } else {
              electronProcess.kill();
            }

            electronProcess = null;
          } catch (e) {}
        }
        const subCommands = process.env.ELECTRON_DEBUG === '1' ? ['run start:main:debug'] : ['run start:main'];
        electronProcess = spawn('npm', subCommands, {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        });
      });
    },
  });
}


const preloadConfig = getConfig({
  target: 'electron-renderer',
  watch: isDev,
  entry: {
    preload: './src/preloads/index.ts',
  },
});

module.exports = [mainConfig, preloadConfig];
