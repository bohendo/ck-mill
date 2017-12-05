
const path = require('path')
const webpack = require('webpack')

module.exports = {

  target: 'node',

  // some stupid web3 dependency requires electron but doesn't 
  // mention it in their package.json, this fixes 'module not found' error
  externals: ['electron', 'pg-native'],

  entry: {
    server: './index.js',
  },

  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },

  resolve: {
    extensions: ['.js', '.json'],

    // scrypt.js says "if target is node, use c++ implementation, otherwise use js"
    // but I don't want any c++, let's force the js version to always be loaded.
    alias: { 'scrypt.js': 'scryptsy' },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
        exclude: /node_modules/,
      },
    ],
  },

}

