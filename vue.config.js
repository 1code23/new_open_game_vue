module.exports = {
  publicPath: "./",
  devServer: {
    port: 8080,
    proxy: {
      "/api": {
        target: "http://172.20.11.183:8088", //开发环境
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
  lintOnSave: false,
};
