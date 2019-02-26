const
  path                 = require('path'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  entry: {},
  output: { filename: '[name].js' },
  resolve: { modules: [ __dirname + '/../node_modules', __dirname + '/../src' ] },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } }
      },
      {
        test: /\.css/,
        use: [{ loader: MiniCssExtractPlugin.loader, options: { sourceMap: true } }, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' })
  ]
};
