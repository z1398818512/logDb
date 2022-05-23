//监控控文件会放在HTML文件头部，所以会先加载js文件导致无法监控。
//该方法让页面加载完成之类在加载白屏监控文件。
export default function (callback) {
    //加载完成
    if (document.readyState === 'complete') {
        callback();
    } else {
        //没加载完成，等load事件发生后再调用白屏监控
        window.addEventListener('load', callback);
    }
}