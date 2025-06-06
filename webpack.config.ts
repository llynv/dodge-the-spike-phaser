const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env: any, argv: any) => {
  const isProduction = argv && argv.mode === 'production';

  return {
    context: path.resolve(__dirname, 'src'),
    entry: './main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
      clean: true,
      publicPath: isProduction ? '/dodge-the-spike-phaser/' : '/',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: path.resolve(__dirname, 'src'),
          loader: 'ts-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024,
            },
          },
          generator: {
            filename: 'assets/images/[name].[hash][ext]',
          },
        },
      ],
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'dist'),
        },
        {
          directory: path.join(__dirname, 'assets'),
          publicPath: '/assets',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.css'],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'assets'),
            to: 'assets',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
        title: 'Dodge the Spike',
        inject: 'head',
      }),
    ],
  };
};
