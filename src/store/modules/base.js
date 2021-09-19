import { pageConfig, wpCompanyConfig, wpNav, wpSelfSymbolIndex } from '@/api/wpApi'
import { localSet, localGet, sessionSet } from '@/utils/util'
import dayjs from 'dayjs'

export default {
    namespaced: true,
    state: {
        inited: false, // 配置信息是否获取完成
        wpCompanyInfo: null, //   wordpress公司配置信息
        wpSelfSymbol: null, //   wordpress自选产品配置
        wpProductCategory: [], // wordpress配置的产品板块
        wpNav: null, //   wordpress公司配置信息
        plans: [] // [{ id: 1, name: 'CFD合约全仓' }, { id: 2, name: 'CFD合约逐仓' }, { id: 3, name: '现货杠杆全仓' }, { id: 9, name: 'ABCC现货撮合' }]
    },
    mutations: {
        UPDATE_inited (state, data) {
            state.inited = data
        },
        UPDATE_wpCompanyInfo (state, data) {
            if (data.companyId) sessionSet('companyId', data.companyId)
            if (state.wpCompanyInfo) {
                Object.assign(state.wpCompanyInfo, data)
            } else {
                state.wpCompanyInfo = data
            }
        },
        UPDATE_wpNav (state, data) {
            state.wpNav = data
        },
        UPDATE_selfSymbol (state, data) {
            state.wpSelfSymbol = data
        },
        Update_wpProductCategory (state, data = []) {
            state.wpProductCategory = data
        },
        Update_plans (state, data = []) {
            state.plans = data
        },
    },
    actions: {
        // 初始化基础配置信息，如公司配置、底部导航配置、自选产品配置、产品板块配置
        initBaseConfig ({ dispatch, commit }) {
            const baseList = [
                dispatch('getCompanyInfo'),
                dispatch('getChannelSett'),
                dispatch('getNav'),
                dispatch('getWpSelfSymbols'),
                dispatch('getProductCategory')
            ]
            return Promise.all(baseList).then(res => {
                commit('UPDATE_inited', true)
                return dispatch('_quote/setProductAllList', null, { root: true })
            })
        },
        // 获取公司配置信息
        getCompanyInfo ({ commit }) {
            return wpCompanyConfig().then(data => {
                if (data) {
                    commit('UPDATE_wpCompanyInfo', data)
                }
                return data
            })
        },
        // 获取渠道配置信息
        getChannelSett ({ commit }) {
            return pageConfig('channel_sett').then(data => {
                if (data) {
                    // if (data.tradeTypeCurrencyList) {
                    //     data.tradeTypeCurrencyList = data.tradeTypeCurrencyList.filter(el => el.allCurrency)
                    //     data.tradeTypeCurrencyList.forEach(el => {
                    //         // el.id = el.tradeType
                    //         el.name = el.alias || el.name
                    //     })
                    // }
                    sessionSet('utcOffset', 0 - new Date().getTimezoneOffset()) // 改成取本地时区时间，不找wp配置时间
                    // sessionSet('utcOffset', parseFloat(data.utcOffset) * 60)   改成取本地时区时间，不找wp配置时间
                    // if (!localGet('lang') && data.language?.val) localSet('lang', data.language.val)
                    commit('UPDATE_wpCompanyInfo', data)
                    commit('Update_plans', data.tradeTypeCurrencyList)
                }
                return data
            })
        },
        // 获取底部导航配置
        getNav ({ commit }) {
            return wpNav().then(data => {
                if (data) commit('UPDATE_wpNav', data)
                return data
            })
        },
        // 获取自选产品配置
        getWpSelfSymbols ({ commit }) {
            return wpSelfSymbolIndex().then(data => {
                if (data) commit('UPDATE_selfSymbol', data)
                return data
            })
        },
        // 获取产品板块
        getProductCategory ({ commit }) {
            return pageConfig('TradeIndex').then(data => {
                if (data) commit('Update_wpProductCategory', data)
                return data
            })
        },
        // 获取页面模块列表
        getPageConfig ({ commit, rootGetters }, pageName) {
            return pageConfig(pageName).then(modulesList => {
                const userAccountType = rootGetters['_user/userAccountType']
                const _result = modulesList.filter(item => {
                    const { accountType, expiryDate } = item.data
                    const hasRole = accountType.includes(userAccountType)
                    const inActiveTime = !expiryDate || expiryDate?.length === 0 ? true : dayjs().isBetween(expiryDate[0], expiryDate[1])
                    return hasRole && inActiveTime
                })
                return _result
            })
        },
    }
}
