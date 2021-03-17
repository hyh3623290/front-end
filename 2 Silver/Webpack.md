babel-loader怎么用

clean-webapck-plugin

html-webpack-plugin -

copy-webpack-plugin

Webpack Dev Server为什么快

🍇 代理proxy

Hot Module Replacement（JS，CSS）

🍇 为什么框架可以使用HMR，hotOnly

sourcemap -

根据环境不同导出不同配置

definePlugin -

#  加载器

​	加载器是用来处理和加工我们打包过程中所遇到的资源文件

## 编译转换类

​	会把模块转换成js代码，如 css-loader

## 文件操作类

​	把文件拷贝到输出目录，同时将文件的访问路径向外导出，如 file-loader

## 代码检查类

​	用来统一代码风格，eslint-loader

## file-loader

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



## url-loader

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



## babel-loader

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

## clean-webapck-plugin

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



## html-webpack-plugin

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



## copy-webpack-plugin

​	将单个文件或整个目录复制到构建目录。有些文件不需要被打包可以直接放到项目目录下，比如 favicon.icon，我们一般把他们放到public文件夹下。

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

## 根据环境不同导出不同配置

```js
// 支持函数形式
module.exports = (env, argv) => {
  // env: cli给我们传递的环境参数
  // argv: 运行cli过程中传递的所有参数
  const config = { 
  	// 开发环境的配置
    ... 
  }
  if(env === 'production') {
    config.mode = 'production'
    config.devtools = false
    config.plugins = [
      ...config.plugins,
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin(['public'])
    ]
  }
}
```

​	适合中小型项目，不然配置文件会变得非常复杂

## 一个环境对应一个配置文件

​	适合大型项目

webpack.common.js

webpack.prod.js

webpack.dev.js

```js
const common = require('./webpack.common.js')

module.exports = Object.assign({}, common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
  ]
})
// Object.assign有问题，plugins会直接覆盖common的plugins
// 所以一般用专业的merge模块
```

```js
yarn add webpack-merge --dev
const merge = require('webpack-merge')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
  ]
})
```



## definePlugin

​	生产环境默认开启，为我们项目注入全局成员的，并且默认注入`process.env.NODE_ENV`

```js
const webpack = require('webpack')
plugins: [
  new webpack.DefinePlugin({
    API_BASE_URL: '"https://api.xxx.com"'
  })
]
// 两层引号是因为这里要求注入的是js代码片段，也可以直接写JSON.stringify
```

​	即可在任意文件使用这个变量

```js
console.log(API_BASE_URL)
```



## Tree Shaking

​	摇掉未引用代码，不是指webpack的某一个配置选项，会在生产模式下自动启用，如何手动一步一步开启呢

```js
optimization: {
  // 这个选项是集中配置webpack内部的优化功能的
  usedExports: true, // 表示只导出被外部使用的成员，标记未引用代码
  minimize: true // 压缩，摇掉它们
}
```

​	& babel，有些资料说使用babel-loader会导致Tree Shaking失效，有个前提是Tree Shaking必须使用ES Modules模块化，但是有babel-loader的话可能把ES Modules转为CommonJS，主要就是@babel/preset-env这个插件。但是最新的已经帮我们移除了这个转换插件



## concatenateModules

​	就不是一个模块对应一个函数了，而是尽可能把所有模块都合并放到同一个函数中，既提升运行效率，又减少代码体积，又被称为Scope Hosing作用域提升

```js
optimization: {
  concatenateModules: true
}
```



## SideEffects

​	副作用 (webpack4)，指的是模块执行的时候除了导出成员之外做的事情，一般用于开发npm包时标记是否有副作用

​	有这么一种场景，一般都会在index.js集中导出所有的模块，但是你引用的时候只需要其中一个比如Button组件，但是打包的时候会把除了Button以外的内容也都打包进去。就是为了解决这种问题

```js
optimization: {
  SideEffects: true // production 也会自动开启
}
```

​	然后在npm包里的package.json里加

```js
{
  "sideEffects": false // 表示没有副作用，没有用到的模块便不会被打包进来
}
```

​	有副作用的场景如下，假设你写了个方法给Number的prototype上加了个方法，需要用它，但是你没有导出它

```js
// a.js 副作用代码
Number.prototype.pad = function(){}

// b.js
import 'a.js'
console.log(2.pad())

// 此外引入的css代码也是副作用代码，如
import index.css
```

​	解决方法就是标记它们

```js
{
  "sideEffects": [
    "./src/a.js", "*.css"
  ]
}
```

​	

## Code Splitting

​	当我们项目中所有代码最终都被打包到一起，打包结果就会特别的大，但项目刚开始启动的时候并不是所有的模块都是必要的，意味着我们会浪费很多的流量和带宽。所以合理的情况是分包，按需加载。

​	就出现了这个代码分割/代码分包，主要有两种方式

### 多入口打包

​	适用于多页应用程序，一个页面对应一个入口，公共部分单独提取

```js
entry: {
  index: './src/index.js',
  album: './src/album.js'
},
output: {
  filename: [name].bundle.js
},
```

```js
new HtmlWebpackPlugin({
  filename: 'index.html',
  chunks: ['index']
})
new HtmlWebpackPlugin({
  filename: 'album.html',
  chunks: ['album']
})
```

​	提取公共模块

```js
optimization: {
  splitChunks: {
    chunks: 'all'
  }
}
// 就会自动把公共模块提取，打包到一个文件中
```



### 动态导入

​	动态导入到模块会被自动分包，只需要用ESModules或者Vue，React的动态导入语法即可

​	魔法注释

```js
import(/* webpackChunkName: 'index' */'./src/index.js')
```

​	这样被打包的代码就会采用这个index名称，如果文件名称一样就会被打包到同一个文件中

​	

## MiniCssExtractPlugin

​	提取css到单个文件，实现css模块的按需加载。建议css文件超过150kb时提取到单个文件，否则适得其反，因为还多一次请求。

```js
plugins: [
  new MiniCssExtractPlugin()
]
// 就不需要style-loader了
rules: [
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader'
    ]
  }
]
```



## OptimizeCssAssetsWebpackPlugin

​	压缩输出的CSS文件，webpack内部的压缩只针对JS，其他形式的都需要对应的插件。

​	这个插件使用方式也一样，先require，再new即可，但不推荐这样，因为开发环境也会被压缩了，建议如下：

```js
optimization: {
  minimizer: [
    new OptimizeCssAssetsWebpackPlugin(),
    new TerserWebpackPlugin() 
    // JS压缩,因为启动minimizer以后就是采取自定义模式，webpack默认的JS压缩会失效
  ]
}
```



## 输出文件名 Hash

​	全新的文件名对应全新的请求

```js
output: {
  // 1. 项目级hash，任意处改变hash值都会变化
  filename: '[name]-[hash].bundle.js'
  // 2. chunk级hash，打包过程中只要是同一路的打包被修改时变化，比如多入口
  // 此外动态导入时也会产生多路chunk
  filename: '[name]-[chunkhash].bundle.js'
  // 3. content级hash，文件级别的
  filename: '[name]-[contenthash:8].bundle.js'
}
```





# ^_^

安装如果没有特殊的统一都是

```js
yarn add xxx -dev
```

导入如果没有说明都是

```js
const HtmlWebpackPlugin = require('html-webpack-plugin') // 不需要解构
```



