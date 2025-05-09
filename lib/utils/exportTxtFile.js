export function downloadTextFile(text, filename) {
    // 创建一个Blob对象，指定文本类型为纯文本
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    
    // 创建一个指向该Blob的URL
    const url = URL.createObjectURL(blob);
    
    // 创建一个临时的<a>元素来触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // 设置下载的文件名
    
    // 将<a>元素添加到文档中，并模拟点击以触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理：移除<a>元素并释放创建的URL对象
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
 
