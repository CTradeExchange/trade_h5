import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import I18n, { setI18nLanguage, loadLocaleMessages } from './i18n/i18n.js'
import VantBase from './vantBase'
import MixinGlobal from './mixin'
import { Dialog } from 'vant'
import Socket, { MsgSocket } from '@/plugins/socket/socket'
import FindCustomerInfo from '@c/plugins/findCustomerInfo'
import longpress from '@/directives/longpress'
import Loading from '@/components/loading'
import PageComp from '@c/components/PageComp.vue'
import LayoutTop from '@c/layout/top'
import Colors, { setRootVariable } from './colorVariables'
import { setRouter } from '@/utils/request'
import { getLoginParams, getToken, isEmpty, removeLoginParams, checkUserKYC, localGet } from '@/utils/util'
import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: [-16, 20] })

// 调试工具
// import VConsole from 'vconsole'
// const Vconsole = new VConsole()

setRouter(router)
setRootVariable(Colors)

const app = createApp(App)
app.use(longpress)
app.use(VantBase).use(I18n).use(store).use(router)
app.use(Socket, { $store: store, $router: router }).use(FindCustomerInfo, { $store: store, $router: router, $I18n: I18n })
app.component('Loading', Loading)
app.component('LayoutTop', LayoutTop)
app.component('PageComp', PageComp)
app.mixin(MixinGlobal)

// 如果有缓存有登录信息，先执行异步登录或者拉取用户信息
const loginParams = getLoginParams()
const token = getToken()

// 启用新闻设置默认值
if (isEmpty(localStorage.getItem('openNews'))) {
    localStorage.setItem('openNews', true)
}

if (loginParams || token) store.commit('_user/Update_loginLoading', true)

// 获取到公司配置后初始化vue实例
store.dispatch('_base/initBaseConfig').then(async () => {
    // 设置语言
    const defaultLocal = localGet('lang')
    setI18nLanguage(I18n, defaultLocal)
    await loadLocaleMessages(I18n, defaultLocal)

    // 如果有缓存有登录信息，先执行异步登录或者拉取用户信息
    if (loginParams || token) {
        Promise.resolve().then(() => {
            if (loginParams) return store.dispatch('_user/login', loginParams)
            else return store.dispatch('_user/findCustomerInfo')
        }).then(res => {
            if (typeof (res.check) === 'function' && res.check()) {
                checkUserKYC({ res, Dialog, router, store, t: I18n.global.t })
            } else if (res.invalid && res.invalid()) {
                removeLoginParams()
                return false
            }
            // 登录消息websocket
            MsgSocket.subscribedListAdd(function () {
                MsgSocket.login()
            })
        })
    } else {
        store.dispatch('_quote/querySymbolBaseInfoList', null)
    }

    app.mount('#app')
})