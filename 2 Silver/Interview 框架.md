# React

## 事件

### bind this

​	如果不绑定 `this.setState` 会报`this`是`undefined`

### 关于 evevnt 参数 

```js
onClick={this.handleClick}
```

1. 什么都不传默认有个event参数
2. 打印event发现是合成事件，不是原生的，可以通过event.nativeEvent拿到
3. 打印event.nativeEvent.currentTarget 发现是document
	 currentTarget是绑定事件的元素（会根据事件流的捕获或者冒泡改变的）
	target是触发事件的元素，点那个就是哪个，不会变，事件代理原理就是这个

合成事件详细：8-5

🍇 **和vue不一样**

### 传递自定义参数

​	如果传了参数，最后一个就是event参数

```js
onClick={this.handleClick(a, b)}

handleClick = (a, b, event) => {}
```

### 

## 表单

​	7-6



## setState

### 不可变值

​	不要直接修改state，必须用setState

​	主要是在操作数组和对象时需要注意，不能修改原来的

```js
// 追加
let { array } = this.state
array: array.concat(10) // 不会影响原来的array
array: [...array, 10]

// 截取
array: array.slice(0, 3)

// 筛选
array: array.filter(k => k > 10)

// 其他操作
const arrayCoppy = array.slice() // 生成副本
arrayCoppy.balabaka // 修改完后再setState

// 操作对象的方式
obj: { ...this.state.obj, a: 10 }
obj: Object.assign({}, this.state.obj, {a: 10})
```



### 可能是异步更新

​	setTimeout和自己定义的dom事件和原生事件中同步

```js
this.setState({
  a: 1
})
console.log(a) // 如果是上面的情况下是同步的，输出1
```



### 可能会被合并

```js
this.setState({
  {val: state.val + 1}
})
this.setState({
  {val: state.val + 1}
})
this.setState({
  {val: state.val + 1}
})
```

​	其实就是等价于下面

```js
// 后面的数据会覆盖前面的更改，所以最终只加了一次.
Object.assign(
  previousState,
  {val: state.val + 1},
  {val: state.val + 1},
)
// 仅限对象才会合并
```

​	如果想基于当前的 `state` 来计算出新的值，则传递一个函数可以让你在函数内访问到当前的 `state` 值。

```js
handleClick () {
  this.setState((state, props) => ({
    counter: state.counter + 1
  }));
  this.setState((state, props) => ({
    counter: state.counter + 1
  }));
}
```

### 两种形式

​	参数是对象或者函数，函数如下

```js
this.setState((prevState, props) => {
  return {
    key: prevState.key // prevState 是上一次的 state，props 是此次更新被应用时的 props
  }
})
```



⚠️ state也可以写成静态属性，如下，类似的还有props

```js
class App ... {
  state = { // 注意不能写let之类，因为不是变量，是一个属性
  	name: 1
	},
  static defaultProps = { a: '1' }
}
```



## 非受控组件

### createRef

```js
// constructor
this.inputRef = React.createRef()

// render
<input ref={this.inputRef}>
```

​	这样`this.inputRef`就会有一个current属性，也就是对应的dom对象

​	它其实也可以获取组件实例，然后可以调用组件实例里面的方法

​	此外还可以通过函数参数的方法获取，如下

```js
// render
<input ref={input => {this.input = input}}>
// 这个参数里的input就是对应的当前这个input元素  
```



## Protals

​	如何让组件渲染到父组件以外

​	比如position为fixed的时候就放到最外层比较好，或者开发弹框组件的时候

```jsx
// 开发弹窗组件
import React, {Component} from "react";
import {createPortal} from "react-dom";

export default class Dialog extends Component {
  constructor(props) {
    super(props);
    const doc = window.document;
    this.node = doc.createElement("div");
    doc.body.appendChild(this.node);
  }

  componentWillUnmount() {
    window.document.body.removeChild(this.node);
  }

  render() {
    return createPortal(
      <div className="dialog">
        <h3>Dialog</h3>
        {this.props.children}
      </div>,
      this.node
    );
  }
}
```



## Context

​	7-16

## 异步组件

```jsx
const Cmp = React.lazy(() => import('./Cmp'));

<React.Suspense fallback={<div>loading...</div>}>
	<Cmp />
</React.Suspense>
```



## 性能优化

​	7-18 - 7-22

## 高阶组件

​	7-23

## Render Props

​	7-24



## batchUpdate

​	setState主流程

1. setState之后newState会被存入pending队列

2. 判断是否处于batchUpdate

   是 -> 保存组件于 dirtyComponents 中（异步的时候）

   ​	dirtyComponents就是说state都被更新了的Components

   否 -> 直接更新了，遍历所有的dirtyComponents，调用updateComponent，更新 pending state or props（执行更新）

setTimeout 就会被判断不是在batchUpdate机制中，就走的同步更新

​	可以这么理解，所有的函数在开始执行的时候会设置一个变量，叫 `isBatchingUpdate = true`，但是实际上不是函数开始执行的时候，可以理解为先设置这个变量，然后开始执行函数，函数执行完再设置为false

```js
increase: () => {
  // 开始：处于batchUpdate
  // isBatchingUpdate = true
  this.setState({ })
  // 结束
  // isBatchingUpdate = false
}
```

```js
increase: () => {
  // 开始：处于batchUpdate
  // isBatchingUpdate = true
  setTimeout(() => {
    // 此时 isBatchingUpdate = false
    this.setState({ })
  })
  // 结束
  // isBatchingUpdate = false
}
```

总结

- setState 本身无所谓异步还是同步
- 主要是看是否能命中 batchUpdate 机制
- 通过判断 isBatchingUpdate

​    生命周期和他调用的函数，React中注册的事件（不是自己定义的DOM事件）和它调用的函数，这种属于React可以管理的入口都会被判断处于 batchUpdate 机制，这个isBatchingUpdate这个变量是在入口层面去设置的

​	像setTimeout，setInterval这些无法命中，是React管不到的入口，因为这些东西它不是在我这儿注册的，setTimeout这些什么时候执行我也不知道，自定义事件这是你自己注册的



这种开始定义一个 initialize，执行函数，结束再定义一个 close，又称为 transaction 事务机制

# ----- Vue -----

# watch

​	监听引用类型需要深度监听，

​	拿不到oldValue，因为是引用类型，指向同一个地址，值被修改了变成一样了

```js
watch: {
  keyWord() {
    setTimeout => this.showUsers = this.users.filter(...)
  },
  a: { // 深度监听这么写
    handler: function() {},
    deep: true
  },
  name(oldValue, newValue) { }
}
// 也可以多层监听
watch: {
  a.b.c: function() {}
}
```

计算属性不接受异步

# v-for 和 v-if

​	不建议一起使用，v-for优先级高，每次循环都要if判断影响效率

# 事件

```jsx
<div @click="fn"></div>

fn(e) {
  第一个参数就是事件对象
}
// ---
<div @click="fn('1')"></div>
// 或者 <div @click="fn('1', $event)"></div>
fn(1, e) {
  
}
```

 也有修饰符

- .stop：阻止冒泡
- .prevent：默认行为
- .capture：是否捕获
- .self：只有本身触发才执行
- .once：只绑一次
- .passive
- .keyCode
- .enter
- .down
- .exact
- .native：指定监听原生事件，而不是组件自定义事件

```js
@click.stop
@keyup.13 // 13某个keyCode，当按下键是13的时候
```



## 组件

### 根组件

​	应用的最顶层组件，一般一个独立应用有一个根组件

```jsx
<div id="#app"></div>

let app = new Vue({
  // 配置 options
  template:`<div></div>`
})

app.$mount('#app')
```

​	注意，根组件不能挂到html或者body上，因为他会替换

### 可复用的功能组件

```jsx
Vue.component('tab', {
  template: `<div>选项卡</div>`
})
```

​	就可以直接复用了

```jsx
<tab />
```

### 组件内容渲染

- template选项
- render选项

​    根组件如果不用$mount，就也可以用el选项，用el选项就是在构建的时候同时进行挂载，$mount就是可以提供延迟挂载的功能，挂载的时机可以自己选

```js
let app = new Vue({
  // 配置 options
  el: '#app'
  template:`<div></div>`
})

// app.$mount('#app')
```

​	如果提供了`el`，而没有提供`template`，那么会自动把el的`innerHTML`作为`template`

```jsx
<div id="#app">
  <h1>123</h1>
  <tab />
</div>

let app = new Vue({
  el: '#app'
})
```

​	render方法会少一个模版到虚拟dom的过程

## Data

```js
// 属性新增不行
data: {
  title: '123'
  user: {
    name: 'zs'
  }
}
app.age = 2

// 解决 - 这样操作之后就是响应式了
Vue.set('age', 2)
app.$set('age', 2)
Vue.set(app.user, 'gender', 'male')

set其实就是又做了一层defineProperty
```

## 生命周期

​	在创建vue实例（`new Vue`）的过程中会发生很多事情。

​	首先是初始化。帮我们初始化事件，生命周期相关的成员，包括h函数

​	首先是beforeCreate，实例初始化后被调用，在 `beforeCreate` 钩子函数调用的时候，是获取不到 `props` 或者 `data` 中的数据的。（此时data的响应式追踪，event/watcher都还没有被设置，也就是说不能访问到data，props，computed，watch，methods上的方法和数据）

​	然后会执行 `created` 钩子函数，在这一步的时候已经可以访问到之前不能访问到的数据，但是这时候组件还没被挂载，所以是看不到的。

​	接下来会先执行 `beforeMount` 钩子函数，开始创建 VDOM，最后执行 `mounted` 钩子，并将 VDOM 渲染为真实 DOM 并且渲染数据。组件中如果有子组件的话，会递归挂载子组件，只有当所有子组件全部挂载完毕，才会执行根组件的挂载钩子。

​	接下来是数据更新时会调用的钩子函数 `beforeUpdate` 和 `updated`，这两个钩子函数没什么好说的，就是分别在数据更新前和更新后会调用。

​	另外还有 `keep-alive` 独有的生命周期，分别为 `activated` 和 `deactivated` 。用 `keep-alive` 包裹的组件在切换时不会进行销毁，而是缓存到内存中并执行 `deactivated` 钩子函数，命中缓存渲染后会执行 `actived` 钩子函数。

​	最后就是销毁组件的钩子函数 `beforeDestroy` 和 `destroyed`。前者适合移除事件、定时器等等，否则可能会引起内存泄露的问题。然后进行一系列的销毁操作，如果有子组件的话，也会递归销毁子组件，所有子组件都销毁完毕后才会执行根组件的 `destroyed` 钩子函数。（解绑自定义事件event.$off，解绑自定义的dom事件如window.scroll）



⚠️ `beforeCreate`执行完后是初始化注入的操作，会把props，data，methods等等成员注入到vue的实例中。

⚠️ `created`执行完成。到此，vue创建完毕。下面做的事情是帮我们把**模版编译成render函数**。首先判断选项中是否设置了el选项，如果没有就调用$mount()方法，$mount实际就是帮我们把el转换成template，然后判断是否设置了template，如果没有的话将el外部的html作为template模版，否则将template编译到render函数中

​	接下来准备挂载dom。执行beforeMount

⚠️ 调用`vm.$destroy`执行销毁阶段



## 组件通信

任意组件

```js
// 事件总线方法
// event.js
import Vue from 'vue'

export default new Vue()
```

```js
// component
import event from './event.js'

event.$on('add', this.getName)
event.$emit('add', this.name)

beforeDestroy() {
  event.$off('add', this.getName)
}
```









# 指令

## 基本指令

```js
// v-text
{{  }} 这个的问题，有时候内容比较多的话会先显示{{ title }}这种样子，就可以用v-text解决

// v-cloak
也可以解决上面的问题，不过需要配合css属性选择器
[v-cloak]: {
  display: none;
}
当渲染完后会自动将选择器里面的值设置为 display: block

// v-html
渲染html

// v-once
只渲染一次，后期的更新不再渲染

// v-pre
忽略这个组件以及它的子元素的编译，比如你就想输出{{}}这个东西

// v-show v-if

// v-for 
v-for也可以遍历object
v-for和v-if不能一起用（不建议），要用的话把v-if放到v-for的父级或者子集
v-for优先级高于v-if，先循环，然后判断是否要渲染，就会做三次重复的判断，是不好的

// v-bind
v-bind:id="myId" 等价于 :id="myId"
:style="'width: 200px'"
:class="'box1 box2'"
:class="{'box1': isActive}"

// v-model
```

​	attribute是html标签上的属性，property是dom（对象）的属性



## 指令修饰符

```js
.lazy // 懒
.trim	// 去除首尾空格
.number // 转数字

v-model.lazy="val"
```



## 自定义指令

### 注册指令

**全局指令**

```js
Vue.directive('test', {
  
})
```

**局部指令**

​	只在当前组件中可以使用

```js
new Vue({
  directive: {
    name: {
      
    }
  }
})
```

​	v-name即可使用

### 指令生命周期

- bind：第一次绑定到元素的时候调用，只调用一次，可以做一些初始化，但是这时候页面可能还没有插入这个元素
- inserted：被绑定元素被插入父节点时使用
- update：所在组件更新时调用
- componentUpdated：所在组件更新完成时调用
- unbind：解绑时调用，只调用一次

```js
// 会传入el和binding
el就是所在的元素
binding是指令配置细节，参数，修饰符，值，名称等

// 此外还有vnode和oldVnode
```



### 实现获取焦点指令

```jsx
Vue.directive('focus', {
  inserted(el, binding) {
    binding.isFocus && el.focus()
  }
});

<input v-focus="isFocus" />
```

​	第四期在这里讲了一个实现拖拽指令



## 组件的v-model与.sync

```jsx
<div v-model="val"></div>

Vue.component('kkb', {
  model: {
    prop: 'checkedValue',// checkedValue和val进行双绑
    event: 'click'
  }
})

this.$emit('click', this.value)
```

还有.sync 在高级四期Vue（四）



# 过滤器

filters 可以直接用 | 来使用



# ref和$refs

```jsx
<p ref="p"></p>
// 就可以通过this.$refs.p拿到dom
```



# 高级特性

## 自定义v-model

```vue
// MyInput.vue
<template>
	<input 
    type="text" 
    :value="text" 
    @input="$emit('change', $event.target.value)">
</template>
  
<script>
  export default {
    model: {
      prop: 'text', // 对应props里的text
      event: change
    }
    props: {
      text: String,
      default() {
        return ''
      }
    }
  }
</script>
```

```jsx
// parent.vue
<MyInput v-model="name"/>
```

​	总结，parent里的name变化以后，对应的MyInput里的model.prop对应的变量也会变化，而触发change事件以后，parent里的name也会变化



## $nextTick

- Vue是异步渲染
- data改变之后DOM不会立即渲染，就跟state一样做一个整合，多次修改只会渲染一次
- $nextTick会在DOM渲染完后被触发，以获取最新的DOM节点

```js
this.list.push(666)

this.$nextTick(() => {
  console.log(domList.length)
})
// list变化dom也变化，拿到最新的dom列表项的长度
```



## slot

### 匿名插槽和具名插槽

​	匿名插槽和具名插槽简单

```jsx
<SlotDemo :url="url">
  <template v-slot="666">
  	{{ aaa.slotData }}
  </template>
</SlotDemo>
```

```jsx
<slot name="666"></slot> // 我这个坑只留给v-slot叫666的
```



### 作用域插槽

​	如下，其实就是外面的组件（SlotDemo）想获取插槽内部的东西，两个slotData要对应

```jsx
<SlotDemo :url="url">
  <template v-slot="aaa"> // aaa随便取个名字
  	{{ aaa.slotData }}
  </template>
</SlotDemo>
```

```jsx
<slot :slotData="name"> // slotData是随便取得名字

</slot>
```



## 动态组件

​	有的时候组件类型不确定

```jsx
<component :is="componentName"></component>

就会根据data里的componentName动态的渲染组件
is必须是动态的
```



## 异步组件

​	体积比较大的组件很影响体验，如果全部同步打包进来体积会非常大而且加载会非常慢，严重影响性能。所以如果首页不需要加载我们就先不加载它

```vue
<template>
	<Demo v-if="showDemo"/>
</template>

<script>
  import Cmp from './xxx' // 同步加载, 打包的时候也是打一个包
  export default {
    compoennts: {
      Demo: () => import('./xxx') // 异步加载
    }
  }
</script>

```

​	你发现当showDemo为true时，开发工具的NetWork里才会出现一个文件，打开以后发现就是这个Demo的打包文件，刚开始的时候并没有加载这个Demo 



## keep-allive

​	其实就是缓存组件，一般就是频繁切换的时候用

```
<keep-alive>
	<TabA />
  <TabB />
  <TabC />
</keep-alive> 
```



## mixin

- 多个组件有相同的逻辑，抽离出来
- 但不是完美的解决方案，会有些问题
- Vue3的CompositionAPI解决这些问题

```js
import mixinA from './mixinA.js'
export default {
  mixins: ['mixinA']
}
```

```js
// mixinA.js
export default {
  data() {} // 根正常组件一样的，会混进去
  mounted() {}
}
```

缺点：

- 变量来源不明确，不利于阅读
- 多mixin会造成命名冲突
- 多个mixin和多个组件相对应，复杂度会很高



## $attrs/$listeners

​	包含了父作用域中不作为 prop 被识别 (且获取) 的特性绑定 ( class 和 style 除外)。当一个组件没有 声明任何 prop 时，这里会包含所有父作用域的绑定 ( class 和 style 除外)，并且可以通过 vbind="$attrs" 传入内部组件——在创建高级别的组件时非常有用。

​	凡是子组件里没有通过props的方式去声明，你还通过老爹的方式传进来了，它就会被收纳到这个attrs里头

​	老爹写了个事件，挂在了子组件上。子组件就可以用listeners监听

```jsx
// parent
<Cmp @click="onClick"/>
onClick() {
  console.log('parent func')
}

// child
<p v-on="$listeners"></p> // 事件会被展开
```



# Vue原理

​	MVVM，组件化，响应式，vdom和diff，模版编译，渲染过程



数据驱动视图（MVVM，setState）









# ^_^



# React 和 Vue 的区别

​	语法层面的就太多了，无法详细的去讲，可以从大的层面去比

## 共同点

1. 都支持组件化
2. 都是数据驱动视图
3. 都使用vdom操作dom



## 不同点

1. React使用JSX拥抱JS，Vue使用template拥抱html

   开发体验上vue更像一个html的结构，上面是模板，中间是JS，下面是style，模板逻辑样式分离更像html

   React都是以点js结尾的，写React就是写js，只不过jsx是个语法糖而已

2. React是函数式编程，Vue是声明式编程

   什么都先声明好，这时候你修改data的值，Vue去给你监听，你的每一步操作都是一个声明式的操作，data.a = 100，React每次修改都是setState什么，就是函数式编程，针对数据变化的监听，针对触发组件更新的方式 思路也不一样

3. React更多需要自立更生，Vue把想要的都给你，对初学者友好，文档也很好，比如SCU的时候React默认把所有组件重新更新，Vue就不会有这个顾虑，React不会给你一些computed，watch，各种指令呀之类的，React只给核心的，比如v-for和js的map