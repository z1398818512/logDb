export default function (url,{
    query = {}
}) {
    let { roomId } = query || sessionStorage.getItem('roomId');
    url = url ||' wss://oivoee.laf.run/__websocket__'
        const onMap = new Map();

        const wss = new WebSocket(`${url}?type=user${roomId ? '&userId=' + roomId : ''}`);

        wss.onopen = (socket) => {
            console.log("connected");
            handleSendSleep();
        };

        wss.onmessage = (res) => {
            console.log("onmessage......", res.data);
            try {
                const data = JSON.parse(res.data || "{}");
                const { type } = data
                let fun;
                if (type === 'connection') {
                    fun = onMap.get('connect');
                    roomId = data.userId
                    sessionStorage.setItem('roomId', roomId)
                    console.log('打开链接： https://oivoee-admin.site.laf.run/?roomId=' + roomId)
                } else {
                    fun = onMap.get(type);
                }
                if (fun) {
                    fun(data)
                }

            } catch (err) {

            }

        };
        wss.on = (type, fun) => {
            onMap.set(type, fun)
        }
        wss.emit = (type, data) => {
            let rType = type;
            switch(type){
                case 'send' :
                    rType ='responseData';
                    break;
            }
            const sendData = JSON.stringify({
                clientType: 'user',
                data,
                roomId: roomId,
                type: rType
            })
            wss.send(sendData);
        }

        wss.onclose = () => {
            console.log("closed");
            clearInterval(timerId)
        };
        let timerId=null;
        function handleSendSleep(t=(1000*60*5)){
            timerId = setInterval(()=>{
                wss.send(JSON.stringify({
                    clientType: 'user',
                    data: '',
                    roomId: roomId,
                    type: 'sleep'
                }))
            }, t);
            
        }

        return wss;

}
