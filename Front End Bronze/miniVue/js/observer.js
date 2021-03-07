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