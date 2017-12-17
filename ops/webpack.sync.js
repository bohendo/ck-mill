
const path = require('path')

module.exports = {

  target: 'node',
  externals: ['web3', 'eth'],

  entry: './src/sync.js',

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'sync.bundle.js',
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
        exclude: ['node_modules']
      },
    ],
  },

}

