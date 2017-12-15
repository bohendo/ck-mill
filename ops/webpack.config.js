
const path = require('path')

module.exports = {

  externals: ['web3', 'eth'],

  entry: '../src/index.js',

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'ck.bundle.js',
    library: 'ck',
    libraryTarget: 'assign',
  },

  resolve: {
    extensions: ['.js', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['es2015'], },
        },
      },
    ],
  },

}

