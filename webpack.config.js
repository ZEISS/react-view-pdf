const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    'index': './src/index.ts',
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  externals: {
    react: 'react',
    "precise-ui": "precise-ui",
    "styled-components": "styled-components",
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
};
