/*
 * @Author: wangshicheng
 * @Date: 2021-09-11 14:41:13
 * @Description: 用于demo本地测试SDK的server
 * @FilePath: /clip-img/examples/server.js
 */
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.config')

const app = express()

// webpack的生成的编译器
const compiler = webpack(webpackConfig)

// 使用中间件将根据编译产物作为服务的请求分发资源
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: '/__build__/',
    stats: {
      colors: true,
      chunks: false
    }
  })
)

// 使用中间件处理编译产物的热更新操作
app.use(webpackHotMiddleware(compiler))

app.use(express.static(__dirname))

const port = process.env.PORT || 9090
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})
