const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    proxy: {
      "/api1": {
        target: "http://localhost:9000",
        pathRewrite: {
          '^/api1': ''
        },
        changeOrigin: true
      }
    }
  }
})
