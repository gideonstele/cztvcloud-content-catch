const path  = require('path');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack4');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');


const extTypes = {
  'javascript': 'js',
  'css': 'css',
  'sass': 'css',
  'scss': 'css',
};

const baseConfig = {
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : 'nosources-source-map',
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        extractComments: false,
        cache: true,
        parallel: true,
      })
    ],
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '__',
    },
  },
  output: {
    path: path.resolve(__dirname, 'package/dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    // filename: (chunkData) => {
    //   return `${chunkData.chunk.name}.${extTypes[chunkData.contentHashType]}`;
    // },
    publicPath: '/dist/',
  },
  resolve: {
    alias: {
      '_utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        use: 'babel-loader',
      },
      {
        test: /\.(svg|woff|woff2|eot|ttf|otf|png|jpg|webp|gif)/,
        use: [{
          loader: 'url-loader?limit=0',
        }],
      },
    ]
  },
  plugins: [
  ]
};

const backgroundConfig = {
  entry: {
    background: './src/background.js',
  },
};

const contentConfig = {
  entry: {
    content_script: './src/content_script.js',
  },
  module: {
    rules: [
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
  optimization: {
    splitChunks: {
      chunks: 'initial',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
      }
    },
  },
};

const optionsConfig = {
  entry: {
    options: './src/options.js',
  },
  module: {
    rules: [
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
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: '配置页',
      filename: 'options_page.html',
      template: './src/public/options_page.html'
    })
  ],
};

const reflowConfig = {
  entry: {
    reflowed: './src/reflowed.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '排版页',
      filename: 'reflowed.html',
      template: './src/public/reflowed.html'
    })
  ]
};

module.exports = [
  merge(baseConfig, backgroundConfig),
  merge(baseConfig, contentConfig),
  merge(baseConfig, optionsConfig),
  merge(baseConfig, reflowConfig),
];