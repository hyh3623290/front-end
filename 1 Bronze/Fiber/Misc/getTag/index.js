import { Component } from "../../Component"

const getTag = vdom => {
  if (typeof vdom.type === "string") {// div span
    return "host_component"
  } else if (Object.getPrototypeOf(vdom.type) === Component) {// 构造函数
    return "class_component"
  } else {
    return "function_component"
  }
}
export default getTag
