const path = require('path')
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    "index":'./lib/index.js',
    "index.min":'./lib/index.js'
    },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js' ,
    libraryTarget:'umd', 
    libraryExport:'default'   //默认导出
  },
  optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({    //此插件在webpack4之后，当mode 设置为production时，默认开启压缩
            include: /\.min\.js$/,  //匹配min.js结尾的文件进行压缩
        })
    ]
}
}