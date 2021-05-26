import { guid, getDevice, getToken } from '@/utils/util'

// websocket消息事件
class SocketEvent {
    constructor () {
        this.ws = null
        this.seq_id = 0
        this.timeOut = 60 * 1000
        this.timer = null
        this.$store = null
        this.$router = null
        this.requests = new Map()
        this.subscribedList = []
        this.connectNum = 0 // websocket链接连接次数
    }

    // 初始化
    init (ws, $store, $router) {
        this.ws = ws
        this.$store = $store
        this.$router = $router
    }

    // ws发送数据格式
    getParam (msgType, data = {}) {
        this.seq_id++
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
    send (msgType, data, timeOut) {
        if (this.ws.readyState !== 1) return console.warn('消息websocket连接未准备好  readyState：', this.ws.readyState)
        const param = this.getParam(msgType, data)
        this.ws.send(JSON.stringify(param))

        if (!this.timer) {
            this.timer = window.setInterval(() => {
                const nowTime = new Date().getTime()
                this.requests.forEach((item, key, map) => {
                    // 请求超时
                    if (nowTime - item.sendTime > item.timeOut) {
                        item.reject({
                            errorType: 'TimeOut',
                            remark: `timeOut: seq_id-${item.request.seq_id}, msgType-${item.request.msgType}`
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

    // 收取到消息
    onMessage (data) {
        this.requests.forEach((item, key) => {
            if (data.seq_id === key) {
                item.resolve(data)
            }
        })
        const msgCode = data.msgCode
        if (typeof (this[msgCode]) === 'function') {
            this[msgCode](data)
        }
    }

    // 登录
    login () {
        return this.send('login')
    }

    // 登出
    logout () {
        return this.send('logout')
    }

    // 跳转到登录页面刷新
    handlerLogout () {
        return this.$store.dispatch('_user/logout').then(() => {
            return this.$router.push('/login')
        }).then(() => {
            location.reload()
        })
    }

    // 新增订阅动作，如果websocket已经建立好，则直接请求，否则先缓存在subscribedList中
    subscribedListAdd (fn) {
        if (this.ws.readyState === 1) {
            fn && fn()
        } else {
            this.subscribedList.push(fn)
        }
    }

    // websocket连接成功
    onOpen () {
        const token = getToken()
        this.connectNum++
        if (this.connectNum > 1 && token) this.login() // 重连后自动登录
        const executeFn = () => {
            const fn = this.subscribedList.shift()
            fn && fn()
            if (this.subscribedList.length) executeFn()
        }
        executeFn()
    }

    // 心跳机制
    initPing () {
        if (this.ws.readyState !== 1) return console.warn('消息websocket连接未准备好  readyState：', this.ws.readyState)
        let param = this.getParam('ping')
        // this.ws.send(JSON.stringify(param))
        if (this.ping) clearInterval(this.ping)
        this.ping = setInterval(() => {
            param = this.getParam('ping')
            this.ws.send(JSON.stringify(param))
        }, 30000)
    }

    // 处理持仓盈亏浮动数据和账户数据
    positionsTick (str) {
        // f(profitLoss,occupyMargin,availableMargin,marginRadio,netWorth,balance);(positionId,profitLoss);(positionId,profitLoss);(positionId,profitLoss)
        const dataArr = str.split(';')
        const accountData = dataArr[0].match(/\((.+)\)/)[1].split(',')
        const positionsProfitLoss = dataArr.slice(1).map(el => {
            const elData = el.replace(/\(|\)/g, '').split(',').map(parseFloat)
            return {
                positionId: elData[0],
                profitLoss: elData[1],
            }
        })
        this.floatProfitLoss({
            content: {
                availableMargin: accountData[2],
                balance: accountData[5],
                marginRadio: accountData[3],
                netWorth: accountData[4],
                occupyMargin: accountData[1],
                profitLoss: accountData[0],
                positionProfitLossMessages: positionsProfitLoss,
            }
        })
    }

    floatProfitLoss ({ content }) {
        this.$store.commit('_user/Update_accountAssets', content)
        if (content.positionProfitLossMessages.length > 0) {
            this.$store.commit('_trade/Update_positionProfitLossList', content.positionProfitLossMessages)
        }
    }

    // 处理异地登录踢出
    disconnect (data) {
        document.body.dispatchEvent(new Event('GotMsg_disconnect'))
    }

    // 消息通知
    notice (data) {
        // 刷新字段：updateType
        // NO_MOVEMENT(0 ,"无动作"),
        // POSITION(1 ,"刷新仓位"),
        // ORDER(2 ,"刷新挂单"),
        // AMOUNT(3 ,"刷新资金"),
        // LOGOUT(4 ,"踢出"),
        // POSITION_AND_ORDER(5, "同时刷新挂单、仓位"),
        if (data.updateType === 1) {
            this.$store.dispatch('_trade/queryPositionPage')
        } else if (data.updateType === 2) {
            this.$store.dispatch('_trade/queryPBOOrderPage')
        } else if (data.updateType === 4) {
            this.handlerLogout()
        } else if (data.updateType === 5) {
            this.$store.dispatch('_trade/queryPositionPage')
            this.$store.dispatch('_trade/queryPBOOrderPage')
        }

        // 展示字段：show
        // NO_MOVEMENT(0 ,"无动作"),
        // POPUP(1 ,"弹窗"), // 显示顶部消息
        if (data.show === 1) {
            const event = new CustomEvent('GotMsg_notice', { detail: data })
            document.body.dispatchEvent(event)
        }
    }

    // 踢出消息
    UserForceLogoutRet () {
        const detail = {}
        document.body.dispatchEvent(new CustomEvent('GotMsg_UserForceLogoutRet', { detail }))
    }
}

export default SocketEvent
