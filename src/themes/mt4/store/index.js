import { createStore } from 'vuex'
import Base from '@/store/modules/base'
import User from '@/store/modules/user'
import Quote from '@/store/modules/quote'
import Trade from '@/store/modules/trade'
import { getListByParentCode } from '@/api/base'
import Colors from '@m/colorVariables'

const style = {
    ...Colors
}

export default createStore({
    modules: {
        _base: Base,
        _user: User,
        _quote: Quote,
        _trade: Trade,
    },
    state: {
        style,
        quoteMode: 2, // 1简单模式 2高级模式
        zoneList: [],
        bankDict: []
    },
    getters: {
        productActived (state) {
            return state._quote.productMap[state._quote.productActivedID]
        },
        customerGroupId (state) { // 用户组ID
            return state._user.customerInfo?.customerGroupId ?? state._base.wpCompanyInfo?.customerGroupId
        },
        // 用户自选列表
        userSelfSymbolList (state, getters) {
            if (state._user.customerInfo?.optional === 1) {
                return state._user.selfSymbolList
            } else {
                const wpSelfSymbol = state._base.wpSelfSymbol
                const selfSymbolData = wpSelfSymbol.find(el => el.tag === 'selfSymbol')?.data?.product || {}
                const customerGroupId = getters.customerGroupId
                const selfSymbolIds = selfSymbolData[customerGroupId] ?? []
                const productMap = state._quote.productMap
                return selfSymbolIds.map(el => {
                    return productMap[el]
                })
            }
        },
        // 用户产品板块
        userProductCategory (state, getters) {
            let _result = []
            const customerGroupId = getters.customerGroupId
            const wpProductCategory = state._base.wpProductCategory
            const quoteListConfig = wpProductCategory.find(el => el.tag === 'quoteList')
            if (!quoteListConfig) return _result
            const categories = quoteListConfig.data.items || []
            _result = categories.map(el => {
                const newItem = {
                    code_ids: el.code_ids_all[customerGroupId] ?? []
                }
                return Object.assign(newItem, el)
            })
            return _result
        },
    },
    mutations: {
        Update_quoteMode (state, data = 1) {
            state.quoteMode = data
        },
        Update_zoneList (state, list) {
            state.zoneList = list
        },
        Update_bankList (state, list) {
            state.bankDict = list
        },
    },
    actions: {
        // 获取国家验区号
        getListByParentCode ({ dispatch, commit, state }) {
            return getListByParentCode({ parentCode: 'phone_code' }).then(res => {
                if (res.check()) {
                    // res.data.forEach(el => {
                    //     el.name += ' ' + el.code
                    // })
                    commit('Update_zoneList', res.data)
                }
                return res
            })
        },

        getBankDictList ({ dispatch, commit, state }) {
            return getListByParentCode({ parentCode: 'bank_code' }).then(res => {
                if (res.check()) {
                    commit('Update_bankList', res.data)
                }
                return res
            })
        }
    }
})
