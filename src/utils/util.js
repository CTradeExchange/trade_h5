import pako from 'pako'

export const mobileReg = /^(13|14|15|16|17|18|19)\d{9}$/
export const emailReg = new RegExp('^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$')
export const bankNoReg = /^([1-9]{1})(\d{11}|\d{15}|\d{16}|\d{17}|\d{18})$/

export const randomId = () => {
    const r = Math.random() + Math.random() + Math.random()
    return r.toString().slice(2)
}

export function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    }) + '-' + Date.now()
}

// Gzip解压 对应wp接口数据
export function unzip (str) {
    let strData = atob(str)
    const charData = strData.split('').map((t) => (t.charCodeAt(0)))
    const binData = new Uint8Array(charData)
    const data = pako.inflate(binData)
    strData = String.fromCharCode.apply(null, new Uint16Array(data))
    strData = decodeURIComponent(strData)
    console.warn('解压字符', JSON.parse(strData))
    return strData
}
// 获取设备类型
export function getDevice () {
    let openFrom = 1 // h5
    const checkUA = navigator.userAgent.match(/(\(.+?\))/)
    if (!checkUA) {
        openFrom = 1 // H5
    } else if (/iPhone/i.test(checkUA[0])) {
        openFrom = 1 // H5
    } else if (/windows/i.test(checkUA[0])) {
        openFrom = 4 // PCUI_Windows
    } else if (/Mac OS/i.test(checkUA[0])) {
        openFrom = 5 // PCUI_Mac
    } else if (window.JsHook && window.JsHook.appGoDeposit) {
        openFrom = 6 // APP_Andorid
    } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.appGoDeposit) {
        openFrom = 7 // APP_IOS
    } else if (window.JsHook && JsHook.appOpenBrower) {
        openFrom = 2 // H5_Android
    } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.appOpenBrower) {
        openFrom = 3 // H5_IOS
    }
    return openFrom
}

// 获取连接参数
export function getQueryVariable (variable, search = location.search) {
    if (!search) {
        return undefined
    }
    var query = search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (pair[0] == variable) { return decodeURIComponent(pair[1]) }
    }
    return undefined
}

// 获取登录参数
export function getLoginParams () {
    return JSON.parse(localStorage.getItem('loginParams'))
}
// 删除登录参数
export function removeLoginParams () {
    localStorage.removeItem('loginParams')
    sessionStorage.removeItem('token')
}
// 设置登录token
export function setToken (token) {
    return sessionStorage.setItem('token', token)
}
// 获取登录token
export function getToken () {
    return sessionStorage.getItem('token')
}
export function localSet (key, val) {
    return localStorage.setItem(key, val)
}
export function localGet (key) {
    return localStorage.getItem(key)
}
// 格式化价格
export function priceFormat (price, digits) {
    const _price = price / Math.pow(10, digits)
    return _price.toFixed(digits)
}

/* 延迟处理 */
let awaitCount = 0
export function delayAwait (fn, reset = true) {
    if (reset) awaitCount = 0
    return new Promise((resolve, reject) => {
        console.log(`>> Await count:: ${awaitCount * 200}ms`)
        const flag = fn()
        if (flag) {
            return resolve(flag)
        } else {
            return awaitCount < 100 ? reject() : resolve()
        }
    }).catch(() => {
        return new Promise(resolve => {
            awaitCount++
            setTimeout(resolve, 200)
        }).then(() => delayAwait(fn, false))
    })
}
/* 获取字符长度 */
export const getLen = (str = '') => str.replace(/\p{Unified_Ideograph}/ug, '01').length

/* 判断参数是否为空 */
export function isEmpty (obj) {
    try {
        if (obj == null || obj == undefined) {
            return true
        }
        // 判断数字是否是NaN
        if (typeof obj === 'number') {
            if (isNaN(obj)) {
                return true
            } else {
                return false
            }
        }
        // 判断参数是否是布尔、函数、日期、正则，是则返回false
        if (typeof obj === 'boolean' || typeof obj === 'function' || obj instanceof Date || obj instanceof RegExp) {
            return false
        }
        // 判断参数是否是字符串，去空，如果长度为0则返回true
        if (typeof obj === 'string') {
            if (obj.trim().length == 0) {
                return true
            } else {
                return false
            }
        }

        if (typeof obj === 'object') {
            // 判断参数是否是数组，数组为空则返回true
            if (obj instanceof Array) {
                if (obj.length == 0) {
                    return true
                } else {
                    return false
                }
            }

            // 判断参数是否是对象，判断是否是空对象，是则返回true
            if (obj instanceof Object) {
                // 判断对象属性个数
                if (Object.getOwnPropertyNames(obj).length == 0) {
                    return true
                } else {
                    return false
                }
            }
        }
    } catch (e) {
        console.log(e)
        return false
    }
}

/**
 * @desc 函数防抖(用于异步Promise)
 * @param func 函数
 * @param wait 延迟执行毫秒数
 */
export function debounce (fn, delay = 500) {
    // timer 是在闭包中的
    let timer = null
    return function () {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
        }, delay)
    }
}

export function debounce2 (func, wait, immediate) {
    var timeout, result
    return function () {
        var context = this
        var args = arguments

        if (timeout) clearTimeout(timeout)
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout
            timeout = setTimeout(function () {
                timeout = null
            }, wait)
            if (callNow) result = func.apply(context, args)
        } else {
            timeout = setTimeout(function () {
                func.apply(context, args)
            }, wait)
        }
        return result
    }
}
