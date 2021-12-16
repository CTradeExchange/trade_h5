import { tradeService } from '@/config'
import CreateSocket from './createSocket'
import QuoteSocketEvent from './quoteSocketEvent'
import MsgSocketEvent from './msgSocketEvent'
import { ungzip } from './socketUtil'
import { getToken } from '@/utils/util.js'

export const QuoteSocket = new QuoteSocketEvent() // 行情websocket
export const MsgSocket = new MsgSocketEvent() // 消息websocket
if (process.env.NODE_ENV === 'development') {
    window.QuoteSocket = QuoteSocket
    window.MsgSocket = MsgSocket
}

/** 获取 - 行情服务websocket地址
 * 游客用户使用 /quote_guest
 * 登录用户使用 /quote
 */
export const getQuoteService = () => {
    const token = getToken()
    let quoteService = window['quoteService']
    if (0 && token) {
        quoteService += '?token=' + token
    } else {
        quoteService = quoteService.replace('/quote', '/quote_guest')
    }
    return quoteService
}

/** 设置 - 行情服务websocket地址 */
export const setQuoteService = () => {
    const url = getQuoteService()
    QuoteSocket.ws.url = url
    QuoteSocket.ws.close()
    setTimeout(() => {
        QuoteSocket.ws.open()
    }, 300)
}

export default {
    install: (app, { $store, $router } = {}) => {
        const quoteService = getQuoteService()
        const msgService = window['msgService']
        const quoteWS = CreateSocket(quoteService)
        const msgWS = CreateSocket(msgService)
        const tradeWS = CreateSocket(tradeService)

        QuoteSocket.init(quoteWS, $store, $router)
        MsgSocket.init(msgWS, $store, $router)
        app.config.globalProperties.$QuoteSocket = QuoteSocket
        app.config.globalProperties.$MsgSocket = MsgSocket

        quoteWS.open()
        msgWS.open()

        quoteWS.addEventListener('message', evt => {
            if (typeof evt.data === 'string' && evt.data.startsWith('p(')) {
                return QuoteSocket.tick(evt.data)
            } else if (typeof evt.data === 'string' && evt.data.startsWith('pt(')) {
                const event = new CustomEvent('GotMsg_updateChart', { detail: evt.data })
                document.body.dispatchEvent(event)
                return QuoteSocket.deal_tick(evt.data)
            } else if (typeof evt.data === 'string' && evt.data.startsWith('pd(')) {
                return QuoteSocket.handicap_tick(evt.data)
            } else if (typeof evt.data === 'string' && evt.data.indexOf('{') !== 0) return

            try {
                if (typeof evt.data === 'object') {
                    ungzip(evt.data).then(res => {
                        QuoteSocket.onMessage(res)
                    })
                } else {
                    const data = JSON.parse(evt.data)
                    QuoteSocket.onMessage(data)
                }
            } catch (error) {

            }
        })

        quoteWS.addEventListener('open', function () {
            QuoteSocket.initPing() // 心跳
            QuoteSocket.onOpen() // 连接成功
        })
        quoteWS.addEventListener('close', function (err) {
            console.warn('quoteWS close', err)
        })

        msgWS.addEventListener('open', function () {
            MsgSocket.initPing() // 心跳
            MsgSocket.onOpen() // 连接成功
        })

        msgWS.addEventListener('close', function (err) {
            console.warn('msgWS close', err)
            MsgSocket.onDisconnect() // 断开链接
        })

        msgWS.addEventListener('message', evt => {
            if (typeof evt.data === 'string' && evt.data.startsWith('f(')) return MsgSocket.positionsTick(evt.data, 1)
            else if (typeof evt.data === 'string' && evt.data.startsWith('g(')) return MsgSocket.positionsTick(evt.data, 2)
            if (typeof evt.data === 'object' || evt.data.indexOf('{') !== 0) return
            try {
                const data = JSON.parse(evt.data)
                MsgSocket.onMessage(data)
            } catch (error) {}
        })

        tradeWS.addEventListener('open', function () {
            tradeWS.send(JSON.stringify({
                'header': {
                    'trace': 'trace',
                    'token': 'token',
                    'bizType': 'ping',
                    'sendTime': Date.now(),
                    'lang': 'zh-CN'
                }
            }))
        })
    }
}
