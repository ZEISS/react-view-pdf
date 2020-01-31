const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const develop = env === 'development';
const production = env === 'production';

function getPlugins(plugins) {
  if (production) {
    return [...plugins, new webpack.optimize.OccurrenceOrderPlugin()];
  }

  return plugins;
}

module.exports = {
  devtool: develop && 'source-map',
  entry: './samples/index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },

  optimization: {
    minimizer: [new TerserPlugin({ terserOptions: { warnings: false, ie8: true } })],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: { tsconfig: path.resolve(__dirname, 'tsconfig.json') },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          formatter: require('eslint-friendly-formatter'),
        },
      },
    ],
  },
  plugins: getPlugins([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ]),
};
