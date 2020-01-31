const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const pkg = require('./package.json');

const env = process.env.NODE_ENV || 'development';
const develop = env === 'development';
const test = env === 'test';
const production = env === 'production';

const dist = path.join(__dirname, 'dist');

const TerserPlugin = require('terser-webpack-plugin');

function getFileName() {
  const name = develop ? 'dev' : 'prod';
  return `${name}.js`;
}

function getPlugins(plugins) {
  if (production) {
    return plugins.concat([new webpack.optimize.OccurrenceOrderPlugin()]);
  }

  return plugins;
}

module.exports = {
  devtool: (develop || test) && 'source-map',

  entry: './src/index',

  devServer: {
    contentBase: "./public",
    hot: true
  },

  output: {
    path: dist,
    filename: getFileName(),
    library: pkg.name,
    libraryTarget: 'umd',
  },


  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.json'
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules/,
        exclude: /node_modules\/pdfjs-dist/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [['@babel/preset-env', { targets: { browsers: 'last 2 versions' } }]],
          },
        },
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf)$/,
        use: 'base64-inline-loader'
      },
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              tsconfig: path.resolve(__dirname, 'tsconfig.json')
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
      },
    ],
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: false,
          ie8: true,
        },
      }),
    ],
  },

  plugins: getPlugins([
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ])
};
