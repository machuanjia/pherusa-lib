/*
 * @Author: D.Y
 * @Date: 2021-04-23 11:09:54
 * @LastEditTime: 2021-04-28 13:10:45
 * @LastEditors: D.Y
 * @FilePath: /pherusa-lib/src/config/index.ts
 * @Description:
 */
const CracoLessPlugin = require('craco-less')
const path = require('path')
const { merge } = require('lodash')

export const webpackConfigs = ({theme = {},port=4000,proxyPort=3000,dirname = '',customer={}})=>{
  const pathResolve = (url:string) => path.join(dirname, url)
  return merge({
    webpack: {
      alias: {
        '@': pathResolve('src'),
        '@assets': pathResolve('src/assets'),
        '@apis': pathResolve('src/apis'),
        '@components': pathResolve('src/components'),
        '@constants': pathResolve('src/constants'),
        '@i18n': pathResolve('src/i18n'),
        '@layouts': pathResolve('src/layouts'),
        '@stores': pathResolve('src/stores'),
        '@styles': pathResolve('src/styles'),
        '@utils': pathResolve('src/utils'),
        '@views': pathResolve('src/views'),
        '@routes': pathResolve('src/routes'),
        '@interfaces': pathResolve('src/interfaces'),
      },
      // @ts-ignore
      configure: (webpackConfig:any, { env, paths }) => {
        paths.appBuild = 'dist'
        webpackConfig.output = {
          ...webpackConfig.output,
          path: path.resolve(dirname, 'dist'),
          library: `pherusa-[name]`,
          libraryTarget: 'umd',
          jsonpFunction: `webpackJsonp_pherusa`,
        }
        return webpackConfig
      },
    },
    babel: {
      plugins: [
        ['import', { libraryName: 'laiye-antd', style: true }],
        [
          'import',
          {
            libraryName: '@antv/x6-react-components',
            libraryDirectory: 'es', // es or lib
            style: true,
            transformToDefaultImport: true,
          },
          'antv',
        ],
        ['@babel/plugin-proposal-decorators', { legacy: true }],
      ],
    },
    plugins: [
      // This plugin takes care of the .less files
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              javascriptEnabled: true,
              modifyVars: theme,
            },
          },
        },
      },
      // This plugin take scare of the .less.module files
      {
        plugin: CracoLessPlugin,
        options: {
          modifyLessRule (lessRule:any, _context:any) {
            lessRule.test = /\.(less)$/
            lessRule.use = [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                },
              },
              {
                loader: 'less-loader',
                options: {
                  lessOptions: {
                    modifyVars: theme,
                    javascriptEnabled: true,
                  },
                },
              },
            ]
            lessRule.exclude = /node_modules/
            return lessRule
          },
        },
      },
    ],
    devServer: {
      port: port,
      headers:{
        'Access-Control-Allow-Origin': '*',
      },
      proxy: {
        '/api': {
          target: `http://localhost:${proxyPort}`,
          changeOrigin: true,
        },
      },
      disableHostCheck:true,
      historyApiFallback:true
    },
  },customer)
}
