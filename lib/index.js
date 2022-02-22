import Dexie from 'dexie';


/*
* expirationTime: 保存日志的天数
* isEmit: 是否在控制台打印日志
*/
export default class logDb  extends Dexie {
    constructor(props = {}) {
        const { databaseName = 'log' ,expirationTime, isEmit } = props;
        if (typeof databaseName !== 'string') {
            throw 'databaseName must be string';
        }
        super(databaseName);
        this.databaseName = databaseName;
        this.headers = [
            {label: 'ID', props: 'id'}, 
            {label: '时间戳', props: 'timeStamp' }, 
            {label: '记录时间', props: 'time'}, 
            {label: '记录内容', props: 'loggerInfo'},
            {label: '最大内存限制', props: 'jsHeapSizeLimit'},
            {label: '可用内存', props: 'totalJSHeapSize'}, 
            {label: '已使用内存', props: 'usedJSHeapSize'},
        ];
        this.expirationTime = (expirationTime || 2) * 24 * 3600 * 1000; // 默认保留近2天的日志
        this.version(2).stores({
            logger: '++id, timeStamp,time',
        });
        this.logger = this.table('logger');
        this.isEmit = isEmit || true;
        this.updateDatabase()
    }
    async updateDatabase() {
         this.getFilterDateLogger(0, new Date(Date.now() - this.expirationTime).getTime()).delete()
    }

    // 筛选范围日期内的数据
      getFilterDateLogger(start = 0, end = Date.now()) {
        return  this.logger.where('timeStamp').between(start, end, true, true)
    }

    /*获取时间段内的所有数据
    * 参数说明： 
    * 不传则获取所有数据
    * 参数1： start 【日期字符串|日期对象|时间戳】开始时间，不传则从最初始开始查
    * 参数2：  end  【日期字符串|日期对象|时间戳】结束时间，不传则截止到最后一条
    */
    async get(start,end){
        const argumentList = arguments;
        let itemList;
        if(argumentList.length===0){
            itemList = await this.getFilterDateLogger().toArray() || [];
        }else{
            let startTime,endTime;
            startTime = new Date(start).getTime() || undefined
            if(end){
                endTime = new Date(end).getTime() + 999|| undefined
            }else{
                endTime = new Date(endTime+' 23:59:59').getTime() + 999 || undefined;
            }
            itemList  = await this.getFilterDateLogger(startTime,endTime).toArray() || [];
        }
       let logText = '';
       itemList.forEach((item,i)=>{
        logText += `[${i + 1}]: ${item.time} ${item.loggerInfo} \n`;
       })
        console.info(logText)
        return itemList
    }
    // 获取日期为维度的所有数据，适用于数据量少的场合
    async getDate(dateString){
        let itemList;
        if(typeof dateString === 'string'){
            const start = new Date(dateString+' 00:00:00').getTime() || undefined;
            const end = new Date(dateString+' 23:59:59').getTime() + 999 || undefined;
            itemList  = await this.getFilterDateLogger(start,end).toArray() || [];
        }else{
            itemList = await this.getFilterDateLogger().toArray() || [];
        }
        
        const dateMap = {};
        itemList.forEach(item=>{
            const date =  item.time.split(' ')[0];
            if(!dateMap[date]){ dateMap[date] = [] }
            dateMap[date].push(item);
        });
        const resultData = {};
        Object.keys(dateMap).forEach(key=>{
            var logText = '';
            dateMap[key].forEach((data,i)=>{
                logText += `[${i + 1}]: ${data.time} ${data.loggerInfo} \n`;
            });
            resultData[key] = logText;
        });

        if(typeof dateString === 'string'){
            console.info(resultData[dateString]);
            return resultData[dateString];
        }else {
            console.info(resultData);
            return resultData;
        } 
        
    }

    // 日志上传
    async upload(){
        const url = 'http://172.16.30.231:7002/logAnalysis/get'
        try{
            const data = await fetch(url,{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({
                    name: 'CaiCai',
                    age: '26',
                })
            })
            .then(response => response.json())
            if(data.result==100){
                console.info('上传成功')
            }
        }catch{
            console.info('上传请求失败')
        }
       
    }

    // 添加日志
    log(...data) {
        if(this.isEmit){
            if(!data.length)  {
                console.info('db.log传入为空');
            }else{
                console.info.apply(null,data);
            }
        }
        const timeStamp = Date.now();
        try{
            this.logger.add({
                timeStamp,
                time: new Date(timeStamp).format('yyyy-MM-dd hh:mm:ss'),
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit / 1024 / 1024, // 最大内存限制
                totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024, // 总内存的大小
                usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024, // JS占用内存 如果大于totalJSHeapSize 极大可能内存泄漏
                loggerInfo:data.length ? (data.reduce((str = '',log)=>{
                    return str = (typeof str === 'string' ? str : JSON.stringify(str))+' ' + (typeof log === 'string' ? log : JSON.stringify(log)) ;
                })) : '',
                
            });
        }catch(err){
            console.info(err);
        }
        
    }  
}
