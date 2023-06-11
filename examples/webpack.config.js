/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 13:39:03
 * @Description: 本地测试SDK DEMO webpack配置
 * @FilePath: /clip-img/examples/webpack.config.js
 */
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  // 默认开发环境
  mode: 'development',

  // 获取所有demo的入口文件配置
  entry: fs.readdirSync(__dirname).reduce((entries, currDir) => {
    // 获取 当前demo的根目录路径
    const fulldir = path.join(__dirname, currDir)
    // 当前当前demo的入口文件路径
    const entry = path.join(fulldir, 'app.ts')

    // 判断当前demo的根路径是否是文件，以及当前demo的入口文件是否存在
    if (fs.statSync(fulldir).isDirectory() && fs.existsSync(entry)) {
      entries[currDir] = ['webpack-hot-middleware/client', entry]
    }
    return entries
  }, {}),

  output: {
    // 输出demo打包后的文件位置
    path: path.join(__dirname, '__build__'),

    // 输出demo打包后的文件名称
    filename: '[name].js',

    // ？？？
    publicPath: '/__build__/'
  },

  // 定义针对不同类型文件的webpack的loader的处理方式
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },

  // 定义webpack打包的文件扩展
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  // 定义相关插件
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()]
}
