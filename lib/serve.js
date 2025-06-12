import { getFilterDateLogger } from './model'
import io from 'socket.io-client'
// import io from './wss'
import pako from 'pako';
let serveInstrance = null

export default class serve {
  constructor(props = {}) {
    // 单例模式
    if (serveInstrance) {
      console.info(serveInstrance.point)
      return serveInstrance
    }
    this.point = 'socket.io未连上，请等几秒重试'
    const { db, room, serveUrl } = props;
    this.db = db;
    this.room = room
    this.serveUrl = serveUrl
    // this.getFilterDateLogger = getFilterDateLogger.bind(this,db)
    // this.queryData()
    this.initIo()
    serveInstrance = this;
  }
  initIo() {
    const socket = io(this.serveUrl, {
      path:'/logdb/socket.io',
      query: { roomId: this.room ,type:'user'},
      transports: ['websocket'],
    });
    
    socket.on('connect', () => {
      socket.on('pageUrl', ({ data }) => {
        this.point = '已启动在线分析页：' + data
        console.info(this.point)
      })
      socket.on('query', ({ data }) => {
        this.queryData(data)
      })
      // 开启实时将日志传到远程
      socket.on('openRealLog', ({ data }) => {
        this.isOpenRealLog = data || true;
        console.log = this.db.log.bind(this.db);
        console.log('已连接')
      })
      socket.on('handleScirpt', ({ data }) => {
        try {
          this.db.log('控制台脚本：', eval(data))
        } catch (err) {
          this.db.log('err', '函数处理报错，原因：' + err)
        }
      })
    });
    socket.emit = (() => {
      const originalEmit = socket.emit.bind(socket);
      return (type, data) => {
        originalEmit(type, {
          data,
          roomId:this.room,
        });
      };
    })();
    this.socket = socket;
  }

  // 发送实时日志到远程
  async sendOnceLog(log) {
    if (this.isOpenRealLog) {
      this.socket.emit('sendonCeLog', log);
    }
  }

  closeWs() { }
  async queryData(data = {}) {
    const { start, end, pageIndex = 1, pageSize = 100, logType, infoText } = data.data || {}
    const startIndex = (pageIndex - 1) * pageSize;
    var FilterDateLogger = getFilterDateLogger(this.db.logger, start, end).reverse()

    // 筛选类型
    if (logType || infoText) {
      // FilterDateLogger = FilterDateLogger.and(firend => {
      //   if (logType && firend.logType.toLowerCase().includes(logType.toLowerCase())) {
      //     return true
      //   }
      //   if (infoText && firend.loggerInfo.toLowerCase().includes(infoText.toLowerCase())) {
      //     return true
      //   }
      // })
      
      // 修改为AND逻辑（同时满足两个条件）
      FilterDateLogger = FilterDateLogger.and(firend => {
          let match = true
          if (logType) {
              match = match && firend.logType.toLowerCase().includes(logType.toLowerCase())
          }
          if (infoText) {
              match = match && firend.loggerInfo.toLowerCase().includes(infoText.toLowerCase())
          }
          return match
      })
    }
    // 获取数量
    const count = await FilterDateLogger.count()
    // 分页处理
    const arr = await FilterDateLogger.offset(startIndex).limit(pageSize).toArray()

    // 发送数据
    if (arr) {
      // 在queryData方法中修改：
      const compressedData = pako.gzip(JSON.stringify(arr));
      const uintArray = new Uint8Array(compressedData);
      const CHUNK_SIZE = 32768; // 32KB 分块大小
      const totalChunks = Math.ceil(uintArray.length / CHUNK_SIZE);
      let currentChunk = 1;
      let offset = 0;
      // 分块发送数据
      while (currentChunk <= totalChunks) {
          const chunk = uintArray.subarray(offset, offset + CHUNK_SIZE);
          const chunkString = String.fromCharCode.apply(null, chunk);
          
          this.socket.emit('send', {
            compressed: 'chunk',
            dataList: btoa(chunkString),
            total: count,
            pageIndex,
            pageSize,
            chunkInfo:{
              currentChunk,
              totalChunks,
              size:uintArray.length,
            }
          });
          currentChunk+=1;
          offset += CHUNK_SIZE;
      }
      
      // this.socket.emit('send', {
      //   compressed: 'gzip',
      //   dataList: btoa(str),
      //   total: count,
      //   pageIndex,
      //   pageSize
      // });
    }
  }
}