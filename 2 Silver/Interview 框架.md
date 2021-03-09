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