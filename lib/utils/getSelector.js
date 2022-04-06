//获取具体的报错元素 
function getSelector(path) {
    return path.reverse().filter(element => {
        return element != document && element !== window
    }).map(element => {
        let selector = ''
        if (element.id) {
            return `${element.tagName.toLowerCase()}#${element.id}`

        } else if (element.className && typeof element.className === 'string') {

            return `${element.nodeName.toLowerCase()}.${element.className}`

        } else {

            selector = element.nodeName.toLowerCase()
        }

        return selector;

    }).join(' ')
}

export default function (pathOrTarget) {//pathOrTarget可能是数组也可能是对象
    if (Array.isArray(pathOrTarget)) {
        return getSelector(pathOrTarget)
    } else {
        let path = []
        while (pathOrTarget) {
            path.push(pathOrTarget)
            pathOrTarget = pathOrTarget.parentNode
        }
        return getSelector(path)
    }
}