import { record, pack } from 'rrweb';

let recordInstrance = null

class recordClass {
  constructor({ logDb, openRecord }) {
    if (recordInstrance) {
      return recordInstrance
    }
    this.eventsMatrix = [[]];
    this.isRecord = false; // 是否录制中
    this.logDb = logDb;
    if (openRecord) { this.run() }
    this.activeTask = null;
  }

  // 触发录屏，调用该函数后，会将触发的时机前后一段时间页面操作保存下来
  spark() {
    const events = this.sparkFun()
    logDb.log('recordVideo', {recordEvent: events});
  }

  sparkFun(){
    if (!this.isRecord) {
      console.log('logDb内提示：', 'recordSpark执行失败，原因： 未开启录屏')
      return
    }
    const { eventsMatrix } = this
    const len = eventsMatrix.length;
    if (!len) return;
    const events = eventsMatrix[(len - 2) > 0 ? len - 2 : 0].concat(eventsMatrix[len - 1]);
    return events
  }

  // 启动录制
  run() {
    if (this.isRecord) { return }

    const { eventsMatrix } = this
    this.isRecord = true
    this.stopRecord = record({
      emit(event, isCheckout) {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
          eventsMatrix.push([]);
          if (eventsMatrix.length >= 10) {
            eventsMatrix.shift()
          }
        }
        const lastEvents = eventsMatrix[eventsMatrix.length - 1];
        lastEvents.push(event);
      },
      sampling: {
        // 定义不录制的鼠标交互事件类型，可以细粒度的开启或关闭对应交互录制
        mouseInteraction: false,
        mousemove: true,
        scroll: 150, // 每 150ms 最多触发一次
        input: 'last', // 连续输入时，只录制最终值
        media: 800,
        ContextMenu: false,
      },
      packFn: pack, //压缩
      checkoutEveryNms: 10 * 1000, // 每 10s重新绘制快照
    });
  }

  // 停止录制
  stop() {
    if (!this.isRecord) {
      console.log('logDb内提示：', 'stopRecord执行失败，原因： 未开启录屏')
      return
    }
    this.stopRecord()
    this.eventsMatrix = [[]];
    this.isRecord = false
  }


  onceSpark(t = 10) {
    return new Promise(async (resolve)=>{
      try {
        // 终止前一个任务并保存数据
        if (this.activeTask) {
          await this.activeTask.stop();
        }

        await new Promise(r=>setTimeout(r, 0));

        this.activeTask = new RecordingTask(t, (d) => {
          resolve(d);
          this.activeTask = null;
        });
      }catch(err){
        console.log('logDb内报错【onceSpark异常】：',err)
      }
    })
   
  }
  

}

class RecordingTask {
  constructor(duration, onComplete) {
    this.duration = duration * 1000;
    this.events = [];
    this.recorder = null;
    this.timer = null;
    this.onComplete = onComplete;

    this.execute();
  }

  execute() {
    // 独立录制实例
    this.recorder = record({
      emit: (event) => this.events.push(event),
      sampling:{
        // 定义不录制的鼠标交互事件类型，可以细粒度的开启或关闭对应交互录制
        mouseInteraction: false,
        mousemove: true,
        scroll: 150, // 每 150ms 最多触发一次
        input: 'last', // 连续输入时，只录制最终值
        media: 800,
        ContextMenu: false,
      },
      packFn: pack
    });

    this.timer = setTimeout(() => {
        this.stop()
    }, this.duration);
  }



  async stop() {
    this.recorder?.();
    clearTimeout(this.timer);
    const d =  this.events;
    this.onComplete(d);
    return d; 
  }

}


export default recordClass