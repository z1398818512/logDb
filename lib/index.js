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
        this.version(1).stores({
            logger: '++id, timeStamp,time,loggerInfo',
        });
        this.logger = this.table('logger');
        this.isEmit = isEmit || true;
        this.updateDatabase().then();
    }
    async updateDatabase() {
        const list = await this.getLogger(0, new Date(Date.now() - this.expirationTime).getTime());
        this.logger.bulkDelete(list.map(log => log.id)) ;// 批量删除
    }

    // 获取详细日志
    async  getLogger(start = 0, end = Date.now()) {
        return  this.logger.where('timeStamp').between(start, end, true, true).toArray();
    }

    // 获取日期为维度的所有数据
    async get(date){
        const itemList = await this.getLogger() || [];
        const dateMap = {};
        itemList.forEach(item=>{
            const date =  item.time.split(' ')[0];
            if(!dateMap[date]){ dateMap[date] = [] }
            dateMap[date].push(item);
        });
        const resultData = {};
        Object.keys(dateMap).forEach(key=>{
            var str = '';
            dateMap[key].forEach((data,i)=>{
                str += `[${i + 1}]: ${data.time} ${data.loggerInfo} \n`;
            });
            resultData[key] = str;
        });
        if(typeof date === 'string'){
            console.log(resultData[date]);
            return resultData[date];
        }else {
            console.log(resultData);
            return resultData;
        } 
        
    }

    // 添加日志
    log(...data) {
        if(this.isEmit){
            if(!data.length)  {
                console.log('db.log传入为空');
            }else{
                console.log.apply(null,data);
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
                    return str += ' ' + (typeof log === 'string' ? log : JSON.stringify(log)) ;
                })) : '',
                
            });
        }catch(err){
            console.log(err);
        }
        
    }
    
}