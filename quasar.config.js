/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { configure } = require('quasar/wrappers')
const fs = require('fs')

function resolveEnvFile(environment) {
  if(environment && environment.length && fs.existsSync(`./.env.${environment}`))
  {
    return `./.env.${environment}`;
  }
  return './.env';
}

module.exports = configure(function (ctx) {
  const envName = (ctx.prod)
    ? 'production'
    : (ctx.dev)
      ? 'development'
      : ''

  const envFile = resolveEnvFile(envName);

  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: [
      'i18n',
      'axios',
      'settings',
      'userstate'
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v6',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      //'material-icons' // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
    build: {
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      // transpile: false,
      env: require('dotenv').config({ path: envFile }).parsed,
      publicPath: ctx.prod ? '/vue-openapi-ui/' : '/',

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain

      chainWebpack (chain, cfg) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js', 'vue'] }]);

        if(cfg.isClient) {
          chain.entry('oauth2-callback')
            .add('src/oauth2-callback.main.js')
            .end();

          chain.plugin('html-webpack')
           .tap(args => {
             args[0].excludeChunks = ['oauth2-callback'];
             return args;
           });

          const htmlWebpackOptions = chain.plugin('html-webpack').toConfig().userOptions

          chain.plugin('html-oauth2-callback')
            .use(HtmlWebpackPlugin,[{
              template: path.resolve('src/oauth2-callback.template.html'),
              filename: 'oauth2-callback.html',
              chunks: ['oauth2-callback'],
              excludeChunks: ['app'],
              minify: htmlWebpackOptions.minify,
              templateParameters: htmlWebpackOptions.templateParameters || cfg.htmlVariables,
              chunksSortMode: 'none',
              // inject script tags for bundle
              inject: true,
              cache: true
            }])
            .after('html-webpack')
        }
      }

    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
    devServer: {
      server: {
        type: 'http'
      },
      port: 4000,
      open: true // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
    framework: {
      config: {
        brand: {
          'get': '#3FA9F3',
          'post': '#90C24B',
          'put': '#F9C120',
          'delete': '#E9463D',
          'head': '#765549',
          'options': '#765549',
          'patch': '#F9C120'
        }
      },

      iconSet: 'mdi-v6', // Quasar icon set
      //iconSet: 'material-icons', // Quasar icon set
      lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'Dark',
        'Dialog',
        'Notify'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode

      chainWebpackCustomSW (chain) {
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

      manifest: {
        name: 'OpenAPI UI',
        short_name: 'OpenAPI UI',
        description: 'OpenApi UI Vue-er',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }

  }
})
