/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['./src/index.ts', './src/index.scss'],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        sideEffects: true,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      // {
      //   test: /\.mp3$/,
      //   use: {
      //     loader: 'file-loader',
      //     options: {
      //       outputPath: 'assets',
      //       publicPath: 'dist/assets',
      //     },
      //   },
      // },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       from: '**/*',
    //       from: path.resolve(__dirname, 'src/assets'),
    //       to: path.resolve(__dirname, 'dist/assets'),
    //       force: true,
    //     },
    //   ],
    // }),
    new MiniCssExtractPlugin({
      filename: 'index.min.css',
    }),
  ],
};
