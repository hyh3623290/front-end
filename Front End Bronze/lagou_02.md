[TOC]

# Redux

## createStore

```js
const store = createStore(reducer)
// 第一个参数是reducer，第二个参数是store的初始值，会传给reducer的第一个参数
// 所以action是在store里接收的，我一直以为是在reducer接收的
// store接收action并将action分发给reducer

// 其实就是传给store，store内部会调用reducer，再把action发给reducer
```



## reducer

```js
var initialState = {
  count: 0
}
function reducer(state = initialState, action) {
  switch(action.type) {
    case 'increment':
      return { count: state.count + 1 }
    default:
      return state
  }
  return state
}
// 第一个参数就是createStore的第二个参数
```



## action

```js
store.dispatch({ type: 'increment' })
// 会传给reducer的第二个参数
```



## subscribe

```js
store.subscribe(() => {
  console.log(store.getState())
})
```





## React + Redux

​	就多了两个：Provider 和 connect

### Provider

```jsx
<Provider store={store}>
	<App />
</Provider>
```

### connect

1. connect 帮助我们订阅store，当store中的状态发生改变时，帮我们重新渲染组件
2. 让我们获取store的状态，将状态通过组件的props属性映射给组件
3. 让我们获取dispatch

```js
const mapStateToProps = state => ({
  // 要返回一个对象，会映射到props上，不管写啥都可以，比如随便写个a:'123',也可以通过props.a拿到
  count: state.count
})

const mapDispatchToProps = dispatch => ({
  // 这个方法主要帮我们简化代码，实质就是把返回的对象映射到props属性当中
  // props.increment
  increment() {
    dispatch({ type: 'increment' })
  },
  decrement() {
    dispatch({ type: 'decrement' })
  }
})
export default connect(mapStateToProps, mapDispatchToProps)(Counter)
```

### bindActionCreators

​	上面 increment 和 decrement 中的 dispatch 是重复性代码

```js
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
    increment() {
      return { type: 'increment' }
    }
  }, dispatch)
})
```

​	新建文件进行进一步的抽离

```js
// store/actions/counter.action.js
export const increment = payload => ({ type: 'increment', payload })
export const decrement = payload => ({ type: 'decrement', payload })
export const increment_async = (payload) => dispatch => {
  setTimeout(() => {
    dispatch(increment(payload))
  }, 2000)
}

// CounterComponent.js
import * as counterActions from './store/actions/counter.action.js'

const mapDispatchToProps = dispatch => bindActionCreators(counterActions, dispatch)
```

​	bindActionCreators 返回的就是一个对象



### 拆分reducer

​	在reducers文件夹下新建root.reducer.js

```js
import { combineReducers } from 'redux'

// { counter: { count: 0 }, modal: { show: false } }
export default combineReducers({
  counter: CounterReducer,
  modal: ModalReducer
})

// 所以现在要用state.modal.show来获取
const mapStateToProps = state => ({
  count: state.counter.count
})
```



## 中间件

​	本质上就是一个函数，通过这个函数拓展和增强redux应用程序。体现在对action的处理能力上，以前是直接给reducer处理，现在action会优先被中间件处理。

### 开发redux中间件

​	模板代码

```js
export default store => next => action => {}
```

​	它是一个函数，要求我们再返回一个函数，之后再返回一个函数，在最里面的函数可以执行自己的业务逻辑，最外层的函数给我提供了一个参数是store，最里面的参数是action，中间的函数提供了一个next，它是一个函数，当我们处理完action后要调用这个next，目的是把当前的action传递给reducer，或者说下一个中间件

```js
// middleware/logger.js
export default function() {
  return function(next) {
    return function(action) {
      console.log(action)
      next(action)      
    }
  }  
}
// 上面的写法等价于
export default store => next => action => {
  console.log(action)
  next(action)
}

// 手写thunk
1. 当前这个中间件不关心你想执行什么样的异步操作
2. 如果是异步，那你给我传个函数，如果是同步，给我传个正常action
3. 异步代码要写在你传递的函数中
4. 我调用你的时候会把dispatch传给你

export default store => next => action => {
  if(typeof action === 'function') {
    return action(dispatch)
  }
  next(action)
}
```



### 注册

```js
createStore(reducer, applyMiddleware(logger, test))
// 执行顺序是从左往右
```



### 常用中间件

#### redux-thunk

#### redux-saga

​	更加的强大：可以将异步操作从 Action Creator 文件中抽离出来，放在一个单独的文件中，这样项目代码就更加的可维护了。

```js
import createSagaMiddleware from 'redux-saga'
const sagaMiddleware = createSagaMiddleware()

createStore(reducer, applyMiddleware(sagaMiddleware))

// 接下来引入下面这个saga文件，把名字传入run方法里
sagaMiddleware.run(sagaName)
```

​	可以创建一个单独的文件来写异步代码了

```js
import { takeEvery, put } from 'redux-saga/effects'

function *increment_async_fn(action) {
  const { data } = yield axios.get('api')
  yield put(increment(action.payload)) // 执行完异步在这里派发一个同步的action
}

export default function *postSaga() {
  // 接收action
  yield takeEvery(INCREMENT_ASYNC, increment_async_fn)
}
```

1. takeEvery 这个方法是用来接收action的
2. put 用来触发另一个 action 的，就跟 dispatch 一样
3. 要求我们默认导出一个generator函数





​	拆分saga，在sagas文件夹下新建root.saga.js

```js
import { all } from 'redux-saga/effects'
import counterSaga from './counter.saga.js'
import modalSaga from './modal.saga.js'

// 依旧需要导出一个generator函数
export default function *rootSaga() {
  
  yield all([
    counterSaga(),
    modalSaga()
  ])
}
```

​	然后需要引入的就是这个saga文件，再把引入的内容放到 `sagaMiddleware.run()` 参数里



## redux-actions

​	帮助我们简化actions代码和reducer代码，因为redux流程中大量的样板式代码读写很痛苦，比如创建大量的 action creator 函数，比如我们把action的type抽象成独立的常量，比如ruducer中通过switch case处理action

```js
// counter.action.js
import { createAction } from 'redux-actions'

// 帮助我们创建action creator函数
export const increment = createAction('increment') // type值, 顺便也不需要常量了
export const decrement = createAction('decrement')
```



```jsx
// Component.js
<Button onClick={props.increment}/>
  
<Button onClick={() => { props.increment(10) }}/>
```



```js
// reducers/counter.reducer.js
import { handleActions as createReducer } from 'redux-actions'

function handleIncrement(state, action) {
  return {
    count: state.count + action.payload // 中间件自动加，不用写在createAction里
  }
}

function handleDecrement(state, action) {
  return {
    count: state.count - 1
  }
}

export default createReducer({
  [increment]: handleIncrement,
  [decrement]: handleDecrement
}, initialState)
```



## shopingCart 案例

​	redux 3， 53分





# Hooks

​	16.8 新增，对函数型组件进行增强，让函数型组件可以存储状态，能够处理副作用

​	只要不是把数据转换为视图对就是副作用，比如获取dom元素，为dom元素添加事件，设置定时器及发送Ajax请求



## 类组件的不足

1. 缺少逻辑复用机制

   渲染属性和高阶组件代码比较复杂，虽然复用逻辑，但都是在原有组件的外层又包裹了一层组件，又没有实际的渲染效果，层级过深变得十分臃肿，增加调试过程的难度，也降低了组件运行的效率

2. 类组件经常会变的很复杂，难以维护

   体现在生命周期函数当中，将一组相干的逻辑拆分到不同的生命周期函数中（比如挂载之后做个什么事，更新之后做个什么事），或者在一个生命周期中存在多个不相干的逻辑

3. 不能够保证this指向的正确性

   当我们给一个元素绑定事件，在事件处理函数当中我们去更改状态的时候，通常要更正函数内部的this指向，否则就会指向undefined，也使得类组件难以维护，而且代码看起来比较复杂



## useState

```jsx
const [ count, setCount ] = useState(0);

// 如果初始值是动态的也可以传一个函数，如,适用于只需要组件第一次执行的时候
// 因为里面的函数只会被执行一次，后续重新渲染的时候不会执行
const [ count, setCount ] = useState(() => {
  return props.count || 0
});

<button onClick={() => { setCount(count + 1) }}></button>

// 也可以传回调，因为是异步的，如果依赖这个新的值就要放到回调中
setCount(count => {
  return count + 1
})
```

​	

### 手写 useState

```jsx
// useState可以多次调用，所以state和setters里应放数组
let state = []
let setters = []
let stateIndex = 0

function createSetter(index) {// 闭包保存了index
  return function(newState) {
    state[index] = newState
    render()
  }
}

function useState(initialValue) {
  // 重新渲染会重新执行，如果之前已经存过state就使用以前的
  state[stateIndex] = state[stateIndex] ? state[stateIndex] : initialValue
  setters.push(createSetter(stateIndex))//stateIndex通过闭包保存下来
  let value = state[stateIndex]
  let setter = setters[stateIndex]
  stateIndex++
  return [value, setter]
  // 所以每调用一次，就可以解构出对应的值和方法
}

function render() {
  stateIndex = 0
  effectIndex = 0
  ReactDOM.render(<App />, document.getElementById('root'))
}
```







## useReducer

​	另一种让函数组件保存状态的方式

```js
function reducer(state, action) {
  switch(action.type) {
    case 'increment':
      return state.count + 1
    default:
      return state
  }
  return state
}
```

```js
const [count, dispatch] = useReducer(reducer, 0) // 0是初始值
onClick={() => dispatch({ type: 'increment' })}
```

​	有什么好处呢？这个组件的某一个组件想改变上面的这个count值，我们就不需要传递多个修改数据的方法了，比如上面这个让数值加一的方法，让数值减一的方法，我们可以把dispatch传递给子组件，子组件通过dispatch触发任意action来修改状态

### 手写 useReducer

````js
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState)
  function dispatch(action) {
    const newState = reducer(state, action)
    setState(newState)
  }
  return [state, dispatch]
}
````



## useContext

​	简化跨组件层级获取数据的代码

```jsx
const countContext = createContext()
function App(){
  return <countContext.Provider value={100}>
  	<Foo />
  </countContext.Provider>
}
function Foo() {
  const count = useContext(countContext)
  // 可以直接使用count
}
```



## useEffect

### 模拟生命周期

​	让函数型组件拥有处理副作用的能力，类似于生命周期函数

```js
useEffect(() => {}) // didMount, didUpdate
useEffect(() => {}, []) // didMount
useEffect(() => () => {}) // unMount
```

1. 可以按照用途对代码进行分类，不同的用途放到不同的useEffect
2. 通常情况下挂载完成和更新完成时的代码一般是一样的，我们通过分类可以简化重复代码，使组件内部代码更加清晰，不用写两份在didMount和didUpdate了



### 数据监测

```js
useEffect(() => { 
	...
}, [count])
```



### 异步操作

​	useEffect 中的参数不能是异步函数，因为useEffect要返回清理资源的函数，如果是异步函数就变成了返回promise

```js
useEffect(() => {
  (async () => {
    await axios.get()
  })()
})
```



### 手写 useEffect

```js
let prevDepsAry = []
let effectIndex = 0

function useEffect(callback, depsAry) {
  if(Object.prototype.toString.call(callback) !== '[object Function]') {
    throw new Error('必须是函数')
  }
  if(typeof depsAry === 'undefined') {
    callback()
  } else {
    if(Object.prototype.toString.call(depsAry) !== '[object Array]') {
      throw new Error('必须是数组')
    }
    let prevDeps = prevDepsAry[effectIndex]
    let hasChanged = prevDeps ? depsAry.every((dep, index) => dep === prevDeps[index]) === false : true
    if(hasChanged) {
      callback()
    }
    prevDepsAry[effectIndex] = depsAry
    effectIndex++
  }
}
```

```js
function render() {
  stateIndex = 0
  effectIndex = 0
  ReactDOM.render(<App />, document.getElementById('root'))
}
```





## useMemo

​	非常类似于Vue中的计算属性，可以监测某个值的变化，根据变化值计算新值

​	它会缓存计算结果，如果监测值没有发生变化，即使组件重新渲染，也不会重新计算。此行为可以有助于避免在每个渲染上进行昂贵的计算

```js
const result = useMemo(() => {
  // 如果count值发生变化，此函数重新执行, 返回值会给到外面result
  return count * 2
}, [count])
```



## memo 方法

​	父组件数据变化重新渲染，则子组件也会重新渲染

​	性能优化，如果本组件中的数据没有发生变化，阻止组件更新，类似PureComponent 和 shouldComponent

```js
export default memo(ComponentName)

memo(function Foo(props){
  ...
})
```



## useCallback

​	性能优化，缓存函数，使组件重新渲染时得到相同的函数实例

​	可能会遇到这种问题，用memo包裹了一个组件，按道理来说这个组件props不变就不会重新渲染了，但是父组件如果给它传一个函数，父组件每次重新渲染都会生成一个新的函数，就导致memo组件也会每次都重新渲染，就失去了memo的作用。

```js
const resetCount = useCallback(() => setCount(0), [setCount])
// 只有setCount变化时才会得到一个新的resetCount
<Foo resetCount={resetCount}/>
```



以上所有的方法都是从react里引入

```js
import { xxx } from 'react' 
```



## useRef

​	获取dom元素对象

```js
function App(){
  const username = useRef()
  return <input ref={username}/>
}
// username.current
```

​	第二个作用是可以用来保存数据，但是跟useState不同，数据更改不会触发组件重新渲染，组件重新渲染，保存的数据仍然还在。可以保存一些程序运行过程中用来辅助的数据

```js
function App() {
  const [count, setCount] = useState(0)
  let timerId = useRef() // @1
  useEffect(() => {
    timerId.current = setInterval(() => {
      setCount(count => count + 1)
    }, 1000)
  }, [])
  const stopCount = () => {
    clearInterval(timerId.current)
  }
  // 调用stopCount停止计数器
  // 当timerId在 @1 处设为null时，发现每次setCount导致组件重新渲染
  // 也就导致timerId每次在stopCount中都为null，无法清除
}
```





## 自定义 Hook

​	目的就是在组件之间实现逻辑共享

```jsx
function useGetData() {
  const [post, setPost] = useState()
  useEffect(() => {
    axios.get('xxx').then(res => setPost(res.data))
  }, [])
  return [post, setPost]
}

function App() {
  const [post, getPost] = useGetData()
  return <div>{post.agencyCode}</div>
}

// 其他组件只需要直接使用 useGetData 就可以了
```



​	另一个例子，封装表单的value和onChange

```jsx
function useUpdateInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  return {
    value,
    onChange: event => setValue(event.target.value)
  }
}

function App() {
  const userNameInput = useUpdateInput('')
  const passwordInput = useUpdateInput('')
  return (
    <form>
      <input type="text" name="username" {...useUpdateInput}/>
      <input type="password" name="password" {...passwordInput}/>
    </form>
  )
}
```



## React 路由 Hooks

react-router-dom提供的钩子函数

```js
import { useHistory, useLocation, useRouteMatch, useParams } from 'react-router-dom'

function App(props){
  // 以前都是用props获取的
  console.log(props)
  // 现在可以直接这么获取
  console.log(useHistory())
}

```





# ^_^

2.28（开始）