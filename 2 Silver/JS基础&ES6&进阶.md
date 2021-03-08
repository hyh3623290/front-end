[TOC]

# 原始类型

# 对象类型

# typeof & instanceof

​	instanceof内部机制是通过原型链判断的

​	此外还有个方法：Object.prototype.toString

```js
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
    return type;
  }
  // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');  // 注意正则中间有个空格
}
```



# 类型转换

# this指向问题



# == vs ===

# 闭包

​	闭包的定义其实很简单：函数 A 内部有一个函数 B，函数 B 可以访问到函数 A 中的变量，那么函数 B 就是闭包。

# 深浅拷贝

## 基本知识

**浅拷贝**

1. Object.assign

```js
let b = Object.assign({}, a)
```

2. `...`

```js
let b = { ...a }
```

​	上两种有什么问题：-> 2

3. concat 和 slice 处理数组

```js
let newArr = arr.concat();
let newArr = arr.slice();
```



**深拷贝**

1. `JSON.parse(JSON.stringify(object))`

   - 拷贝的对象的值中如果有函数、undefined、symbol 这几种类型，经过 JSON.stringify 序列化之后的字符串中这个键值对会消失；

   - 无法拷贝对象的循环应用，即对象成环 (obj[key] = obj)。

   - 拷贝 Date 引用类型会变成字符串；

   - 无法拷贝不可枚举的属性；

   - 无法拷贝对象的原型链；

   - 拷贝 RegExp 引用类型会变成空对象；

   - 对象中含有 NaN、Infinity 以及 -Infinity，JSON 序列化的结果会变成 null；

   

2. `_.cloneDeep`

   

## 手写浅拷贝

```js
const shallowClone = (target) => {
  if (typeof target === 'object' && target !== null) {
    const cloneTarget = Array.isArray(target) ? []: {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
          cloneTarget[prop] = target[prop];
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
}
```



## 手写深拷贝

```js
function deepClone(obj) {
  function isObject(o) {
    return (typeof o === 'object' || typeof o === 'function') && o !== null
  }

  if (!isObject(obj)) {
    throw new Error('非对象')
  }

  let isArray = Array.isArray(obj)
  let newObj = isArray ? [...obj] : { ...obj }
  Reflect.ownKeys(newObj).forEach(key => {
    newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key]
  })

  return newObj
}
```

# 原型

​	当我们创建一个对象时 `let obj = { age: 25 }`，我们可以发现能使用很多种函数，但是我们明明没有定义过它们

​	打印obj，你发现`obj.__proto__.constructor.prototype === obj.__proto__`

​	得出结论，构造函数的原型（`prototype`）又指向实例对象的原型（`__proto__`）

## 原型链

# var let 和 const

- 变量提升
- `var` 在全局作用域下声明变量会导致变量挂载在 `window` 上
- 块级作用域
- `let` 和 `const` 作用基本一致，但是后者声明的变量不能再次赋值



# 继承

## 组合继承

```js
function Child(value) {
  Parent.call(this, value)
}
Child.prototype = new Parent()
```

​	子类的原型上多了不需要的父类属性，存在内存上的浪费，而且调用了两次父类构造函数

## 寄生组合继承

```js
function Child(value) {
  Parent.call(this, value)
}
Child.prototype = Object.create(Parent.prototype, {
  constructor: {
    value: Child,
    enumerable: false,
    writable: true,
    configurable: true
  }
})
```



## class 继承

```js
class Child extends Parent {
  constructor(value) {
    super(value)
    this.val = value
  }
}
```



# 模块化

​	1

## 立即执行函数

## AMD 和 CMD

## CommonJS

## ES Module



# Proxy

​	1

# map, filter, reduce

​	map 是对每个数组做操作返回

​	filter 是只返回为true的

​	reduce 可以将数组中的元素通过回调函数最终转换为一个值，接受两个参数，分别是回调函数和初始值

```js
const sum = arr.reduce((acc, current) => acc + current, 0)
```



# 异步

## 回调函数

## Generator

​	通过 * 来声明generator函数，执行它普通函数不同，会返回一个迭代器，要执行迭代器的next才会继续往下执行，第一次执行时，会暂停在第一个yield处，并向外返回一个值。如果传参数的话，会代替上一个yield的返回值

## Promise



## async await



## 常用定时器

注意点

- 因为 JS 是单线程执行的，如果前面的代码影响了性能，就会导致 `setTimeout` 不会按期执行
- 如果定时器 `setInterval` 执行过程中出现了耗时操作，多个回调函数会在耗时操作结束以后同时执行

​    1

## 手写 promise

​	1



# EventLoop

## 浏览器

​	大家也知道了当我们执行 JS 代码的时候其实就是往执行栈中放入函数，当遇到异步的代码时，会被**挂起**并在需要执行的时候加入到 Task（有多种 Task） 队列中。一旦执行栈为空，Event Loop 就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行，所以本质上来说 JS 中的异步还是同步行为。

​	不同的任务源会被分配到不同的 Task 队列中，任务源可以分为 **微任务**（microtask） 和 **宏任务**

​	微任务包括 `process.nextTick` ，`promise` ，`MutationObserver`。

​	宏任务包括 `script` ， `setTimeout` ，`setInterval` ，`setImmediate` ，`I/O` ，`UI rendering`。

​	1 了解

## Node

​	1

# 手写 call apply bind

```js
Function.prototype.myCall = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  context = context || window
  context.fn = this
  const result = context.fn(...args)
  delete context.fn
  return result
}
```

```js
Function.prototype.myApply = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  context = context || window
  context.fn = this
  let result
  // 处理参数和 call 有区别
  if (arguments[1]) {
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }
  delete context.fn
  return result
}
```

```js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  const _this = this
  const args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}
```

​	1

# 手写 new

在调用 `new` 的过程中会发生以上四件事情：

1. 创建一个新对象；

2. 将构造函数的作用域赋给新对象（this 指向新对象）；

3. 执行构造函数中的代码（为这个新对象添加属性）；

4. 返回新对象。

```js
function create() {
  let obj = {}
  let Con = [].shift.call(arguments)
  obj.__proto__ = Con.prototype
  let result = Con.apply(obj, arguments)
  return result instanceof Object ? result : obj
}
```

​	1

# 手写 instanceof

```js
function myInstanceof(left, right) {
  if(typeof left !== 'object' || left === null) return false;
  let proto = Object.getPrototypeOf(left);
  while(true) {
    if(proto === null) return false;
    if(proto === right.prototype) return true
    proto = Object.getPrototypeof(proto);
  }
}
```

​	1

# 为什么 0.1 + 0.2 != 0.3

​	1

# 垃圾回收机制

​	1



# DevTools



# ^_^

- 1 - 前端面试之道
- 2 - JS核心原理精讲