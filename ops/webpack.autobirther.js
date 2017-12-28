
const path = require('path')

module.exports = {

  externals: ['web3', 'eth'],

  entry: './src/autobirther.js',

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'autobirther.bundle.js',
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

