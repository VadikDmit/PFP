const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    optimizeFonts: true,
    swcMinify: true,

    sassOptions: {
        includePaths: [path.join(__dirname, '/src/assets/styles/vendor')],
        prependData: '@import "index.scss";',
    },

    webpack: (config) => {
        config.resolve.alias['@swc/helpers'] = path.join(
            __dirname,
            'node_modules/@swc/helpers',
        );

        config.module.rules.push({
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/fonts/[name][ext][query]',
            },
        });

        return {
            ...config,
        };
    },
};

module.exports = nextConfig;
