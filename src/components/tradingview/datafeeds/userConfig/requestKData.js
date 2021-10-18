import dayjs from 'dayjs'
import { QuoteSocket } from '@/plugins/socket/socket'
let isLog = false // 是否输出日志

export class RequestKData {
    constructor() {
        // 最新一根k数据
        this._latestBar = null
        // 产品信息
        this._product = {}
    }

    setProduct(productInfo){
        Object.assign(this._product, productInfo)
    }
    getKline(params, firstDataRequest) {
        if (firstDataRequest) {
            // 第一次调用此商品/周期的历史记录
            this.setProduct({
                symbolId: params.symbolId,
                klineType: params.klineType,
                tradeType: params.tradeType
            })
            this._latestBar = null
        }

        const _params = {
            "trade_type": params.tradeType,
            "symbol_id": params.symbolId,
            "kline_type": params.klineType,
            "kline_timestamp_end": params.endTime,
            "query_kline_num": params.countBack
        }

        return requestKline(_params, 'history')
            .then(res => {
                if (firstDataRequest) {
                    if (res.data.bars.length) {
                        // 记录最新bar
                        this._latestBar = { ...res.data.bars[res.data.bars.length - 1] }
                    }
                }
                return res
            })
            .then(res => {
                if(!res.data.bars.length){
                    Object.assign(res.data, {
                        meta: {
                            noData: true
                        }
                    })
                }
                return res.data
            })
    }

    // 统一处理tick（替换或请求最新两根数据）
    async normalizeTick(price, tickTime, resolution) {
        const latestBar = this._latestBar

        if (!price || !latestBar) {
            return
        }
        let ticks = []

        if (isSameTime(resolution, latestBar.time, tickTime)) {
            // 最新一条数据
            ticks.push({
                time: latestBar.time,
                open: latestBar.open,
                high: Math.max(latestBar.high, price),
                low: Math.min(latestBar.low, price),
                close: Number(price),
            })
        } else {
            // 最新两条数据
            ticks = await this._getLatestKline()
        }

        this._latestBar = ticks[ticks.length - 1]
        isLog && logMessageForTick(ticks)

        return Promise.resolve(ticks)
    }

    // 获取最新两条数据
    _getLatestKline() {
        const params = {
            "trade_type": this._product.tradeType,
            "symbol_id": this._product.symbolId,
            "kline_type": this._product.klineType,
            "query_kline_num": 2
        }
        return requestKline(params)
            .then(res => {
                return res.data.bars
            })
    }
}


// 历史k线
function requestKline(params, type) {
    return new Promise((resolve) => {
        const fn = () => {
            if (QuoteSocket.ws.readyState === 1) {
                resolve()
            } else {
                setTimeout(fn, 1000)
            }
        }
        fn()
    })
        .then(() => {
            return QuoteSocket.send(14012, params)
                .then(res => {
                    isLog && type === 'history' &&logMessageForKline(res, params)

                    const checkResult = validateRes(res)
                    if (checkResult) {
                        return checkResult
                    }

                    const { kline_list, price_digits } = res.data
                    // const pow = Math.pow(10, price_digits)
                    const bars = kline_list.map(e => ({
                        time: parseFloat(e.timestamp * 1000),
                        close: parseFloat(e.close_price),
                        open: parseFloat(e.open_price),
                        high: parseFloat(e.high_price),
                        low: parseFloat(e.low_price),
                    }))

                    return {
                        data: {
                            bars
                        }
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        })
}

// 校验两个时间是否属于同一根K线
function isSameTime(resolution, latestTime, tickTime) {
    latestTime = latestTime * 1
    tickTime = tickTime * 1
    if (latestTime > tickTime) return true

    let oldTime = dayjs(latestTime)
    let newTime = dayjs(tickTime)

    if (/^[0-9]+$/.test(resolution)) {
        // 小于日k
        const oldMinutes = oldTime.hour() * 60 + oldTime.minute()
        const newMinutes = newTime.hour() * 60 + newTime.minute()
        // console.log(oldMinutes, newMinutes)
        return newMinutes - oldMinutes < resolution
    } else {
        switch(resolution){
            case '1D':{
                return oldTime.startOf('day').valueOf() ===newTime.startOf('day').valueOf()
            }
            case '1W':{
                return oldTime.startOf('week').valueOf() ===newTime.startOf('week').valueOf()
            }
            case '1M':{
                return oldTime.startOf('month').valueOf() ===newTime.startOf('month').valueOf()
            }
        }
    }

}

function validateRes(res) {
    if (res.ret !== 200) {
        return {
            bars: [],
            meta: {
                noData: true,
            }
        }
    }
    return null
}


function logMessageForKline(res, params) {
    if(!res.data.kline_list.length){
        console.log('%c----所有历史K线已请求完毕，不再继续请求----', 'color:green')
    } else {
        const klineList = res.data.kline_list
        console.groupCollapsed(`%c请求历史k线:⬇`, `color:${res.ret === 200 ? 'green' : 'red'}`)
        console.log(`共{${klineList?.length}}条数据, 区间[${klineList[0].timestamp}, ${klineList[klineList.length - 1]?.timestamp}]`)
        console.log('request:', JSON.stringify(params, null, ' '))
        console.log('response:', res)
        console.groupEnd()
    }
}

function logMessageForTick(ticks) {
    if (ticks.length === 1) {
        console.groupCollapsed('%c实时报价:⬇', 'color:green')
    } else {
        console.groupCollapsed('%c获取最新两根数据:⬇', 'color:green')
    }
    console.log(JSON.stringify(ticks), ticks.map(e => dayjs(e.time).format('YYYY/MM/DD HH:mm:ss')))
    console.groupEnd()
}
