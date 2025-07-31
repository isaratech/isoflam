const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const {InjectManifest} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index-docker.tsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },

        {
          test: /\.svg$/i,
          type: 'asset/inline'
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource'
        }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      favicon: path.resolve(__dirname, '../src/assets/favicon.ico')
    }),
    new webpack.DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(require("../package.json").version),
      REPOSITORY_URL: JSON.stringify(require("../package.json").repository.url),
    }),
      new CopyWebpackPlugin({
          patterns: [
              {
                  from: path.resolve(__dirname, '../src/manifest.json'),
                  to: 'manifest.json'
              },
              {
                  from: path.resolve(__dirname, '../src/assets/icons'),
                  to: 'icons',
                  noErrorOnMissing: true
              },
              {
                  from: path.resolve(__dirname, '../src/assets/favicon.svg'),
                  to: 'favicon.svg',
                  noErrorOnMissing: true
              }
          ]
      }),
      new InjectManifest({
          swSrc: path.resolve(__dirname, '../src/sw.js'),
          swDest: 'sw.js',
          exclude: [/\.map$/, /manifest$/, /\.htaccess$/]
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()]
  }
};
