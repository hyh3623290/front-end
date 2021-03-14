# http 面试题

## 状态码

- 1xx 服务器收到请求，还没返回给前端
- 2xx 请求成功，如200
- 3xx 重定向，如302
- 4xx 客户端错误，如404
- 5xx 服务器端错误，如500



- 301

  永久重定向，就是让你去别的地方找，服务器如果给你返回301，并返回一个新的location地址，你会在Headers里的Response Header里看到一个Location，浏览器会自动处理，以后就会直接访问新的地址

- 302

  临时重定向，和301区别是下次访问还是老地址，还有个307跟302一个意思

- 304

  资源未被修改，就是说在本地缓存还有效，不用重新请求，就直接用以前的就可以

- 403

  没有权限

- 500

  服务器错误

- 504

  网关超时，一般就是你能访问通第一台服务器，但第一台服务器在连接其他服务器的时候或者数据库服务的时候超时了

  

## Methods

- `get` 获取数据
- `post` 提交或新建数据
- `patch/put` 更新数据
-  `delete` 删除数据

## Restful

​	一种API设计方法

- 传统API：一个url当作一个功能
- Restful API：一个url当作一个唯一的资源

## Headers

### 常见的 Request Header

- `Accept`：浏览器可接收的数据格式

- `Accept-Encoding`：浏览器可接收的压缩算法，如gzip，浏览器是可以解压的

- `Accept-Language`：浏览器可以接受的语言，如zh-CN

- `Connection: keep-alive`：表示一次TCP连接可以重复使用

- `Cookie`

- `Host`：就是你请求的域名是什么

- `User-Agent`：浏览器信息

- `Content-Type`：发送数据的格式，如application/json

  一般向服务器发送请求如post的时候会带上这个，告诉服务器我们数据的格式

### 常见的 Response Header

- Content-Type

- Content-Length

- Content-Encoding

- Set-Cookie

  服务端要改cookie的时候，就用这个把cookie改掉

- Expires

  已被Cache-Control代替



## 缓存

 	哪些资源可以被缓存？静态资源如js，css，img，但html是不行的

### 强制缓存

​	浏览器初次请求，服务器如果觉得可以被缓存的话就会返回资源，并加`Cache-Control`响应头，否则不会加这个头，这个响应头可以控制强制缓存的逻辑。第二次访问的时后就直接从本地缓存中拿数据，没有经过网络。如果过期了就再次重复请求

```js
Cache-Control: max-age=6666 // 秒, 最大一年
// NetWork里的Size如果是 (disk cache)，就表示这个是被缓存的	
// no-cache就是不用本地强制缓存，交给服务器处理，服务器怎么做就怎么做
// no-store 客户端和服务器都不缓存，比较彻底
```

### 协商缓存

- 服务端缓存策略

  服务端来判断一个文件是不是可以被缓存，其实告诉客户端这个文件我是没有动的，你可以用本地的缓存

- 服务端第一次返回的时候会返回资源和一个资源标识，当浏览器再次请求的时候会带着资源标识

- 如果客户端资源和服务端资源一样就返回304，否则返回200和最新的资源以及新的资源标识

- 资源标识在response headers里，有两种

  Last-Modified表示资源最后的修改时间

  Etag是资源的唯一标识（字符串），类似指纹

  拓展：客户端会在request headers里带上`If-Modified-Since`或者`If-None-Match`就分别对应上面两个

- 优先使用Etag

  因为资源可能重复生成但内容不变，导致Last-Modified改变，但是Etag就不会变 

### 刷新

手动F5刷新：强制缓存失效，协商缓存有效

强制刷新ctrl+F5：全部失效

# 开发环境

## git

​	svn已经不太适用了，是集中式的。git是分布式的

​	ssh不用每次输入用户名密码，但是你得把你电脑的ssh公钥放到git服务器对应的位置上，添加好之后就可以了。

```js
// ssh
// windows搜一下怎么生成ssh key，mac的话输入 cat ~/.ssh/id_rsa.pub

// 我没切换分支，就不小心在master改了，还挺多
// 没提交所以也切不了新分支
git stash // 就是把当前改的东西先搁到一边（只有新文件的话没关系可以直接切），现在就可以直接切了
git checkout -b newbranch
git stash pop // 把之前暂存的东西提出来

// git status之后我要看改的内容
git diff
git diff filename
当然新增的文件不会出来详细修改信息

// 设置用户名邮箱
git config user.name xxx
git config user.email xxx

// 提交记录
git log
git show 提交的ID // 可以查看具体的提交内容

// 改完还没提交后悔了
git checkout index.html // 撤销修改的内容
git checkout . // 也可以撤销全部
```

​	多人协作

```js
// 1. 创建并切换新分支
git checkout -b newbranch

// 2. 写完提交代码
add commit

// 3. 提交到服务器上
git push origin newbranch

// 4. 负责人把所有分支都拉下来
git fetch

// 5. 负责人切到newbranch
git checkout newbranch

// 6. 拉一下代码看有没有新内容
git pull origin newbranch

// 7. 没问题负责人切回主分支
git checkout master

// 8. 把newbranch合并到主分支，注意现在在master上
git merge newbranch

// 9. 如果还有其他分支继续 5，6，7，8 步

// 10. 处理冲突并 提交到远端，
git push origin master
```



## 抓包

- windows一般用 Fiddler 多一些

- mac一般 Charles

- 手机和电脑必须连同一个局域网，比如一个wifi

- 将手机代理到电脑上

  Charles为例：看下电脑的IP地址 xxx，手机打开这个地址，选择网址之后要做代理，安卓手机基本上是长按修改网络，然后高级选项什么的，然后上面有代理。IOS的话有个标签直接就是代理，代理选手动，服务器主机名也就是地写刚才那个xxx，端口号一般是8888，打开软件在Proxy上面看（HTTP Proxy）。打开浏览器地址要写刚才那个xxx，不然不行

- 手机浏览网页即可抓包

- 网址代理

  双越 - 15-6 - 06:32

- https

## webpack 和 babel

​	东西多容易忘

### ES6模块化

```js
// a.js
export const x = 1
export const y = 2
等价于
export {
	x,
  y
}

// b.js
import { a, b } from './a.js'
```

```js
// a.js
const x = 1
export default x

// b.js
import x from './a.js'
```



## Linux

- 公司线上机器一般都是Linux
- 测试机也需要保持一致

​	你怎么去连上测试机，很多情况下本地没有问题，一上线就有问题，本地还复现不了，但是测试机或线上机器就有问题，就需要登上测试机，去看问题。

​	测试机一般都是Linux，centos或者乌班图，你上去以后连个文件夹都打不开，连个文件都找不着，也不会编辑文件

```js
// 1. 本地登上线上机器(地址192.168.1.1)，一般给你个用户名如work
ssh work@192.168.1.1

// 2. 回车之后需要输入密码
```

```js
// 查看文件夹(平铺形式)
ls
// 查看所有文件包括隐藏文件
ls -a
// 查看文件夹(列表形式)
ll
// 清屏
clear
// 创建文件夹xx
mkdir xx
// 删除文件夹
rm -rf xx
// 进入文件夹
cd xx
// 修改文件名 tab键帮我们智能填满
mv index.html newindex.html
// 移动文件名
mv index.html dist/index.html
// 拷贝文件
cp a.js a1.js
// 创建文件
touch xx.js
// 删除文件
rm xx.js
```

```js
// 新建文件并打开 查看文件
vi xx.js
// 输入 i 进入Insert模式，左下角有个Insert就可以输入了
// 输入esc 退出Insert模式 

// 输入:, 输入w就写入了
// 输入:, 输入q就退出了
// 输出文件内容
cat xx.js
// 查找文件内容
grep "babel" package.json
```

# 运行环境

​	运行环境即浏览器（server端有nodejs）

​	它就是下载网页代码，渲染出页面，期间会执行若干JS

## 页面加载过程

### 加载资源的形式

​	html代码，媒体文件如视频，图片等，js和css代码



### 加载资源的过程

- DNS解析：根据域名拿到 IP 地址

  比如百度根据区域的不同IP地址也可能不同，因为有不同的服务器放在不同的地方，所以还得用域名

- 浏览器向这个 IP 的机器发送 HTTP 请求

  其实浏览器只是一个发起方，真正核心模块还是调用操作系统能发送网络服务的系统服务，然后http请求还涉及到一些TCP的连接（比如三次握手什么的）

- 服务器收到、处理并返回 HTTP 请求

- 浏览器得到返回内容

  返回内容就是上面的加载资源形式那部分

### 渲染页面的过程

- 根据 HTML 结构生成 DOM 树

- 根据 CSS 生成 CSSOM

- 将 DOM 和 CSSOM 整合形成 RenderTree

- 根据 RenderTree 开始渲染和展示

- 遇到`<script>`时，会执行并阻塞渲染

  因为JS有可能会改变DOM结构

- 直至把RenderTree渲染完成

​    为何要将 CSS 放在 HTML 头部？这样会让浏览器尽早拿到 CSS 尽早生成 CSSOM，然后在解析 HTML 之后可一次性生成最终的 RenderTree，渲染一次即可。否则重新生成CSSOM后的话会重复那种过程，影响性能

​	 JS 放在底部可以保证让浏览器优先渲染完现有的 HTML 内容，让用户先看到内容，体验好。JS 如果放在 HTML 顶部，JS 执行的时候 HTML 还没来得及转换为 DOM 结构，可能会报错。



## 性能优化

### 原则

1.  多使用内存、缓存或者其他方法
2.  减少 CPU 和GPU 计算，更快展现

### 从何入手

#### 让加载更快

- 减少资源体积：压缩代码

  比如webpack 生产环境打包

- 减少访问次数：合并代码，SSR服务器端渲染，缓存

  比如webpack会合并代码（比如你引入了`a.js`，`b.js`最后会合并上放到script里）,还有雪碧图啥的

  缓存：比如webpack打包输出时使用contenthash，会根据内容去计算字符串生成文件名，文件变了hash也变，对应的url也变，如果不变的话自动触发http缓存机制，返回304就是说文件没有变

  ```js
  output: {
    filename: 'bundle.[contenthash].js'
  }
  ```

- 使用更快的网络：CDN

  CDN是根据区域来进行处理的，并且也满足304的

- SSR：网页和数据一起加载，一起渲染

  前后端分离的话是先加载网页，再加载数据，再渲染数据

#### 让渲染更快

- css 放前面，js放后面

- 今早开始执行js，用DOMcontentLoaded触发，没必要等到图片加载完成

- 懒加载：图片，上滑加载更多

  比如一个图片有时候不需要加载，像很长的新闻列表每项都有图片，我们希望第一屏看到的图片先加载完

  ```jsx
  <img src="smallPic.png" data-real-src="abc.png" id="pic"/>;
  var img1 = document.getElementById('pic')
  img1.src = img1.getAttribute('data-real-src')
  // 我们先加载一个小的图片，预览图，等划到对应的位置的时候再加载真正的图片
  // 可以给img加一个属性存真正的图片地址
  ```

- 对DOM查询进行缓存

  ```js
  const pList = document.getElementByTagName('p')
  const length = pList.length
  // 然后我们操作这个pList和length而不是直接操作document.getElementByTagName('p')
  // 就只需要一次查询
  ```

- 频繁的DOM操作，合并到一起插入DOM结构

  ```js
  const frag = document.createDocumentFragment()
  for(...){
    frag.appendChild('...')
  }
  // 都完成之后再插入dom中
  listNode.appendChild(frag)
  ```

- 防抖节流



## 安全

### XSS 跨站请求攻击

​	举一个例子，我在一个博客网站正常发表一篇文章，输入汉字、英文和图片，完全没有问题。但是如果我写的是恶意的 JS 脚本，例如获取到`document.cookie`然后传输到自己的服务器上，那我这篇博客的每一次浏览都会执行这个脚本，都会把访客 cookie 中的信息偷偷传递到我的服务器上来。

​	其实原理上就是黑客通过某种方式（发布文章、发布评论等）将一段特定的 JS 代码如<script></script>>隐蔽地输入进去。然后别人再看这篇文章或者评论时，之前注入的这段 JS 代码就执行了。JS 代码一旦执行，那可就不受控制了，因为它跟网页原有的 JS 有同样的权限，例如可以获取 server 端数据、可以获取 cookie 等。于是，攻击就这样发生了。

**预防措施：**

​	最根本的方式，就是对用户输入的内容进行验证和替换，需要替换的字符有：

```js
< 替换为：&lt;
> 替换为：&gt;
// & 替换为：&amp;
// ” 替换为：&quot;
// ‘ 替换为：&#x27;
// / 替换为：&#x2f;
```

​	替换了这些字符之后，黑客输入的攻击代码就会失效，XSS 攻击将不会轻易发生。

​	除此之外，还可以通过对 cookie 进行较强的控制，比如对敏感的 cookie 增加`http-only`限制，让 JS 获取不到 cookie 的内容。



### 跨站请求伪造

- 你正在购物，看中一个商品，商品id是100
- 付费接口是`http://buy.com/pay?touid=100`， 但没有任何验证，这个验证只是根据用户信息做验证，就是只要你登陆了之后就可以买，购买之后自动扣款
- 我是攻击者，我看中一个商品，id是200，我想让你去给我买
- 我向你发送一封电子邮件，邮件标题很吸引人 
- 邮件正文隐藏着`<img src="http://buy.com/pay?touid=200"/>`
- 你一查看邮件就帮我买了id是200的商品 

​    因为你正在购物，可能就已经登陆了这个网站，就会有用户信息了，当你打开是这个请求就发过去了，顺带着cookie。当然不可能这么简单，就是举个例子，重要的就是你会把用户信息带过去

​	解决是用post接口，因为post的话img这个标签是攻击不通的，post接口做跨域很麻烦的，需要server端做支持的，另外就是增加验证，如输入密码或者指纹，短信验证码

 

**拓展**：SQL 注入

​	例如做一个系统的登录界面，输入用户名和密码，提交之后，后端直接拿到数据就拼接 SQL 语句去查询数据库。如果在输入时进行了恶意的 SQL 拼装，那么最后生成的 SQL 就会有问题。但是现在稍微大型一点的系统，都不会这么做，从提交登录信息到最后拿到授权，要经过层层的验证。因此，SQL 注入都只出现在比较低端小型的系统上。



# ^_^

## 手写深度比较

```js
function isEqual(obj1, obj2) {
  if(!isObject(obj1) || !isObject(obj2)) {
    return obj1 === obj2
  }
  if(obj1 === obj2) {
    return true
  }
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if(keys1.length !== keys2.length) {
    return false
  }
  for(let key in obj1) {
    const res = isEqual(obj1[key], obj2[key])
    if(!res) {
      return false
    }
  }
  return true 
}
```



## split 和 join 的区别

```js
'1-2-3'.split('-') // [1, 2, 3]
[1, 2, 3].join('-') // '1-2,3'
```



## [10, 20, 30].map(parseInt)

​	拆解

```js
[10, 20, 30].map((num, index) => {
  return parseInt(num, index)
})
// 10, NaN, NaN parseInt第二个参数是啥
```





## get 和 post 有什么区别

- get一般用于查询操作，post 一般用于用户提交操作
- get参数拼接到url上，post 放在请求体内
- post 易于防止CSRF



## 解释jsonp的原理，为什么不是真正的ajax

​	ajax是通过XMLHttpRequest实现的，jsonp是通过script标签实现的

​	补充：服务端没有同源策略（一般叫转发）



## document load 和 ready有什么区别

​	前者页面全部资源加载完才会执行，后者dom渲染完即可执行，此时图片和视频可能还没有加载完

​	也叫 load 和 DOMContentLoaded



## new Object 和 Object.create 区别

- `{ ... }`等同于 `new Object({ ... })`，原型都是`Object.prototype`
- `Object.create(null)` 没有原型，只是`{}`
- `Object.create({ ... })` 可以指定原型

补充：`obj1 === new Object(obj1)`

## 获取URL参数

```js
function query(name) {
  const search = location.search
  const p = new URLSearchParams(search)
  return p.get(name)
}

function query() {
  const res = {}
  const search = location.search.substr(1) // 去掉前面的?
  search.split(&).forEach(paramStr => {
  	const arr = paramStr.split('=')  
  	const key = arr[0]
    const val = arr[1]
    res[key] = val
  })
  return res
}
```



## 手写flatern

​	18-12 03.03

```js
Array.prototype.concat.apply([], arr)
// 等价于 [].concat(arr) 但是只能拍平一层[1, 2, [3,4]]
```



```js
function flat(arr) {
  const isDeep = arr.some(item => item instanceof Array)
  if(!isDeep) {
    return arr
  }
  const res = Array.prototype.concat.apply([], arr)
  return flat(res)
}
```



## 数组去重

```js
// 暴力
function unique(arr) {
  const res = []
  arr.forEach(item => {
    if(res.indexOf(item)<0) {
      res.push(item)
    }
  })
  return res
}
```



```js
// Set
function unique(arr) {
  const set = new Set(arr)
  return [...set]
}
```



## requestAnimationFrame

​	JS的动画的API，要想动画流畅，更新频率要60帧每秒，即16.67ms更新一次视图，这个方法会自动帮我们控制更新频率。setTimeout 也可以做动画，但是前者由浏览器控制，性能比较好，且不用自己控制时间

```js
function animate() {
  curWidth = curWidth + 3
  $div1.css('width', curWidth)
  if(curWidth < maxWidth) {
    requestAnimationFrame(animate)
    // setTimeout(animate, 16.67)
  }
}
```

