const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const develop = env === 'development';
const test = env === 'test';
const production = env === 'production';

const dist = path.join(__dirname, 'dist');

const TerserPlugin = require('terser-webpack-plugin');

function getPlugins(plugins) {
  if (production) {
    return plugins.concat([new webpack.optimize.OccurrenceOrderPlugin()]);
  }

  return plugins;
}

module.exports = {
  devtool: (develop || test) && 'source-map',
  entry: './samples/index',
  output: {
    path: dist,
    filename: 'bundle.js'
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
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ])
};
