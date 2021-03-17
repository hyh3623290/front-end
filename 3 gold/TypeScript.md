void，null，undefined，object

数组

元祖

枚举

标准库

# 类型系统

​	TypeScript为我们提供了强大的类型系统

```js
const a: void = undefined // 表示没有返回值的，也可以用在函数上，一般只能存放undefined（严格）
const b: null = null
const c: undefined = undefined
const d: object = {} // [], function, 非原始值都可以
const obj: { a:number, b: string} = { a: 1, b: '2' }
// 当然设置对象更专业的是接口类型
```

## 数组类型

```js
const arr1: Array<number> = [1, 2, 3]
const arr2: number[] = [1, 2, 3]
```

1. 比如我们写个sum函数会加很多typeof之类的判断，有了ts就不用了

## 元祖类型

​	数组的弊端是类型必须相同，元祖是一个明确元素数量和类型的数组

```js
const tuple: [number, string] = [1, '1']
```

## 枚举类型

​	比如一般用0，1，2之类的描述某种状态

```js
// 以前这样
const status = {
  male: 1,
  female: 0
}
// 枚举类型
enum status {
  male = 1,
  female = 0
}
const person = {
  ...,
  gender: status.male
}
```

## 函数类型

```js
function fn(a: number, b?: number): string { }
```

32



## 标准库

​	指的是内置对象所对应的声明	

```js
const d:symbol = Symbol() 
// 这么写只有把配置文件的target设置为es2015才不会报错

// 或者引用标准库
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["ES2015", "DOM"]
  }
}
```









