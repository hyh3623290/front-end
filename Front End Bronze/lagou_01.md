[toc]

# JavaScript异步编程

## Generator

```js
function *foo() {
  yield 'foo' // 随时使用这个关键字向外返回一个值，但不像return立即结束，而是暂停函数的执行
}
const g = foo() // 调用它不会立即执行，而是得到一个生成器对象
const res = g.next() // 这时候才开始执行, 并拿到返回值
const a = g.next('bar') // 参数会代替yield的返回值
```



## 实现 Promise

```js
const PENDING = 'pending'; // 等待
const FULFILLED = 'fulfilled'; // 成功
const REJECTED = 'rejected'; // 失败

class MyPromise {
  constructor (executor) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e);
    }
  }
  // promsie 状态 
  status = PENDING;
  // 成功之后的值
  value = undefined;
  // 失败后的原因
  reason = undefined;
  // 成功回调
  successCallback = [];
  // 失败回调
  failCallback = [];

  resolve = value => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为成功
    this.status = FULFILLED;
    // 保存成功之后的值
    this.value = value;
    // 判断成功回调是否存在 如果存在 调用
    // this.successCallback && this.successCallback(this.value);
    while(this.successCallback.length) this.successCallback.shift()()
  }
  reject = reason => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为失败
    this.status = REJECTED;
    // 保存失败后的原因
    this.reason = reason;
    // 判断失败回调是否存在 如果存在 调用
    // this.failCallback && this.failCallback(this.reason);
    while(this.failCallback.length) this.failCallback.shift()()
  }
  then (successCallback, failCallback) {
    // 参数可选
    successCallback = successCallback ? successCallback : value => value;
    // 参数可选
    failCallback = failCallback ? failCallback: reason => { throw reason };
    // 要链式调用必须要返回一个新的promise
    let promsie2 = new MyPromise((resolve, reject) => {
      // 判断状态
      // executor内部同步的情况
      if (this.status === FULFILLED) {
        // setTimeout是因为只有这个新的promise执行完了以后我才能拿到promise2传下去
        setTimeout(() => {
          try {
            // 要链式调用,后面的要拿到上一个then的返回值，就是x
            // 我们要调用下一个promise的resolve方法才能把这个x返回到下一个promise的then里面
            let x = successCallback(this.value);
            // 判断 x 的值是普通值还是promise对象
            // 如果是普通值 直接调用resolve 
            // 如果是promise对象 查看promsie对象返回的结果 
            // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
            resolvePromise(promsie2, x, resolve, reject)
          }catch (e) {
            reject(e);
          }
        }, 0)
      }else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            // 判断 x 的值是普通值还是promise对象
            // 如果是普通值 直接调用resolve 
            // 如果是promise对象 查看promsie对象返回的结果 
            // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
            resolvePromise(promsie2, x, resolve, reject)
          }catch (e) {
            reject(e);
          }
        }, 0)
      } else {
        // 等待 - executor内是异步的时候就先走这里，因为还没有resolve或reject
        // 将成功回调和失败回调存储起来
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              // 判断 x 的值是普通值还是promise对象
              // 如果是普通值 直接调用resolve 
              // 如果是promise对象 查看promsie对象返回的结果 
              // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
              resolvePromise(promsie2, x, resolve, reject)
            }catch (e) {
              reject(e);
            }
          }, 0)
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              // 判断 x 的值是普通值还是promise对象
              // 如果是普通值 直接调用resolve 
              // 如果是promise对象 查看promsie对象返回的结果 
              // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
              resolvePromise(promsie2, x, resolve, reject)
            }catch (e) {
              reject(e);
            }
          }, 0)
        });
      }
    });
    return promsie2;
  }
  finally (callback) {
    return this.then(value => {
      return MyPromise.resolve(callback()).then(() => value);
    }, reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason })
    })
  }
  catch (failCallback) {
    return this.then(undefined, failCallback)
  }
  static all (array) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addData (key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          // promise 对象
          current.then(value => addData(i, value), reason => reject(reason))
        }else {
          // 普通值
          addData(i, array[i]);
        }
      }
    })
  }
  static resolve (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }
}

function resolvePromise (promsie2, x, resolve, reject) {
  if (promsie2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // x=new Promise的情况
  if (x instanceof MyPromise) {
    // promise 对象
    // x.then(value => resolve(value), reason => reject(reason));
    x.then(resolve, reject);// ？？？？？？？？？
  } else {
    // 普通值
    resolve(x);
  }
}

module.exports = MyPromise;
```



# TypeScript

```js
yarn add typescript --dev

在node_modules/.bin目录下有个tsc，可以帮我们编译typescript代码
```



# React

## virtual dom 及 diff

### createElement

```js
function createElement(type, props, ...children) {
  const childElements = [].concat(...children).reduce((result, child) => {
    if(child !== false && child !== true && child !== null) {
      if(child instanceof Object) {
        result.push(child)
      } else {
        result.push(createElement('text', { textContent: child }))
      }
    }
    return result
  }, [])
  return {
    type,
    props: Object.assign({ children: childElements }, props),
    children: childElements
  }
}

返回虚拟dom
处理children, 移除null和布尔值, 处理文本节点
将children挂到props上
```

​	这样jsx就会自动被执行createElement方法，我们就会拿到createElement的返回结果，就是一个virtual dom对象



### render

​	把vdom转换为真实dom ，`ReactDOM.render(virtualDOM, container)`

```js
function render(virtualDOM, container, oldDOM = container.firstChild) {
  diff(virtualDOM, container, oldDOM)
}

function diff(virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM
  const oldComponent = oldVirtualDOM && oldVirtualDOM.component
  if(!oldDOM) {
    mountElement(virtualDOM, container)
  } else if(virtualDOM.type !== oldVirtualDOM.type && typeof virtualDOM.type !== 'function') {
    const newElement = createDOMElement(virtualDOM)
    oldDOM.parentNode.replaceChild(newElement, oldDOM)
  } else if(typeof virtualDOM.type === "function") {
    // 组件
    diffComponent(virtualDOM, oldComponent, oldDOM, container)
  } else if(oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
    if(virtualDOM.type === "text") {
      updateTextNode(virtualDOM, oldVirtualDOM, oldDOM)
    } else {
      // 更新元素节点属性
      updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM)
    }

    // 处理key
    // 1. 将拥有key属性的子元素放到单独的一个对象中
    let keyedElements = {}
    for(let i = 0, len = oldDOM.childNodes.lendgh; i<len; i++) {
      let domElement = oldDOM.childNodes[i]
      if(domElement.nodeType === 1) {
        // 元素节点
        let key = domElement.getAttribute('key')
        if(key) {
          keyedElements[key] = domElement
        }
      }
    }

    let hasNoKey = Object.keys(keyedElements).length === 0

    if(hasNoKey) {
      virtualDOM.children.forEach((child, i) => {
        diff(child, oldDOM, oldDOM.childNodes[i])
      })
    } else {
      // 循环virtual DOM的子元素 获取子元素的key属性
      virtualDOM.children.forEach((child, i) => {
        let key = child.props.key
        if(key) {
          let domElement = keyedElements[key]
          if(domElement) {
            // 看看当前位置的元素是不是我们期望的元素
            if(oldDOM.childNodes[i] && oldDOM.childNodes[i] !== domElement) {
              oldDOM.insertBefore(domElement, oldDOM.childNodes[i])
            }
          }
        } else {
          // 新增元素
          mountElement(child, oldDOM, oldDOM.childNodes[i])
        }
      })
    }
    // 删除节点
    let oldChildNodes = oldDOM.childNodes
    if(oldChildNodes.length > virtualDOM.children.lendgh) {
      if(hasNoKey) {
        for(let i=oldChildNodes.length-1; i>virtualDOM.children.length-1; i--) {
          unMountNode(oldChildNodes[i])
        }
      } else {
        // 通过key属性删除节点
        for(let i=0; i<oldChildNodes.length; i++) {
          let oldChild = oldChildNodes[i]
          let oldChildKey = oldChild._virtualDOM.props.key
          let found = false
          for(let n=0; n<virtualDOM.children.length; n++) {
            if(oldChildKey === virtualDOM.children[n].props.key) {
              found = true
              break
            }
          }
          if(!found) {
            unMountNode(oldChild)
          }
        }
      }
    }
  }
}
/**
 * 如果oldDOM不存在，直接将虚拟dom转为真实dom挂载
 * 如果存在就要开始比对了
 *   首先如果是节点类型不一样且新的节点不是组件就直接创建dom并替换旧节点
 *   如果是组件就用组件的diff方法
 *   如果节点类型相同
 *      判断是文本还是普通元素再继续比对
 *      接下来根据key处理子元素
 *        先把拥有key的子元素单独放到一个对象中备用，如果这个对象为空，就直接递归的进行比对
 *        循环新vdom拿到vdom的key，看下那个对象里有没有这个key对应的元素
 *          有的话还要继续判断位置是否正确，不正确的话直接把新的插入到当前这个位置的前面
 *        如果新的vdom里某个元素没有key，直接挂载它
 *        后面还要删除多余节点
 *          如果旧的节点数量大于新的节点数量，则需要删除
 *             如果没有用key的话直接从后面删除即可，直到新旧dom的长度相等
 *             使用key来删除的话要两层循环，第一层循环旧dom，第二层循环新的dom
 *                如果能在新的dom里找不到旧的key，则删除这个节点
 */

function unMountNode(node) {
  const virtualDOM = node._virtualDOM
  if(virtualDOM.type === 'text') {
    node.remove()
    return
  }

  let component = virtualDOM.component
  // 如果component存在，就说明节点是由组件生成的
  if(component) {
    component.componentWillUnMount()
  }

  if(virtualDOM.props && virtualDOM.props.ref) {
    virtualDOM.props.ref(null)
  }

  Object.keys(virtualDOM.props).forEach(propName => {
    if(propName.slice(0, 2) === "on") {
      const eventName = propName.toLowerCase().slice(2)
      const eventhandler = virtualDOM.props[propName]
      node.removeEventListener(eventName, eventhandler)
    }
  })

  if(node.childNodes.length > 0) {
    for(let i=0; i<node.childNodes.length; i++) {
      unMountNode(node.childNodes[i])
      i--
    }
  }

  node.remove()
}
/**
 * 如果是文本节点直接删除
 * 如果是组件生成的，还要调用它的生命周期函数
 * 如果有ref，调用ref函数并传入null
 * 如果有事件要移除事件处理函数
 * 如果有子元素递归的删除子元素
 */

function diffComponent(virtualDOM, oldComponent, oldDOM, container) {
  if(isSameComponent(virtualDOM, oldComponent)) {
    // 同一个组件，做组件更新操作
    updateComponent(virtualDOM, oldComponent, oldDOM, container)
  } else {
    // 不是同一个组件
    mountElement(virtualDOM, container, oldDOM)
  }
}
/**
 * 如果是同一个组件则调用组件更新操作
 * 否则直接挂载新的组件
 */

function isSameComponent(virtualDOM, oldComponent) {
  return oldComponent && virtualDOM.type === oldComponent.constructor
}
/**
 * 判断旧的组件实例的constructor是否与vdom的type一致
 */

function updateComponent(virtualDOM, oldComponent, oldDOM, container) {
  // 生命周期53.25
  oldComponent.componentWillReceiveProps(virtualDOM.props)
  if(oldComponent.shouldComponentDidUpdate(virtualDOM.props)) {
    oldComponent.componentWillUpdate(virtualDOM.props)
    // 组件更新
    oldComponent.updateProps(virtualDOM.props)
    let nextVirtualDOM = oldComponent.render()
    nextVirtualDOM.component = oldComponent
    diff(nextVirtualDOM, container, oldDOM)
    oldComponent.componentDidUpdate()
  }
}
/**
 * 调用旧的组件的更新props方法
 * 执行旧组件的render方法返回拿到组件对应的jsx元素，获取新的vdom
 * 给vdom加一个属性存放组件实例
 * 调用diff函数
 */

function updateTextNode(virtualDOM, oldVirtualDOM, oldDOM) {
  if(virtualDOM.props.textContent !== oldVirtualDOM.props.textContent) {
    oldDOM.textContent = virtualDOM.props.textContent
    oldDOM._virtualDOM = virtualDOM
  }
}
/**
 * 如果textContent不一致，直接更新oldDOM的textContent
 * 记得把新的虚拟dom继续放到dom元素上以备下次diff
 */

function isFunction(virtualDOM) {
  return virtualDOM && typeof virtualDOM.type === "function"
}
/**
 * 判断是否是一个组件
 * 如果virtualDOM的type是函数类型说明是
 */

function mountElement(virtualDOM, container, oldDOM) {
  if(isFunction(virtualDOM)) {
    // Component
    mountComponent(virtualDOM, container, oldDOM)
  } else {
    // 普通jsx
    mountNativeElement(virtualDOM, container, oldDOM)
  }
}
/**
 * 如果是组件调用组件方法
 * 如果是普通元素调用普通元素方法
 */

function mountNativeElement(virtualDOM, container, oldDOM) {
  let newElement = createDOMElement(virtualDOM)
  if(oldDOM) {
    container.insertBefore(newElement, oldDOM)
  } else {
    container.appendChild(newElement)
  }
  if(oldDOM) {
    unMountNode(oldDOM)
  }
  
  let component = virtualDOM.component
  if(component) {
    component.setDOM(newElement)
  }
}
/**
 * 挂载普通jsx元素
 *  调用createDOMElement返回真实dom并插入container
 *  如果有旧的dom插入旧的dom前面并且卸载旧的dom
 *  如果新的dom有component实例，说明是组件过来的
 *    调用实例的setDOM方法把dom挂到实例上
 */

function createDOMElement(virtualDOM) {
  let newElement = null
  if(virtualDOM.type === "text") {
    newElement = document.createTextNode(virtualDOM.props.textContent)
  } else {
    newElement = document.createElement(virtualDOM.type)
    updateNodeElement(newElement, virtualDOM)
  }
  // 存放旧的vdom
  newElement._virtualDOM = virtualDOM
  virtualDOM.children.forEach(child => {
    mountElement(child, newElement)
  })
  if(virtualDOM.props && virtualDOM.props.ref) {
    virtualDOM.props.ref(newElement)
  }

  return newElement
}
/**
 * 通过判断是否是text分别调用不同的dom的创建方法
 *  如果不是text记得更新属性
 *  还要记得把virtualDOM挂到元素上，因为下次diff要知道旧的dom
 *  递归挂载子元素
 *  如果有ref属性的话执行它的方法把这个新的dom元素传进去
 */

function updateNodeElement(newElement, virtualDOM, oldVirtualDOM = {}) {
  const newProps = virtualDOM.props || {}
  const oldProps = oldVirtualDOM.props || {}
  // 更新属性
  Object.keys(newProps).forEach(propName => {
    const newPropsValue = newProps[propName]
    const oldPropsValue = oldProps[propName]
    if(newPropsValue !== oldPropsValue) {
      if(propName.slice(0,2) === 'on') {
        const eventName = propName.toLowerCase().slice(2)
        newElement.addEventListener(eventName, newPropsValue)
        if(oldPropsValue) {
          newElement.removeEventListener(eventName, oldPropsValue)
        }
      } else if(propName === "value" || propName === "checked") {
        // value || checked 不能用setAttribute设置
        newElement[propName] = newPropsValue
      } else if(propName !== 'children') {
        if(propName === "className") {
          newElement.setAttributes('class', newPropsValue)
        } else {
          newElement.setAttributes(propName, newPropsValue)
        }
      }
    }
  })
  // 判断属性被删除的情况，old里面有，new里面没有
  Object.keys(oldProps).forEach(propName => {
    const newPropsValue = newProps[propName]
    const oldPropsValue = oldProps[propName]
    if(!newPropsValue) {
      // 属性被删除了
      if(propName.slice(0, 2) === 'on') {
        const eventName = propName.toLowerCase().slice(2)
        newElement.removeEventListener(eventName, oldPropsValue)
      } else if(propName !== "children") {
        newElement.removeAttribute(propName)
      }
    }
  })
}
/**
 * 更新属性就是从props里拿，遍历它,如果新属性与旧属性不相等
 *  就给加上新的属性，同时需要判断如下几种情况
 *  事件，value||checked，children，className，普通属性
 * 删除旧的属性，遍历旧的props，如果和新的不一致就删除它
 */

function mountComponent(virtualDOM, container, oldDOM) {
  let component = null
  const nextVirtualDOM = null
  if(isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM)
  } else {
    // 类组件，原型上面有render方法
    nextVirtualDOM = buildClassComponent(virtualDOM)
    component = nextVirtualDOM.component
  }
  if(isFunction(nextVirtualDOM)) {
    mountComponent(nextVirtualDOM, container, oldDOM)
  } else {
    mountNativeElement(nextVirtualDOM, container, oldDOM)
  }
  // 处理组件ref
  if(component) {
    component.componentDidMount()
    if(component.props && component.props.ref) {
      component.props.ref(component)
    }
  }
}
/**
 * 需要判断是函数组件还是类组件
 *  执行对应的方法拿到返回的jsx元素，类元素的话需要拿到它对应的实例
 *  再根据jsx执行对应的挂载方法
 *  实例的props里如果有ref的话执行它并把实例传进去
 */

function isFunctionComponent(virtualDOM) {
  const type = virtualDOM.type
  return type && isFunction(virtualDOM) && !(type.prototype && type.prototype.render)
}
/**
 * 看原型上是否有render方法
 */

function buildFunctionComponent(virtualDOM) {
  return virtualDOM.type(virtualDOM.props || {})// props就在vdom的props里存放
}
/**
 * 函数组件直接执行构造函数并传入props拿到vdom
 */

function buildClassComponent(virtualDOM) {
  const component = new virtualDOM.type(virtualDOM.props || {})
  const nextVirtualDOM = component.render()
  nextVirtualDOM.component = component
  return nextVirtualDOM
}
/**
 * 类组件实例化其构造函数（传入props），并执行它的render方法拿到vdom
 */

// extends React.Component
class Component {
  constructor(props) {
    this.props = props
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state)
    // 获取最新的要渲染的vdom对象
    let virtualDOM = this.render()
    let oldDOM = this.getDOM()
    let container = oldDOM.parentNode
    diff(virtualDOM, container, oldDOM)
  }
  setDOM(dom) {
    this._dom = dom
  }
  getDOM() {
    return this._dom
  }
  updateProps(props) {
    this.props = props
  }
  // 生命周期函数
  // ...
  componentDidMount() {}
}
/**
 * 需要定义实例的props
 * setState方法把新的state加到旧的里面
 *    然后调用diff进行更新操作
 * 因为比对的时候需要拿到旧的dom，所以这里要定义setDOM方法，
 *   要把dom放到实例对象上，这样就可以通过实例获取dom
 *   每次构建类组件时都要调用setDom方法
 * 因为要更新props所以要定义updateProps方法
 * 还要定义生命周期方法
 */
```



### diff 过程

​	在比对的时候是执行同级比对，父元素和父元素进行比对，子元素和子元素进行比对，它是不会发生跨级比对的。

- 如果比对时两个节点类型相同

  就看看这个节点是什么类型，如果是文本类型，就比较文本内容是否相同，如不相同就用新的文本节点替换旧的文本节点，如果是元素节点，就比较元素节点的属性，看看新节点的属性值是否和旧节点的属性值相同，如果相同不做处理，如果不同就用新节点属性值替换旧节点属性值，再看看新节点中是否有被删除的属性，使用旧节点属性名称去新节点属性中取值，取不到说明该属性被删除了

  节点比对时执行的是深度优先，递归的对比子元素

- 如果比对时两个节点类型不同

  就没有必要进行比对了，只需要使用新的vdom对象去生成新的dom对象，然后使用新的dom对象去替换旧的dom对象就可以了

- 删除节点

  删除节点发生在节点更新以后并且发生在同一个父节点下的所有子节点上，节点更新完成以后如果旧节点对象的数量多于新节点的数量，就说明有节点需要被删除

​		

### 获取ref

```jsx
render() {
  return (
  	<input ref={input => (this.input = input)} />
    <Cmp ref={cmp => (this.cmp = cmp)}/>
    <button onClick={() => { console.log(this.input.value) }}></button>
  )
}
```

实现思路

​	在创建节点时判断vdom是否有ref属性，如果有就调用ref属性中所存储的方法并且将创建出来的DOM对象作为参数传递给ref方法，这样在渲染组件节点时就可以拿到元素对象并将元素对象存储为组件属性了

```js
if(virtualDOM.props && virtualDOM.props.ref) {
  virtualDOM.props.ref(newElement)
}
```



### key 属性

#### 节点对比

​	实现思路是在两个元素进行比对时，如果类型相同，就循环旧的DOM元素的子元素，查看其身上是否有key属性，如果有就将这个子元素的DOM对象存储在一个JS对象中，接着循环要渲染的vdom的子元素，在循环过程中获取到这个子元素的key属性，然后使用这个key属性到JS对象中查找DOM对象，如果能找到说明这个元素是已经存在的，是不需要重新渲染的。如果通过key属性找不到这个元素，就说明这个元素是新增的是需要渲染的

#### 节点卸载

​	在比对节点的时候，如果旧节点的数量多于要渲染的新节点的数量就说明有节点要被删除了，继续判断keyedElements对象中是否有元素，如果没有就用索引的方式删除，如果有就要使用key比对的方式删除。

​	实现思路是循环旧节点，在循环旧节点的过程中获取旧节点对应的key属性，然后根据key属性在新节点中查找这个旧节点，如果找到就说明这个旧节点没有被删除，如果没有找到，就说明节点被删除了，调用卸载节点的方法卸载节点即可

​	卸载节点并不是直接删除就可以了，还需要考虑一些情况

1. 如果是文本节点可以直接删除
2. 如果是组件，则还需调用其生命周期函数
3. 如果包含了其他组件生成的节点，需要调用其他组件的卸载生命周期函数
4. 如果有ref，删除通过ref属性传递给组件的DOM节点对象
5. 如果有事件，需要删除事件对应的事件处理函数



## Fiber

### requestIdleCallback

​	利用浏览器的空余时间执行任务，如果有更高优先级的任务要执行时，当前执行的任务可以被终止。

```js
function calc(deadline) {
  // deadline.timeRemaining() 获取浏览器的空余时间
  if(deadline.timeRemaining() > 1) {
    ...
  }
  requestIdleCallback(calc) // 如果有更高优先级的事情会打断，所以需要重新执行
}
requestIdleCallback(calc)
```

​	因为每一帧画面被分到的时间是16ms，而实际上不需要这么多，就会有一些剩余的时间



### 实现Fiber算法

​	利用浏览器的空余时间来执行DOM的比对过程，virtualDOM的比对不会长期占用主线程了，如果有高优先级的任务要执行，就会暂时终止virtualDOM的比对过程，先去执行高优先级的任务。然后再回过头继续执行vdom的比对任务，这样页面就不会发生卡顿现象了。

​	由于递归需要一层一层进入，一层一层退出，这个过程不能中断，所以如果要实现任务的终止再继续就必须放弃递归，只采用循环来执行比对的过程，因为循环是可以终止的，只要将循环的条件保存下来，下一次任务就可以继续从中断的地方继续执行了。

​	如果任务要执行中断再继续，任务的单元就必须要小，这样的话即使任务没有执行完就被终止了，重新执行任务的代价就要小很多，所以我们要做任务的拆分，将一个大的任务拆分成很多小的任务来执行，virtualdom的比对任务要如何进行任务拆分呢，以前是将整颗virtualdom树的比对看成是一个任务，现在我树中每一个节点的比对看成一个任务，这样一个大的任务就被拆分成一个个小的任务了。

​	为了实现任务的终止再继续，将DOM比对的算法拆分成了两个部分，第一部分就是vdom对象的比对，第二部分是真实dom的更新，其中vdom对象的比对过程是可以终止的，真实dom的更新是不可以终止的，具体过程这样的：在编写用户界面的时候仍然使用jsx，babel会将jsx转换为React.createElement方法的调用，在调用后会返回vdom对象。接下来就可以执行第一个阶段了，就是构建Fiber对象，采用循环的方式从virtualdom对象当中找到每一个内部的vdom对象，为每一个vdom对象构建fiber对象，也是js对象，是从vdom对象演化来的，除了type，props和children以为还存储了更多的信息，其中有一个核心的信息就是当前节点要执行的操作，比如你是想删除这个节点呢还是想更新这个节点，还是新增这个节点，当所有节点的fiber对象构建完成之后，还要将所有的fiber对象存储在一个数组中，接下来就可以执行第二个阶段的操作了，就是循环fiber数组，在循环的过程当中，根据fibe对象存储的当前节点要执行的操作的类型将这个操作应用在真实dom对象上，这就是一个大概流程



# ^_^

框架的架构

```js
// index.js
import createElement from './xxx'
import render from './xxx'

export default {
  createElement,
  render
}
```

​	这样框架的使用者就可以方便的使用框架的方法了