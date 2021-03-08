# 加载器

​	加载器是用来处理和加工我们打包过程中所遇到的资源文件

## 编译转换类

​	会把模块转换成js代码，如 css-loader

## 文件操作类

​	把文件拷贝到输出目录，同时将文件的访问路径向外导出，如 file-loader

## 代码检查类

​	用来统一代码风格，eslint-loader

File-loader

​	加载图片或字体

```js
module: {
  rules: [
    {
      test: /.png$/,
      use: file-loader
    }
  ]
}
```



url-loader

​	图片会被编码成base64，适合体积比较小的资源文件，减少请求次数

```js
module: {
  rules: [
    {
      test: /.png$/,
      use: url-loader,
      options: {
        limit: 10 * 1024// 10kb
      }
    }
  ]
}
```



babel-loader

```js
yarn add babel-loader @babel/core @babel/preset-env --dev
```

```js
module: {
  rules: [
    {
      test: /.js$/,
      use: babel-loader,
      options: {
        presets: ['@babel/preset-env']
      }
    }
  ]
}
```



# 插件

​	除了资源加载以外其他的一些自动化工作

clean-webapck-plugin

​	本来重新打包的话只会覆盖同名的文件，其他文件就被保留了，这个插件每次打包时可以自动清除之前打包的文件

```js
yarn add clean-webapck-plugin -dev
```



```js
const { CleanWebpackPlugin } = require('clean-webapck-plugin')

plugins: [
  new CleanWebpackPlugin()
]
```



html-webpack-plugin

​	自动生成使用打包结果的HTML，以前都是通过硬编码的方式单独放到项目的根目录下的

```js
const HtmlWebpackPlugin = require('html-webpack-plugin') // 不解构

plugins: [
  new HtmlWebpackPlugin({
    title: '标题'
    meta: {
    	viewport: 'width=device-width'
  	}
  })
]
```

​	如果自定义的内容比较大量，可以用模板，根据模板生成 html 页面

```jsx
// index.html
...
<h1><%= htmlWebpackPlugin.options.title></%>></h1>
```

```js
plugins: [
  new HtmlWebpackPlugin({
    title: '标题'
    meta: {
    	viewport: 'width=device-width'
  	},
    template: './src/index.html'                   
  })
]
```

​	有时候需要同时去输出多个文件

```js
plugins: [
  new HtmlWebpackPlugin({
    title: '标题'
  }),
  new HtmlWebpackPlugin({
    filename: 'about.html' // 默认时index.html
  }),
]
```



copy-webpack-plugin

​	有些文件不需要被打包可以直接放到项目目录下，比如 favicon.icon，我们一般把他们放到public文件夹下

```js
new CopyWebpackPlugin([
  'public'
]),
```



# 开发体验

## watch

​	监听文件变化，自动进行打包（保存代码以后就重新打包了）

```js
// 启动webpack命令时添加一个--watch
// 以监视模式下工作运行
yarn webpack --watch
```



​	编译过后自动刷新浏览器

## Webpack Dev Server

### 自动编译 & 自动刷新浏览器

​	提供用于开发的 HTTP Server，集成自动编译和自动刷新浏览器的功能

```js
yarn webpack-dev-server // 开始自动打包运行
```

​	注意的是为了提高效率，它没有将打包结果写入到磁盘文件当中，也就是没有出现dist目录，它将打包结果暂时存放在内存中，http server 也就是从内存中把文件读出来发送给浏览器，减少很多不必要的磁盘读写操作

```js
yarn webpack-dev-server --open // 帮助我们自动打开浏览器
```

### 静态资源

​	可以添加一些属性

```js
devServer: {
  contentBase: [./public] // 配置静态资源路径
}
```

​	

### 代理

​	生产环境中不会跨域，开发环境中时因为是在本地，会跨域

```
http://localhost:8080 开发
https://www.xxx.com/xxx 生产
```

```js
devServer: {
  proxy: {
    '/api': {// 需要被代理的请求路径前缀
      // http://localhost:8080/api/users -> https://api.github.com/api/users
      target: 'https://api.github.com',
      pathRewrite: { // 实现代理路径的重写
        // http://localhost:8080/api/users -> https://api.github.com/users
        '^/api': ''
      },
      // 不能使用 localhost:8080 作为请求 github 的主机名
      changeOrigin: true
    }
  }
}
```

### Hot Module Replacement

​	帮我们保留状态的同时还能更新模块内容

​	已集成在devServer中，不需要单独安装模块了

```js
// 方式1
webpack-dev-server --hot // 执行命令

// 方式2
const webpack = require('webpack')
devServer: {
  hot: true
},
plugins:[
  new webpack.HotModuleReplacementPlugin()
]
```

​	到目前只能实现css文件，style-loader已经帮我们处理了，但是js还不行

​	我们需要手动处理 JS 模块更新后的热替换

```js
// main.js 打包入口
module.hot.accept('./editor', () => {
  console.log('editor 文件更新，这里需要手动处理热替换逻辑')
  document.body.removeChild(editor)
  const newEditor = createEditor()
  document.body.appendChild(newEditor)
})
```

​	处理图片HMR

```js
// main.js 打包入口
if(module.hot) { // 通常这么做安全，不影响生产
  module.hot.accept('./apple.png', () => {
  	img.src = background // 只需要重新设置路径即可
	})
}

```

​	其实大部分框架有成熟的 HMR 方案

**注意事项**

```js
devServer: {
  // hot: true
  hotOnly: true // 就算代码出错也不会自动刷新，会帮我们保留错误的信息
},
```





## sourceMap

​	源代码地图，映射转换后的代码与源代码之间的关系

​	在压缩后的代码末尾添加一行

```js
//# sourceMappingURL=jquery-3.4.1.min.map
```

​	打开开发环境 Sources 下面就会多出那个源文件和 min.js 文件



**Webpack 中的 sourceMap**

```js
devtool: 'source-map' // 定位到行，列信息，单独生成map文件
```

​	打包过后就会看到对应的`bundle.js`文件和 `.map` 文件打开`bundle.js`文件看最后一行也会发现上面的那个注释内容

​	一共是 12 种模式

```js
eval模式 // 构建速度最快，效果也最简单，仅仅能帮我们定位源代码文件的名称，不知道具体的行列信息

cheap-eval-source-map // 只能定位到行，没有列的信息，cheap就是是否包含行信息

cheap-module-eval-source-map // module是能得到loader处理之前的源代码（如babel）

inline // 不会生成map文件，但是会以dataURL的形式把map文件嵌入到代码中，不推荐，会使文件过大

nosource // 会定位出行和列，但是不显示出来，用于生产环境保护源代码
```



**最适宜的模式**

```js
// 开发环境
cheap-module-eval-source-map

// 生产环境
none
原因是 source map 会暴露源代码
实在不行建议 nosources-source-map
```



# 生产环境优化

43集



















# ^_^

安装如果没有特殊的统一都是

```js
yarn add xxx -dev
```

导入如果没有说明都是

```js
const HtmlWebpackPlugin = require('html-webpack-plugin') // 不需要解构
```



