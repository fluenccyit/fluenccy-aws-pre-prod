import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: {
    app: path.resolve(__dirname, '../src/client/client.tsx'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../web'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(png|jpg|woff|woff2|eot|ttf|otf)$/,
        use: 'url-loader?limit=100000',
      },
      {
        test: /\.svg?$/,
        exclude: /node_modules/,
        use: {
          loader: 'react-svg-loader',
          options: {
            tsx: true,
            svgo: {
              plugins: [{ removeViewBox: false }],
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true
            }
          }
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@client': path.resolve(__dirname, '../src/client/domain'),
      '@graphql': path.resolve(__dirname, '../src/graphql-codegen'),
      '@shared': path.resolve(__dirname, '../src/shared'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
    }),
  ],
};
