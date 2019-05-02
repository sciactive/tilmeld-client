const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    TilmeldClient: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: ['tilmeld-client'],
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json'],
  },
  externals: {
    'nymph-client': 'nymph-client',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                '@babel/transform-classes',
                {
                  builtins: ['Error'],
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
