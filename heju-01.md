# React-Router

​	route要写在Router里面，因为要用到history，location这些都来自router

## Browser和Hash

1. 使⽤用 HTML5 提供的 history API (pushState, replaceState 和 popstate 事件) 来保持 UI 和 URL 的同步。
2. 使⽤用 URL 的 hash 部分（即 window.location.hash）来保持 UI 和 URL 的同步。

​    注意：hash history 不支持 location.key 和 location.state。在以前的版本中，我们曾尝试 shim 这种行为，但是仍有一些边缘问题无法解决。因此任何依赖此行为的代码或插件都将无法正常使⽤用。由于该技术仅 ⽤用于支持旧浏览器，因此我们鼓励大家使用 <BrowserHistory> 

​	HashRouter简单，不不需要服务器器端渲染，靠浏览器器的# 的来区分path就可以，BrowserRouter需要服务器器端对不不 同的URL返回不不同的HTML，后端配置可参考。BrowserHistory切换路由的时候每次会刷新一下，是不是相当于给后端发了一个请求，如果后台没有做处理的话是不是会404



## basename

​	所有URL的base值。如果你的应⽤用程序部署在服务器器的⼦子⽬目 录，则需要将其设置为⼦子⽬目录。basename 的格式是前⾯面有 一个/，尾部没有/

​	其实就是加一个前缀嘛

```jsx
<BrowserRouter basename="/kkb">  
    <Link to="/user" /> 
</BrowserRouter>
```





## Route渲染方式

​	**Route渲染优先级**：children>component>render。这三种⽅方式互斥，你只能用⼀种。三者能接收到同样的[route props]，包括match, location and history，但是当不匹配的时候，children的match为 null

​	**children**和**render**使用方式一样，只不过children不管有没有匹配到都显示

​	**component**的话其实也可以用函数的方式写，但是这样不好`<Route component={()=><child />}>`，这样的话组件更新的时候会不停的挂载卸载。因为渲染component的时候会调用React.createElement，如果使用下面这种匿匿名函数的形 式，每次都会生成一个新的匿名的函数，导致生成的组件的type总是不相同，这个时候会产生重复的卸载和挂载。为什么type值不同，因为它是匿名函数，两个匿名函数怎么能相同呢

​	当你⽤component的时候，Router会用你指定的组件和 React.createElement创建一个新的[React element]。这意 味着当你提供的是一个内联函数的时候，每次render都会创建一个新的组件。这会导致不再更更新已经现有组件，而是直接卸载然后再去挂载一个新的组件。因此，当⽤用到内联函数的内联渲染时，请使⽤用render或者children。

## 动态路由	

**动态路由**也是可以嵌套的 

```jsx
<Route path="/search/:id" component={Search} />
<Route path={"/search:" + id + "/detail"} component={ Detail } />
```

## 路由守卫

**路由守卫 - 去某个页面如果没登陆就去登录 - 登录完去到对应的页面**

```jsx
<PrivateRoute path="/user" component={UserPage} />

export default class PrivateRoute extends Component {
  const {isLogin, path, component} = this.props
	if (isLogin) {
      return <Route path={path} component= {component} />
    } else {
      return <Redirect to={{pathname: '/login', state: {redirect: path}}}/>
    }
}

export default class LoginPage extends Component {  
  render() {    
    const { isLogin, location } = this.props
    const { redirect = '/' } = location.state // 给redirect一个默认值
    if(isLogin) {
      return <Redirect to={redirect}/>
    } else {
        return <h1>LoginPage</h1>
    }
  }
}
```



```jsx
<PrivateRoute path="/user" component={User} />

class PrivateRoute extends Component {
        
}
class LoginPage extends Component {

}

```

​	路由守卫，也是一个高阶组件，因为你会接收到path和component，如果登录就跳到对应的页面，否则就重定向到登录页并带上路由的信息，因为你还要跳回来。登录页逻辑，当你重定向到登录页的时候依旧会带上参数，没有的话就给个默认值，登录成功返回原有路由，否则即在登录页做操作

​	路由守卫，拿到路由信息以后判断是否登录从而判断是否要去登录页面，

​	登录页，依旧拿到路由信息判断是否登录从而判断是否要去重定向页面









## 手写Router

```jsx
<BrowserRouter>
  <Route path='/user' component={User} />
  <Link to="/user" />
</BrowserRouter>
```



### BrowserRouter

```jsx
import { createBrowserHistory } from "history"
const RouterContext = React.createContext()

export class BrowserRouter extends Component {
  constructor(props) {
    super(props)
    this.history = createBrowserHistory()
    this.state = {
      location: this.history.location
    }
    this.unlisten = this.history.listen(location => {
      this.setState({
        location
      })
    })
  }
  componentWillUnMount() {
    if(this.unlisten) { this.unlisten() }
  }
  render() {
    return (
      <RouterContext.Provider value={{history: this.history, location: this.state.location}>
         {this.props.children}  
      </RouterContext.Provider> 
    ) 
  }
}
```



### Route

```jsx
export class Route extends Component {
  render() {
    return (
      <RouterContext.Comsumer>
        {
          context => {
            const { path, component, children, render } = this.props
            // const match = context.location.pathname === path
            const location = this.props.location || context.location
            const match = matchPath(location.pathname, this.props)
            const props = {
              ...context,
              location,
              match
            }
            return (
              match ?
                (children ? (typeof children === 'function' ? children(props) : children)
                  : (component ? (React.createElement(component, props))
                    : (render ? render(props) : null)))
                : (typeof children === 'function' ? children(props) : null)
            )

            // return match ? React.createElement(component, this.props) : null 
          }
        }
      </RouterContext.Comsumer>
    )
  }
}
```







### Link

```react
export class Link extends Component {
  static contextType = RouterContext
  handleClick = (e) => {
    const { history } = this.context
    e.preventDefault() // 阻止默认行为，因为页面会刷新
    history.push(this.props.to)
  }
  render() {
    return <a href={this.props.to} onClick={this.handleClick}>this.props.children</a> 
  }
}
```

**BrowserRouter**

​	利用context提供history，渲染children

**Route**

​	当location.pathname与当前path相同时渲染component（createElement）

**Link**

​	返回a标签，href是就是to，同时阻止默认事件并通过history.push去对应的页面。渲染children













# React原理

## 虚拟dom

其实就是一个js对象，这个js对象表示了当前的UI，也就是DOM信息和结构。当状态变更的时候，重新渲染这个JS对象结构。并通过如ReactDom等类库使之与真实dom同步











