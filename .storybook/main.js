const path = require('path');

module.exports = {
  stories: ['../src/client/**/*.stories.tsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  features: {
    postcss: false,
  },
  webpackFinal: async (config) => {
    config.resolve.extensions.push('.svg');

    config.module.rules = config.module.rules.map((data) => {
      if (/svg\|/.test(String(data.test)))
        data.test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani)(\?.*)?$/;

      return data;
    });

    config.module.rules.push({
      test: /\.svg?$/,
      exclude: /node_modules/,
      use: {
        loader: 'react-svg-loader',
        options: { tsx: true },
      },
    });

    config.resolve.alias['@client'] = path.resolve(__dirname, '../src/client/domain');

    return config;
  },
};
