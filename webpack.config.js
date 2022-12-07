const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  // bundling mode
  mode: 'production',

  devtool: 'inline-source-map',

  // entry files
  entry: './src/strategy-battery-charging.ts',

  // output bundles (location)
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'strategy-battery-charging.js',
    clean: true,
  },

  plugins: [
    new CopyPlugin({
      patterns: [{ from: './src/strategy-battery-charging.html', to: './' }],
    }),
  ],

  // file resolutions
  resolve: {
    extensions: ['.ts', '.js'],
  },

  // loaders
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
