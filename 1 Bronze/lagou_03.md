# VueRouter

## 基本使用

`router/index.js`

```js
import Vue from 'vue'
import VueRouter from 'vue-router'

// Vue.use 用来注册组件，它会调用传入对象的 install 方法
// 如果是函数直接调用
Vue.use(VueRouter)

const routes = [
  {
    name: 'index',
    path: '/',
    component: index
  },
  {
    name: 'index',
    path: '/',
    component: () => import(../index)
  }
]

const router = new VueRouter({
	routes
})
export default router
```

Main.js

```js
import router from './router'

new Vue({
  render: h => h(App),
  router // 这里会在Vue实例中挂载上$route 和 $router
}).$mount('#app')
```

App.vue

```jsx
<router-view />
```



## 动态路由传参

```js
const routes = [
  {
    name: 'detail',
    // 路径中携带参数
    path: '/detail/:id',
    component: detail
  }
]
// detail 组件中接收路由参数
$route.params.id
```



```js
const routes = [
  {
    name: 'detail',
    // 路径中携带参数
    path: '/detail/:id',
    component: detail,
    props: true
  }
]
// detail 组件中接收路由参数
const detail = {
	props: ['id'],
	template: '<div>Detail ID： {{ id }}</div>'
}
```

## 嵌套路由

```js
{
  path: '/',
  component: layout,
  children: [
    {
      name: 'index',
      path: '',
      component: index
    },
    {
      name: 'details',
      path: 'details/:id',
      component: details
    }
  ]
}
// 它会合并外面的path和里面的path
// 假设index和detail有相同的头和尾
```



## 编程式导航

```js
// 跳转到指定路径
this.$router.push('/login')
// 命名的路由
router.push({ name: 'user', params: { id: '5' }})
// replace不会记录当前的历史
router.replace()
router.go(-2)
```



## Hash 模式 和 History 模式

- Hash式基于锚点，通过 onhashchange 监听路径的变化

- History 模式 基于H5的History API

  ```js
  history.pushState()
  history.replaceState()
  history.go()
  ```

  



## 实现原理

### Hash 模式

​	是通过URL 中#后面的内容作为路由地址，我们可以直接通过`location.url`来切换路由地址，如果只改变了#后面的内容，浏览器不会向服务器请求这个地址，但是它会把这个地址记录在浏览器的访问历史中，当hash变化后，我们需要监听hash的变化（`hashchange`事件），做相应的处理。在这个事件中，记录当前路由的地址，并找到该路径对应的组件，然后重新渲染。

### History 模式

​	就是一个普通的url，我们通过`history.pushState()`方法来改变url的地址栏，这个方法仅仅是改变地址栏，并把当前地址记录到浏览器的访问历史中，并不会真正的跳转到指定的路径，也就是浏览器不会向服务器发送请求。通过监听`popstate`事件，可以监听到浏览器历史操作的变化，在这个事件处理函数中，可以记录改变后的地址。要注意的是，当调用pushState，或者replaceState时，并不会触发该事件，当点击浏览器的前进和后退按钮时，或者调用history的back和forward方法的时候，该事件才会被触发，最后当地址改变的时候，根据当前的地址渲染对应的组件

43.30



# Vue响应式模拟

实际项目中出问题的原理层面的解决 

- 给 Vue 实例新增一个成员是否是响应式的？ 

  否，创建响应式的操作都是在new Vue的时候开始的，当实例话完成后新增属性只是给vm实例新增一个普通属性，不是响应式，可以用`Vue.set(vm.someObj, 'b', 2)`，或者 `this.$set(this.someObj, 'b', 2)`

  其实就是重新调用了defineReactive，帮我们把这个属性转换成了getter和setter

- 给普通属性重新赋值成对象，是否是响应式的？

  是，重新赋值的时候触发set方法，set方法里我们会判断如果是对象的话重新遍历所有属性变成响应式

## 数据驱动

数据响应式、双向绑定、数据驱动 

- 数据响应式 

  数据模型仅仅是普通的 JavaScript 对象，而当我们修改数据时，视图会进行更新，避免了繁 琐的 DOM 操作，提高开发效率

- 双向绑定 

  数据改变，视图改变；视图改变，数据也随之改变 我们可以使用 v-model 在表单元素上创建双向数据绑定

-  数据驱动

  是 Vue 最独特的特性之一 开发过程中仅需要关注数据本身，不需要关心数据是如何渲染到视图

## 响应式核心原理

### Vue 2.x

```js
// 模拟 Vue 中的 data 选项
let data = {
	msg: 'hello'
}
// 模拟 Vue 的实例
let vm = {}

// 数据劫持：当访问或者设置 vm 中的成员的时候，做一些干预操作
Object.defineProperty(vm, 'msg', {
  // 可枚举（可遍历）
  enumerable: true,
  // 可配置（可以使用 delete 删除，可以通过 defineProperty 重新定义）
  configurable: true,
  get() {
    console.log('get: ', data.msg)
    return data.msg
  },
  set(newValue) {
    console.log('set: ', newValue)
    if (newValue === data.msg) {
      return
    }
    data.msg = newValue
    document.querySelector('#app').textContent = data.msg
  }
})

// 测试
vm.msg = 'Hello World'
console.log(vm.msg)
```

### Vue 3.x

直接监听对象，而非属性。

```js
let vm = new Proxy(data, {
  // 当访问 vm 的成员会执行
  get(target, key) {
    console.log('get, key: ', key, target[key])
    return target[key]
  },
  // 当设置 vm 的成员会执行
  set(target, key, newValue) {
    console.log('set, key: ', key, newValue)
    if (target[key] === newValue) {
      return
    }
    target[key] = newValue
    document.querySelector('#app').textContent = target[key]
  }
})
```

## 发布/订阅模式

- 订阅者 
- 发布者 
- 信号中心

​	我们假定，存在一个"信号中心"，某个任务执行完成，就向信号中心"发布"（publish）一个信 号，其他任务可以向信号中心"订阅"（subscribe）这个信号，从而知道什么时候自己可以开始执 行。这就叫做"发布/订阅模式"（publish-subscribe pattern）

```js
// eventBus.js
// 事件中心
let eventHub = new Vue()

// ComponentA.vue
// 发布者
addTodo: function () {
  // 发布消息(事件)
  eventHub.$emit('add-todo', { text: this.newTodoText })
  this.newTodoText = ''
}

// ComponentB.vue
// 订阅者
created: function () {
  // 订阅消息(事件)
  eventHub.$on('add-todo', this.addTodo)
}
```

**模拟实现 eventHub**

```js
class EventEmitter {
  constructor() {
    // { eventType: [ handler1, handler2 ] }
    this.subs = {}
  }
  // 订阅通知
  $on(eventType, handler) {
    this.subs[eventType] = this.subs[eventType] || []
    this.subs[eventType].push(handler)
  }
  // 发布通知
  $emit(eventType) {
    if (this.subs[eventType]) {
      this.subs[eventType].forEach(handler => {
        handler()
      })
    }
  }
}
```

测试

```js
var bus = new EventEmitter()

bus.$on('click', function () {
  console.log('click1')
})

bus.$emit('click')
```

## 观察者模式

- 观察者(订阅者) -- Watcher

  `update()`：当事件发生时，具体要做的事情

- 目标(发布者) -- Dep

  `subs` 数组：存储所有的观察者

  `addSub()`：添加观察者

  `notify()`：当事件发生，调用所有观察者的 update() 方法

  

```js
// 目标(发布者)
// Dependency
class Dep {
  constructor() {
    // 存储所有的观察者
    this.subs = []
  }
  // 添加观察者
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 通知所有观察者
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// 观察者(订阅者)
class Watcher {
  update() {
    console.log('update')
  }
}
```

```js
// 测试
let dep = new Dep()
let watcher = new Watcher()
dep.addSub(watcher)
dep.notify()
```

总结：

- 发布/订阅模式由统一调度中心调用，因此发布者和订阅者不需要知道对方的存在。
- 而观察者模式的订阅者与发布者之间是存在依赖的。



## 手写响应式

- Vue

  把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter

- Observer

  能够对数据对象`$data`的所有属性进行监听，如有变动可拿到最新值并通知 Dep

- Compiler

  解析每个元素中的指令/插值表达式，并替换成相应的数据

- Dep

  添加观察者(watcher)，当数据变化通知所有观察者

- Watcher

  数据变化更新视图





### Vue

```js
class Vue {
  constructor(options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    // 可能是字符串如#app 也可能直接是dom对象
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把data中的成员转换成getter和setter，注入到vue实例中
    this._proxyData(this.$data)
    // 3. 调用observer对象，监听数据的变化, 给$data设置getter setter
    new Observer(this.$data)
    // 4. 调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }
  _proxyData(data) {
    // 遍历data中的所有属性
    Object.keys(data).forEach(key => {
      // 把data的属性注入到vue实例中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}
```



### Observer

负责把 data 选项中的属性转换成响应式数据

```js
class Observer {
  constructor (data) {
    this.walk(data)
  }
  // 用来遍历对象的所有属性
  walk (data) {
    // 1. 判断data是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (obj, key, val) {
    let that = this
    // 负责收集依赖，并发送通知
    let dep = new Dep()
    // 如果val是对象，把val内部的属性转换成响应式数据
    this.walk(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 收集依赖
        // Dep.target实际就是watcher实例
        Dep.target && dep.addSub(Dep.target)
        // 这里不能用obj[key]，因为会无限的触发get方法造成死循环
        // obj[key] -> get -> return obj[key] ->get
        return val
      },
      set (newValue) {
        // set是一个新的方法，会开启一个新的作用域，所以this可能会有问题
        if (newValue === val) {
          return
        }
        val = newValue
        // 当newValue是一个对象时
        that.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}
```



### Compiler

```js
class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }

      // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text --> text
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update (node, key, attrName) {
    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // v-model
  modelUpdater (node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  // 编译文本节点，处理差值表达式
  compileText (node) {
    // console.dir(node)
    // {{  msg }}
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
       // 这里会触发Vue的get，Vue的get会触发data[key]，又会触发Observer的get
      node.textContent = value.replace(reg, this.vm[key])

      // 创建watcher对象，当数据改变更新视图，所有依赖数据的地方都会创建watcher对象
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
      // watcher会访问vm[key],触发Vue的get，再触发Observer的get
      // watcher给Dep.target设置了值
    }
  }
  // 判断元素属性是否是指令
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}
```



### Watcher

```js
class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }

      // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text --> text
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update (node, key, attrName) {
    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // v-model
  modelUpdater (node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  // 编译文本节点，处理差值表达式
  compileText (node) {
    // console.dir(node)
    // {{  msg }}
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
       // 这里会触发Vue的get，Vue的get会触发data[key]，又会触发Observer的get
      node.textContent = value.replace(reg, this.vm[key])

      // 创建watcher对象，当数据改变更新视图，所有依赖数据的地方都会创建watcher对象
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
      // watcher会访问vm[key],触发Vue的get，再触发Observer的get
      // watcher给Dep.target设置了值
    }
  }
  // 判断元素属性是否是指令
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}
```

### Dep

```js
class Dep {
  constructor () {
    // 存储所有的观察者
    this.subs = []
  }
  // 添加观察者
  addSub (sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 发送通知
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
```



## 数组处理

```js
data.colors[0] = 10 // ok
data.colors.push(20) // wrong
```



```js
const oldArrayProto = Array.prototype
const newArrayProto = Object.create(oldArrayProto)
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(methodName => {
  newArrayProto[methodName] = function () {
    // console.log('更新视图')
    oldArrayProto[methodName].call(this, ...arguments)
  }
})

function Observer(target) {
  if(Array.isArray(target)) {
    target.__proto__ = oldArrayProto
  }
}
```





# ^_^