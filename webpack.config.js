const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    Components: './src/Components/index.js',
    Entities: './src/Entities/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: ['TilmeldClient', '[name]'],
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.html'],
  },
  externals: {
    'nymph-client': 'NymphClient',
    '../Entities': 'TilmeldClient.Entities',
  },
  module: {
    rules: [
      {
        test: /\.(html|svelte)$/,
        exclude: /\/node_modules\//,
        use: {
          loader: 'svelte-loader',
        },
      },
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
