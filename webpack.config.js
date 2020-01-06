const path  = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack4');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const extTypes = {
  'javascript': 'js',
  'css': 'css',
  'sass': 'css',
  'scss': 'css',
};

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV !== 'production' ? 'hidden-source-map' : 'nosources-source-map',
  entry: {
    'content_script': './src/content_script.js',
    'background': './src/background.js',
    'popup': './src/popup.js',
  },
  output: {
    path: path.resolve(__dirname, 'package/dist'),
    filename: (chunkData) => {
      return `${chunkData.chunk.name}.${extTypes[chunkData.contentHashType]}`;
    },
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        use: 'babel-loader',
      },
      {
        test: /\.vue/,
        use: [{
          loader: 'vue-loader',
        }],
      },
      {
        test: /\.scss$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
        }, {
          loader: 'css-loader',
        }, {
          loader: 'sass-loader',
        }]
      },
      {
        test: /\.css/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
          }
        ]
      },
      {
        test: /\.(svg|woff|woff2|eof|ttf|png|jpg|webp)/,
        use: [{
          loader: 'url-loader?limit=0',
        }],
      },
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' 
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_style.css'
    }),
    new VueLoaderPlugin()
  ],
  // optimization: {
  //   splitChunks: {
  //     chunks: 'initial',
  //     cacheGroups: {
  //       styles: {
  //         name: 'chunk',
  //         test: /\.css$/,
  //         chunks: 'all',
  //         enforce: true,
  //       },
  //       common: {
  //         test: /node_modules/,
  //         name: 'common',
  //         priority: 20,
  //         minChunks: 1,
  //         maxInitialRequests: 1,
  //         minSize: 0,
  //       },
  //     },
  //   },
  // },
};