import Dexie from 'dexie';
import './utils/global'
import { getFilterDateLogger } from './model'
import serve from './serve'
let dbInstrance = null



/*
* expirationTime[number]: 保存日志的天数
* isEmit[bool]: 是否在控制台打印日志
* roomId[string|number]: 使用在线展示页需要的id， 建议传用户id或者token，  非必传。
* consoleReplace[bool]:  使用console来记录日志，  该选项为true时，isEmit会置为FALSE
* serveUrl[string]: 远程的socket.io url
*/
export default class loggerDb extends Dexie {
    constructor(props = {}) {
        // 单例模式
        if (dbInstrance) {
            return dbInstrance
        }
        const {
            databaseName = 'log',
            expirationTime = 7,
            isEmit,
            serveUrl = 'http://116.62.117.151:7001',
            openRecord = false,
            roomId = 1,
            useErrStytem = false
        } = props;
        
        if (typeof databaseName !== 'string') {
            throw 'databaseName must be string';
        }
        super(databaseName);
        this.databaseName = databaseName;
        this.headers = [
            { label: 'ID', props: 'id' },
            { label: '时间戳', props: 'timeStamp' },
            { label: '记录时间', props: 'time' },
            { label: '记录内容', props: 'loggerInfo' },
            { label: '类型', props: 'logType' },
            { label: '最大内存限制', props: 'jsHeapSizeLimit' },
            { label: '可用内存', props: 'totalJSHeapSize' },
            { label: '已使用内存', props: 'usedJSHeapSize' },
            { label: '录屏数据', props: 'recordEvent' },
            { label: '详情内容', props: 'infoData' }
        ];
        this.expirationTime = (expirationTime) * 24 * 3600 * 1000; // 默认保留近7天的日志
        this.version(4).stores({
            logger: '++id, timeStamp,time',
        });
        this.logger = this.table('logger');
        this.isEmit = isEmit;
        this.room = roomId
        this.serveUrl = serveUrl+'/user'
        this.getFilterDateLogger = getFilterDateLogger.bind(this, this.logger)
        this.updateDatabase();

        this.errLoopNum = 0;   // 错误次数，避免死循环
        dbInstrance = this

        document.addEventListener('keydown', (e) => {
            // ctrl+F12 快捷开启在线分析页
            // if(e.ctrlKey&&e.keyCode===123){
            //     this.openOnline()
            //     return
            // }
            // ctrl+F11 快捷开启在线分析页， url以弹窗形式展示
            if (e.ctrlKey && (e.keyCode === 123 || e.keyCode === 122)) {
                this.openOnline()
                const boxHtml = document.createElement('div')
                boxHtml.setAttribute('style', 'position: fixed;height:30px;line-height:30px;top:0;width:100%;background:#fff;z-index:100000;text-align:center')
                setTimeout(() => {
                    boxHtml.innerHTML = '已启动在线分析页：https://oivoee-admin.site.laf.run/' // this.socket.point
                    document.body.appendChild(boxHtml)
                }, 500)
                setTimeout(() => {
                    boxHtml.remove()
                }, 8000)

                return
            }
        })
        // 录屏
        // this.record = new recordClass({ logDb: this, openRecord })
        // this.openOnline()
       
    }
    /* 清除指定时长外的日志 */
    async updateDatabase() {
        this.getFilterDateLogger(0, new Date(Date.now() - this.expirationTime).getTime()).delete()
    }

    /* 启动在线可视化页 */
    openOnline(serveUrl) {
        this.socket = new serve({ db: this, room: this.room, serveUrl: serveUrl }) // 启动在线分析
    }


    /*获取时间段内的所有数据
    * 参数说明： 
    * 不传则获取所有数据
    * 参数1： start 【日期字符串|日期对象|时间戳】开始时间，不传则从最初始开始查
    * 参数2：  end  【日期字符串|日期对象|时间戳】结束时间，不传则截止到最后一条
    */
    async get(start, end) {
        const argumentList = arguments;
        let itemList;
        if (argumentList.length === 0) {
            itemList = await this.getFilterDateLogger().toArray() || [];
        } else {
            let startTime, endTime;
            startTime = new Date(start).getTime() || undefined
            if (end) {
                endTime = new Date(end).getTime() + 999 || undefined
            } else {
                endTime = new Date(endTime + ' 23:59:59').getTime() + 999 || undefined;
            }
            itemList = await this.getFilterDateLogger(startTime, endTime).toArray() || [];
        }
        let logText = '';
        itemList.forEach((item, i) => {
            logText += `[${i + 1}]: ${item.time} ${item.loggerInfo} \n`;
        })
        console.info(logText)
        return itemList
    }

    // 获取日期为维度的所有数据，适用于数据量少的场合
    async getDate(dateString) {
        let itemList;
        if (typeof dateString === 'string') {
            const start = new Date(dateString + ' 00:00:00').getTime() || undefined;
            const end = new Date(dateString + ' 23:59:59').getTime() + 999 || undefined;
            itemList = await this.getFilterDateLogger(start, end).toArray() || [];
        } else {
            itemList = await this.getFilterDateLogger().toArray() || [];
        }

        const dateMap = {};
        itemList.forEach(item => {
            const date = item.time.split(' ')[0];
            if (!dateMap[date]) { dateMap[date] = [] }
            dateMap[date].push(item);
        });
        const resultData = {};
        Object.keys(dateMap).forEach(key => {
            var logText = '';
            dateMap[key].forEach((data, i) => {
                logText += `[${i + 1}]: ${data.time} ${data.loggerInfo} \n`;
            });
            resultData[key] = logText;
        });

        if (typeof dateString === 'string') {
            console.info(resultData[dateString]);
            return resultData[dateString];
        } else {
            console.info(resultData);
            return resultData;
        }

    }

    // 日志上传，暂时没用
    async upload() {
        const url = 'http://172.16.30.231:7002/logAnalysis/get'
        try {
            const data = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'CaiCai',
                    age: '26',
                })
            })
                .then(response => response.json())
            if (data.result == 100) {
                console.info('上传成功')
            }
        } catch(err) {
            console.info('上传请求失败')
        }
    }

    // 添加日志
    log(...data) {
        // 避免下面的try中一直存在错误，导致死循环
        if (data[0] === 'logdb内报错' && data[1] >= 2) {
            return false;
        }
        try {
            let recordEvent = ''
            let infoData = ''
            // 特殊数据处理。  初衷的log方法是模拟console.log的，所有传入的参数都作为日志进行存储。  但是后面衍生出了更多需求， 就占用[1]里处理特殊数据。
            if (data[1] && typeof data[1] === 'object' && (data[1].recordEvent || data[1].infoData)) {
                recordEvent = data[1].recordEvent // 录屏数据
                infoData = data[1].infoData // 错误拦截详细信息
                data[1] = ''
            }
            if (this.isEmit) {
                if (!data.length) {
                    console.info('db.log传入为空');
                } else {
                    console.info.apply(null, data);
                }
            }
            const timeStamp = Date.now();
            var logType = 'log'

            // [0]是长度小于20字符的string时，  则作为日志的类型字段的值 
            if (data.length > 1 && typeof data[0] === 'string' && data[0].length < 100) {
                logType = data[0]
                data.splice(0, 1)
            }

       
            data.push('') // 避免data长度为1时， 以下reduce直接略过
            const loggerInfo = data.length ? (data.reduce((str = '', log) => {
                return str = (typeof str === 'string' ? str : JSON.stringify(str)) + ' ' + (typeof log === 'string' ? log : JSON.stringify(log));
            })) : '';

            this.logger.add({
                timeStamp,
                time: new Date(timeStamp).format('yyyy-MM-dd hh:mm:ss'),
                logType,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // 最大内存限制
                totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024, // 总内存的大小
                usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024, // JS占用内存 如果大于totalJSHeapSize 极大可能内存泄漏
                loggerInfo,
                recordEvent,
                infoData
            });
            this.socket && this.socket.sendOnceLog({
                timeStamp,
                time: new Date(timeStamp).format('yyyy-MM-dd hh:mm:ss'),
                loggerInfo
            })
            if (data[0] === 'logdb内报错') {
                this.errLoopNum = 0
            }
        } catch (err) {
            this.errLoopNum += 1
            if (typeof err === 'object' && err.message) {
                this.log('logdb内报错', this.errLoopNum, err.message);
            } else {
                this.log('logdb内报错', this.errLoopNum, err);
            }

        }

    }

}
window.loggerDb = loggerDb;
