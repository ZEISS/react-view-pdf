const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    'index': './src/index.ts',
  },
  mode: 'production',
  output: {
    path: path.join(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
    alias: {
      // Point to ES5 build
      'pdfjs-dist': path.resolve('./node_modules/pdfjs-dist/legacy/build/pdf.js'),
    },
  },
  externals: {
    'react': 'react',
    'precise-ui': 'precise-ui',
    'styled-components': 'styled-components',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
