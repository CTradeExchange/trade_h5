import { guid, getDevice, getToken } from '@/utils/util'

// websocket消息事件
class SocketEvent {
    constructor () {
        this.ws = null
        this.seq_id = 0
        this.timeOut = 60 * 1000
        this.timer = null
        this.$store = null
        this.requests = new Map()
        this.subscribedList = []
    }

    // 初始化
    init (ws, $store) {
        this.ws = ws
        this.$store = $store
    }

    // ws发送数据格式
    getParam (msgType, data = {}) {
        const token = getToken()
        const param = {
            head: {
                msgType,
                token,
                sendTime: Date.now(),
                lang: 'zh-CN',
            },
            device: getDevice(),
            seqId: this.seq_id,
            trace: guid(),
        }

        return param
    }

    // 发送消息
    send (cmd_id, data, timeOut) {
        if (this.ws.readyState !== 1) return console.warn('消息websocket连接未准备好  readyState：', this.ws.readyState)
        this.seq_id++
        const param = this.getParam(cmd_id, data)
        this.ws.send(JSON.stringify(param))
        if (!this.timer) {
            this.timer = window.setInterval(() => {
                const nowTime = new Date().getTime()
                this.requests.forEach((item, key, map) => {
                    // 请求超时
                    if (nowTime - item.sendTime > item.timeOut) {
                        item.reject({
                            errorType: 'TimeOut',
                            remark: `timeOut: seq_id-${item.request.seq_id}, cmd_id-${item.request.cmd_id}`
                        })
                        this.requests.delete(key)
                    }
                })
                if (this.requests.size === 0) {
                    window.clearInterval(this.timer)
                    this.timer = null
                }
            }, 500)
        }
        return new Promise((resolve, reject) => {
            this.requests.set(param.seq_id, {
                sendTime: Date.now(),
                timeOut: timeOut ?? this.timeOut,
                request: param,
                resolve,
                reject,
            })
        })
    }

    // 心跳机制
    initPing () {
        if (this.ws.readyState !== 1) return console.warn('消息websocket连接未准备好  readyState：', this.ws.readyState)
        const param = this.getParam('ping')
        setInterval(() => {
            this.ws.send(JSON.stringify(param))
        }, 30000)
    }

    // 收取到消息
    onMessage (data) {
        this.requests.forEach((item, key) => {
            if (data.seq_id === key) {
                item.resolve(data)
            }
        })
        const cmdID = `cmd_id_${data.cmd_id}`
        if (typeof (this[cmdID]) === 'function') {
            this[cmdID](data)
        }
    }
}

export default SocketEvent