//获取最后一个交互的事件，用户切换不同的事件只获取最后一个
let lastEvent;
['click','touchstart','mousedown','keydown','mouseover'].forEach(eventType=>{
    document.addEventListener(eventType,(event)=>{
        lastEvent = event
    },{
        capture:true,//捕获阶段
        passive:true,//默认不阻止默认事件
    })
})
export default function() {
    return lastEvent
}