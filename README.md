# logDb
## 前言：
### 为什么要有logDb？
  * 难以复现的用户问题无处排查？  要是能有当时操作日志就好了。
  * 用户客户端不能打开控制台？ 看眼输出都这么难！  能不能不要怎么麻烦（抓狂）！！
  * 上线后有bug，报错影响使用了！ 要等用户反馈才能知道？  有错误上报多好，好怕P0事故~~
  * 亲有时间吗麻烦把有问题的操作流程给我演示遍.... 解决客户问题卑微又没效率。

兄弟们，你们工作中是否经常遇见以上痛点？   现在，解决上述问题的轮子来了， 这就是 logDb，  集合日志持久化保存|分析、 页面录制、 错误上报、虚拟控制台等功能于一体的npm依赖。  

### 特点
  * 无感知： logDb客户端将用户的数据都存储在浏览器indexDb中。  在用户使用过程中，logDb只会进行插入操作，这对客户端性能影响微乎其微[@性能测试报告](https://gykj.yuque.com/docs/share/161c41f4-4b27-4d97-a41d-e7c6f2b3bc0a)。 开发原则是对用户体验0影响
  * 轻量： 依赖大小仅100kb (还有优化空间)。
  * 通用： 原生js实现，不分技术栈，web端通用。
  * 简单： 引入即用0配置，api简单， 带有可视化界面， 下面介绍。

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
##### `option`[object]

|参数|说明|类型|默认值|版本|
|  ----  | ----  | ----  | ----  | ----  |
|expirationTime|保存日志的天数,超出的历史日志将会被清除|number|2||
|isEmit|调用logDb.log时是否在控制台打印日志|bool|true||
|roomId|使用在线可视化页需要的id|string|非必传|2.0+|
|openRecord|启用页面录屏，为true时，录屏相关api才能正常使用|bool|false|2.0+|
|useErrStytem|使用报错捕获系统（报错录屏，错误上报）,为true时，openRecord置为false|bool|false|2.0+|
|serveUrl|服务器的socket.io的地址|string|非必传|2.0+|

<!-- |consoleReplace|使用console来记录日志，  该选项为true时，isEmit会置为false|bool|false|2.0+| -->


### 3.API
 ####  * logDb.log

说明： 将传参作为日志存储起来。 

可用版本： 1.0+

传参：没有数量和类型限制。 最终会将所有传参转成字符串，拼接后保存。  
* 当参数数量>1时，若arguments[0]类型为string且少于20字符时，会将arguments[0]作为错误类型存储。

 ####  * logDb.getDate

说明： 返回以日期为维度的所有日志（可以在控制台调用返回日志，适合数据量不大时使用）

传参： (`dateString`)

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|dateString|传入指定日期字符如"2022-03-28",不传则会返回所有日期的数据|string\undefined|非必传|

####  * logDb.get

说明： 获取时间段内的所有数据 （可以在控制台调用返回日志，当数据过多时会导致控制台卡死时，需要缩小时间范围降低数据量）

可用版本： 1.0+

传参：不传则获取所有数据，可传：(`start,end`)    

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|start|开始时间，不传则从最初始开始查|日期字符串\日期对象\时间戳|undefined|
|end|结束时间，不传则截止到最后一条|日期字符串\日期对象\时间戳|undefined|

####  * logDb.openOnline

说明： 启用在线可视化页面,控制台会打印url地址

* `cltr+F12` 快捷键启用
* `cltr+F11` 快捷键启用， url地址将通过alert输出

可用版本： 2.0+

传参： (`serveUrl`)

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|serveUrl|服务器的soket.io地址|string|可不传|

#### * logDb.errorRegister（待开发）

说明： 错误登记，  传入的错误信息将会收集整理上传到服务器中

可用版本： 2.0+

传参： (`errInfo`)

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|errInfo|错误的信息，具体参数参考下表|object|必传|

##### errInfo

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|type|错误类型|string|'err'|
|info|错误内容|string|必传|
|line|错误的具体行|string|非必传|
|sourceMap|sourceMap文件|类型待确认|非必传|




### record 录屏相关API

注意：在openRecord为true时才生效

#### * logDb.record.spark

说明： 触发保存。 调用该函数后，会将触发时机的那段时间的页面操作保存下来

可用版本： 2.0+

#### * logDb.record.stop

说明： 停止录屏

<!--
传参： (`beforeTime`,`afterTime`)

|参数|说明|类型|默认值|
|  ----  | ----  | ----  | ----  |
|beforeTime|触发函数前的录制时间|number|10|
|afterTime|触发函数后的录制时间|number|2|

-->
<!--
#### * logDb.recordStart与logDb.recordEnd

说明： 两个函数配合使用，   recordStart开始录屏，recordEnd结束录屏，期间的屏幕操作会被保存下来

可用版本： 2.0+

传参：没有参数
-->


