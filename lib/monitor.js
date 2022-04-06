import getLastEvent from './utils/getLastEvent'
import getLines from './utils/getLines'
import getSelector from './utils/getSelector'
import onload from './utils/onload'
import getParameters from './utils/getParameters'
import getParseUrl from './utils/getParseUrl'
let monitorInstrance = null

export default class monitor {
    constructor(props = {}) {
        const {db} = props
        // 单例模式
        if (monitorInstrance) {
            console.info(monitor)
            return monitorInstrance
        }
        
        this.db = db
        this.initTiming()
        this.initJSError()
        this.initPromiseError()
        this.initXHR()
        // this.initVueError()
        this.initFetch()
        monitorInstrance = this;
        
    }
    //js异常监控和静态资源加载错误
    initJSError() {
        window.addEventListener('error', (event) => {
            console.log(event,'=initJSError=')
            let lastEvent = getLastEvent() //获取用户最后一个交互事件
            if (event.target && (event.target.src || event.target.href)) {
                this.db.errorRegister({info:{
                    kind: 'stability',//监控指标的大类
                    type: 'error',//小类型 这是一个错误
                    errorType: 'resourceError',//资源加载 js或css资源加载错误
                    filename: event.target.src || event.target.href,//哪个文件报错了
                    tagName: event.target.tagName,//SCRIPT 资源加载错误的标签
                    selector: getSelector(event.target) //用户操作了哪个操作的元素
                }})
            } else {
                this.db.errorRegister({info:{
                    kind: "stability",//监控指标的大类
                    type: "error",//小类型 一个错误
                    errorType: "jsError",//JS执行错误
                    message: event.message,//报错信息
                    filename: event.filename,//哪个文件报错了
                    position: `${event.lineno}行/${event.colno}列`,//报错的行列 lineNo: lineNo || null,
                    columnNo: event.colno || null,
                    lineNo: event.lineno || null,
                    stack: event.error && event.error.stack ? getLines(event.error.stack) : null,
                    selector: lastEvent ? getSelector(lastEvent.path) : '',//用户操作了哪个操作的元素
                    suorcemap: "suorcemap",
                }})
            }
        }, true)
    }

    //promise全局错误监控
    initPromiseError() {
        window.addEventListener('unhandledrejection', (event) => {
            console.log(event,'=event=')
            let lastEvent = getLastEvent();//用户最后一个交互事件
            let message;
            let filename;
            let lineNo = 0;
            let columnNo = 0;
            let stack = '';
            let reason = event.reason;
            if (typeof reason === 'string') {
                message = reason;
            } else if (typeof reason === 'object') {
                message = reason.message;
                if (reason.stack) {
                    let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);//提取详细的错误信息
                    filename = matchResult[1];//文件名
                    lineNo = matchResult[2];//报错的行
                    columnNo = matchResult[3];//报错的列
                }
                stack = getLines(reason.stack);//堆栈信息
            }
            this.db.errorRegister({info:{
                kind: 'stability',//监控指标的大类
                type: 'error',//小类型 这是一个错误
                errorType: 'promiseErroe',//promise错误 
                message,//报错信息
                filename,//哪个文件报错了
                position: `${lineNo}行/${columnNo}列`,//报错的行列,当是全局当promise报错是无法拿到行列信息的。
                lineNo: lineNo,
                columnNo: columnNo,
                stack,
                selector: lastEvent ? getSelector(lastEvent.path) : '', //用户操作了哪个操作的元素
                suorcemap: "suorcemap",
            }})
        }, true)
    }
    //vue组件错误监控
    initVueError(Vue) {
        Vue.config.errorHandler = function (err, vm, info) {
            this.db.errorRegister({info:{
                kind: "stability",//监控指标的大类
                type: "error",//小类型 一个错误
                errorType: "vueError",//Vue执行错误
                stack: err.stack,
                message: err.message,
                selector: vm.$vnode.tag,
                info: info,
                filename: '',
                suorcemap: "suorcemap",
            }})
        }
    }
    //性能监控
    initTiming() {
        let _this = this 
        let FMP, LCP;
        // 增加一个性能条目的观察者
        if (PerformanceObserver) {
            //FMP首次有意义绘制，页面有意义的内容渲染时间  在需要监听的元素上添加elementtiming属性浏览器就会认定这个元素是有意义的，就可以使用fmp监听。
            new PerformanceObserver((entryList, observer) => {
                let perfEntries = entryList.getEntries();
                FMP = perfEntries[0];//startTime 2000以后
                observer.disconnect();//不再观察了
            }).observe({ entryTypes: ['element'] });//观察页面中的意义的元素 FMP
            //LCP代表viewport中最大的页面元素加载的时间
            new PerformanceObserver((entryList, observer) => {
                let perfEntries = entryList.getEntries();
                LCP = perfEntries[0];
                observer.disconnect();//不再观察了
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            //FID首次输入延迟，用户首次和页面交互（单击链接，点击按钮等）到页面响应交互的事件
            new PerformanceObserver((entryList, observer) => {
                let lastEvent = getLastEvent();
                //第一个输入框
                let firstInput = entryList.getEntries()[0];
                if (firstInput) {
                    //processingStart开始处理的时间 startTime开点击的时间 差值就是处理的延迟
                    let inputDelay = firstInput.processingStart - firstInput.startTime;
                    let duration = firstInput.duration;//处理的耗时
                    if (inputDelay > 0 || duration > 0) {
                        this.db.errorRegister({info:{
                            kind: 'experience',//用户体验指标
                            type: 'firstInputDelay',//首次输入延迟
                            inputDelay,//延时的时间
                            duration,//处理的时间
                            startTime: firstInput.startTime,
                            selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
                        }})
                    }

                }
                observer.disconnect();//不再观察了
            }).observe({ type: 'first-input', buffered: true });//'first-input用户第一次交互、点击页面 内容等。
        }
        onload(function () {
            //浏览器解析页面性能指标
            setTimeout(() => {
                const { fetchStart, connectStart, connectEnd, requestStart, responseStart, responseEnd, domLoading, domInteractive, domContentLoadedEventStart, domContentLoadedEventEnd, loadEventStart } = performance.timing;
                _this.db.errorRegister({info:{
                    kind: 'experience',//用户体验指标
                    type: 'timing',//统计每个阶段的时间
                    connectTime: connectEnd - connectStart,//连接时间
                    ttfbTime: responseStart - requestStart,//首字节到达时间
                    responseTime: responseEnd - responseStart,//响应的读取时间
                    parseDOMTime: loadEventStart - domLoading,//DOM解析的时间
                    domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart,//domContentLoaded事件耗时
                    timeToInteractive: domInteractive - fetchStart,//首次可交互时间
                    loadTIme: loadEventStart - fetchStart //完整的加载时间
                }})
                //首次绘制，包括了任何用户自定义的背景绘制，它是首先将像素绘制到屏幕的时刻
                let FP = performance.getEntriesByName('first-paint')[0];
                //是游览器将第一个DOM渲染到屏幕的时间，可能是文本、图像、SVG等这其实就是白屏时间
                let FCP = performance.getEntriesByName('first-contentful-paint')[0];
                //开始发送性能指标
                _this.db.errorRegister({info:{
                    kind: 'experience',
                    type: 'timing',
                    firstPaint: FP.startTime,//首次绘制
                    firstContentfulPaint: FCP.startTime,//首次内容绘制
                    firstMeaningfulPaint: FMP ? FMP.startTime : '',//首次有意义的内容绘制
                    largestContentfulPaint: LCP.startTime//最大内容绘制
                }})
            }, 6000);
        });
    }
    //ajax请求监控
    initXHR() {
        let _this = this 
        //老的XMLHttpRequest
        let XMLHttpRequest = window.XMLHttpRequest;
        //缓存老的open方法
        let oldOpen = XMLHttpRequest.prototype.open;
        //重写open方法
        XMLHttpRequest.prototype.open = function (method, url, async) {
            //避免死循环，把上传地址也监控了。
            if (!url.match(/logstores/) && !url.match(/sockjs/)) {
                this.logData = { method, url, async };
            }
            return oldOpen.apply(this, arguments);
        }
        //老的send方法
        let oldSend = XMLHttpRequest.prototype.send;
        //重写send方法
        XMLHttpRequest.prototype.send = function (body) {
            //this.logData如果有值的话，代表经过新的open方法劫持了。
            if (this.logData) {
                //在发送之前记录一下开始的时间
                let startTime = Date.now();
                //XMLHttpRequest  readyState 0 1 2 3 4
                //status 2xx 304 成功 其它 就是失败
                let handler = (type) => (event) => {
                    //请求的时间到了这一步请求已经返回了，所有用Date.now() - startTime就得到了请求的时间。
                    let duration = Date.now() - startTime;//毫秒
                    //请求的状态可能是200、500。
                    let status = this.status;
                    // OK Server Error
                    let statusText = this.statusText;
                    //上报
                    _this.db.errorRegister({info:{
                        kind: 'stability',
                        type: 'xhr',
                        eventType: type,//load error abort
                        pathname: this.logData.url,//请求地址
                        status: status + '-' + statusText,//状态码
                        duration,//持续时间
                        response: this.response ? JSON.stringify(this.response) : '',//响应体
                        params: body || ''//请求体
                    }})
                }
                //请求成功 handler函数是回调函数
                this.addEventListener('load', handler('load'), false);
                //请求失败
                this.addEventListener('error', handler('error'), false);
                //请求放弃
                this.addEventListener('abort', handler('abort'), false);
            }
            return oldSend.apply(this, arguments);
        }
    }
    //fetch请求监控
    initFetch() {
        let _this = this 
        if ("function" == typeof window.fetch) {
            console.log('进来了')
            //重新定义 __oFetch__
            let __oFetch__ = window.fetch;
            //在全局添加一个私有fetch
            window['__oFetch__'] = __oFetch__;
            //重写原来的fetch
            window.fetch = function (t, o) {
                let params = typeof o === "object" ? o.body : getParameters(t)
                console.log('进来了2',params)
                let args = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
                //发送时获取当前时间
                let startTime = Date.now();
                //获取请求路径
                let url = (t && typeof t != "string" ? t.url : t) || "";
                //解析url
                url = getParseUrl(url);
                if (!url) {
                    return __oFetch__.apply(window, args);
                }
                return __oFetch__.apply(window, args).then(function (e) {
                    let response = e.clone();
                    let headers = response.headers;
                    if (headers && 'function' === typeof headers.get) {
                        let ct = headers.get('content-type');
                        if (ct && !/(text)|(json)/.test(ct))
                            return e;
                    }

                    let duration = Date.now() - startTime;
                    const { type, status, statusText } = response
                    response.text().then(function (res) {
                        if (response.ok) {
                            _this.db.errorRegister({info:{
                                kind: 'stability',
                                type: 'xhrFetch',
                                eventType: type,//load error abort
                                pathname: url,//请求地址
                                status: status + '-' + statusText,//状态码
                                duration,//持续时间
                                response: res ? JSON.stringify(res) : '',//响应体
                                params,//请求数据
                            }})
                        }
                        else {
                            _this.db.errorRegister({info:{
                                kind: 'stability',
                                type: 'xhrFetch',
                                eventType: type,//load error abort
                                pathname: url,//请求地址
                                status: status + '-' + statusText,//状态码
                                duration,//持续时间
                                response: res ? JSON.stringify(res) : '',//响应体
                                params,//请求数据
                            }})
                        }
                    });
                    //return e;
                });
            };
        }
    }
}
