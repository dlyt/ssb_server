# ssbServer 开发环境搭建


## Redis 和 MySQL

在 Linux 和 OS X 下，这两个东西可以通过软件管理工具(apt-get, pacman, yum, brew 等)自动下载并安装。

安装完启动 Redis 和 MySQL，通常 Redis 监听在 6379 端口，MySQL 监听在 3306 端口，我们不用修改这个。

Ubuntu 通常通过 `service redis start` 之类的方式启动服务，ArchLinux、Debian 等 systemd 系统通常使用 `systemctl start redis` 之类的方式。

一般情况 redis mysql 安装后都会自动启动 不需要手动启动  

MySQL 需要建立名为 saishibao 的库

## Node.js 环境搭建

推荐使用node 6.x

包管理器 使用 cnpm 或者 npm 都可以, 推荐npm


## 安装项目的依赖,及des40私有算法(用于序列号生成)

```
$ cd ssbServer
$ npm install
$ cd ./utility/des40
$ npm install --unsafe-perm=true
```

在大量的下载后，整个项目的依赖库都将下载完毕。

## 安装pm2 管理工具

```
$ npm install pm2 -g
```

## 启动

```
# 在前端服务器启动前端
$ cd ssbServer
$ pm2 start ./bin/frontend.json
```

```
# 在后端服务器启动后端
$ cd ssbServer
$ sudo pm2 start ./bin/backend.json
# 注:80端口要root权限
```
目前前后端代码是一样的, 唯一的区别是后端是用来接收微信支付通知的回调,   
在./conf/wechat.js 文件下reply 是设置微信支付成功的回调路由,这个路由就是指向后端ip 当微信支付成功后, 由微信调用此接口,进行通知  


至此，开发环境搭建已经结束。

## 停止

```
$ pm2 stop
```

## 日志及监控

```
$ pm2 monit
```

日志存储路径按天, 服务器存储
访问日志路径:
logs/access/${服务器名}/log

工作日志路径:
logs/work/${服务器名}/log

## 使用的主要技术概述

### Node.js

Node.js 是一个使用 JavaScript 编写服务端软件的环境。因为大量的 I/O 都是基于 JavaScript 的事件机制，所以这些 I/O 都是非阻塞的、异步的，所以这使得 Node.js 的性能对于平时的脚本语言来说相当好。Node.js 原生提供了 http 库，并且可以创建 http 服务器，以至于大家都使用 Node.js 来编写 http 服务器。

具体文档参考[官方文档](https://nodejs.org/en/docs/)。

### Sequelize

Node.js ORM 库，参考[官方文档](http://docs.sequelizejs.com/en/latest/)。

### ECMAScript 2016

nodejs 5.x 支持 es6有限 需要启动命令加 --harmony_destructuring 等参数才可使用
nodejs 6.x 不需要加参数,加了参数反而不能启动

+ 使用 class

```js
class A extends B {
  // 构造函数
  constructor() {
    // super()
  }
  foo() {

  }
  bar() {

  }
}
```

+ 使用 Arrow Function

```js
function func(a, b, c) {

}
// ==>
func = (a, b, c) => {

}
```

+ 使用 Promise，Generator

对于 JavaScript 的各种异步控制，可以看[这篇文章](http://zhuanlan.zhihu.com/p/19750470)入门。

提供一个服务端的异步控制方式，使用 bluebird 库和 Generator Function。

本服务端使用 lightco 库, 使用该库需要掌握 Promise，Generator 相关知识

lightco 支持回调 和 Promise，Generator

这类异步控制大量优化了 Node.js 原先的控制流（callback），务必掌握。

回调函数例子

```js
var [error, data] = yield fs.readFile('index.js', 'utf8', $)
```
将 $ 作为原函数的回调函数传入, 然后 用yield 关键字
返回的值 用 es6 新特性--数组析构来赋值

Promise 例子

```js
var [error, data] = yield query(true)
```

query 是一个函数 他返回一个 Promise  
lightco 将过程中发生的错误 作为第一个参数, 正常返回的值 作为第二个参数


详细请参考 https://www.npmjs.com/package/lightco


+ 使用字符串模板

```js
const world = '世界'
console.log(`Hello, ${world}`) // => Hello, 世界
```

+ 使用可计算的 Object Property

```js
const key = 'hahahlolo'
const obj = {
  [key]: 'biubiubiu'
}
// obj = {hahahlolo: 'biubiubiu'}
```

+ 解构

```js
const a = [1, 2, 3]
const b = [...a, 4, 5] // [1, 2, 3, 4, 5]
const c = {
  a: 1
}
const d = {
  ...c,
  b: 2
} // {a: 1, b: 2}
```

+ let, const

`let` 为块级作用域，`const` 为常量（定义后不可改变变量实际引用的对象）。


## 目录及其用途

+ ./bin

存放启动文件， 用于配置服务端口，ID，名字，等  
其中 服务器端口号 要与 nginx 反向代理连接的端口号一一对应，
服务器ID 生成订单等不唯一id 时也要用到

+ ./conf
存放服务器配置文件  

./conf/cert 赛事宝微信证书  

./const.js 一些常量 比如查询返回数量限制等

./db.js 数据库配置  

./log.js 日志的配置

./promise.js 与客户端约定的状态码  

./sms.js 短信接口的配置  

./user.js 用户的配置 token和密码盐, 加密函数及弱密码验证函数

./webcache.js web缓存相关配置  

./wechat.js 微信赛事宝秘钥设置，微信请求url

 + ./models
 数据表定义

./models/index.js 内设置数据库密码及登陆的数据库


+ ./routes  
api 所有路由  
./routes/casino 俱乐部  
./routes/notify  付款通知回调  
./routes/order 订单  
./routes/texas  比赛  
./routes/ticket  门派  
./routes/user  用户  

+ ./servies  
与业务无关的服务  
./servies/wechat  微信相关服务  
./servies/cache  缓存服务 包含一个webcache 中间件  
./servies/sms 短信服务   
./servies/token  认证服务 包含一个 token 中间件

+ ./unify  
与业务有关的服务  
./unify/order  订单刷新查询等。  
./unify/payment  支付记录刷新等  
./unify/product  产品相关，序列号生成及验证  

+ ./utility  
常用工具集
./utility/des40 私有des40加密算法
