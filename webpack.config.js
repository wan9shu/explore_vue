const path = require ('path');
const HtmlWebpackPlugin = require ('html-webpack-plugin');
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle[hash].js',
    path: path.resolve (__dirname, './dist'),
  },
  plugins: [
    new HtmlWebpackPlugin ({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 8080,
    contentBase: './dist',
  },
};
