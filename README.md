# logDb
## 前言：
### 为什么要有logDb？
  * 难以复现的用户问题无处排查？  要是能有当时操作日志就好了。
  * 用户客户端不能打开控制台？ 看眼输出都这么难！  能不能不要怎么麻烦（抓狂）！！
  * 上线后有bug，报错影响使用了！ 要等用户反馈才能知道？  有错误上报多好，好怕P0事故~~
  * 亲有时间吗麻烦把有问题的操作流程给我演示遍.... 解决客户问题卑微又没效率。

兄弟们，你们工作中是否经常遇见以上痛点？   现在，解决上述问题的轮子来了， 这就是 logDb，  集合日志持久化保存|分析、 页面录制、 错误上报、虚拟控制台等功能于一体的npm依赖。  

### 特点
  * 无感知： logDb客户端将用户的数据都存储在浏览器indexDb中。  在用户使用过程中，logDb只会进行插入操作，这对客户端性能影响微乎其微[@性能测试报告](https://gykj.yuque.com/docs/share/161c41f4-4b27-4d97-a41d-e7c6f2b3bc0a)。
  * 轻量： 依赖大小仅100kb (还有优化空间)
  * 使用十分简单， 带有可视化界面， 下面介绍。

## 使用
### 1.安装
```
npm i @kdzs/loggerdb -save
```
### 2.初始化
```
  import kdzs_logdb from '@kdzs/loggerdb';
  window.logDb = new kdzs_logdb(option);   // 挂载到window上，方便能在控制台中使用
```
##### option[object]

|参数|说明|类型|默认值|版本|
|  ----  | ----  | ----  | ----  | ----  |
|expirationTime|保存日志的天数|number|2||
|isEmit|是否在控制台打印日志|bool|true||
|roomId|使用在线展示页需要的id|string|非必传|2.0+|
|consoleReplace|使用console的同时也会记录日志，  该选项为true时，isEmit会置为FALSE|bool|false|2.0+|
|serveUrl|远程的socket.io的url|string|非必传|2.0+|

### 3.API
|方法|说明|参数|版本|
|  ----  | ----  | ----  | ----  |
|log| 日志存储，传参数量>=1时，arguments[0]类型为string且少于20时，会将该参数作为类型存储 | console.log一致 ||
|get| 获取时间段内的所有数据 | 参数1： start 【日期字符串|日期对象|时间戳】开始时间，不传则从最初始开始查、 end  【日期字符串|日期对象|时间戳】结束时间，不传则截止到最后一条 ||