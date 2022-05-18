import { computed, ref, unref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { debounce } from '@/utils/util'
import { fundCalcApplyShares, fundApply, fundRedeem } from '@/api/fund'
import { Toast } from 'vant'
import { minus } from '@/utils/calculation'

export const useFund = () => {
    const store = useStore()

    // 获取基金产品列表
    const getFundList = (params = {}) => {
        return store.dispatch('_quote/findFundPage', params)
    }
    const fundProductList = computed(() => store.state._quote.fundProductList)
    const fundInfo = computed(() => store.state._quote.fundInfo)

    // 获取基金净值等数据
    const getFundValue = (fundId) => {
        return store.dispatch('_quote/fundNetValue', { fundId })
    }
    // 获取基金详情
    const getFundInfo = (fundId) => {
        return store.dispatch('_quote/queryFundInfo', fundId)
    }

    return {
        getFundList,
        fundProductList,
        fundInfo,
        getFundValue,
        getFundInfo
    }
}

export const orderHook = (params) => {
    const { t } = useI18n({ useScope: 'global' })
    const store = useStore()

    const loading = ref(false)
    // 基金底层资产列表
    const fundAssetsList = ref([])
    // 单资产需要支付的资产
    const singleAssetsPay = ref(null)
    // 一篮子需要支付的资产
    const selfAssetsList = ref([])
    // 当前选择的资产数据
    const activeAssets = ref({})

    const activeCurrency = ref(null) // 申购的时候表示支付资产，赎回的时候表示接受资产
    const accountList = computed(() => store.state._user.customerInfo?.accountList?.filter(el => el.tradeType === 5)) // 现货玩法的账户列表
    const curAccount = computed(() => accountList.value?.find(el => el.currency === activeCurrency.value))
    const isLogin = computed(() => !!store.state._user.customerInfo?.customerNo)

    // 基金产品信息
    const { fund, direction } = params
    const activeCurrencyList = computed(() => {
        const purchaseCurrencySetting = unref(fund)?.purchaseCurrencySetting ?? []
        const redemptionCurrencySetting = unref(fund)?.redemptionCurrencySetting ?? []
        const resultList = direction === 'buy' ? purchaseCurrencySetting : redemptionCurrencySetting
        return resultList
    })

    // 处理后需要支付的资产
    const lastAssetsPay = computed(() => {
        const result = []
        // 一篮子资产

        if (activeCurrency.value === 'self') {
            fundAssetsList.value && fundAssetsList.value.map(elem => {
                const item = {
                    currency: elem.currencyCode,
                    amountPay: '0.00',
                    isShow: false
                }
                const account = accountList.value?.find(el => el.currency === item.currency)
                const payItem = selfAssetsList.value.find(el => el.currency === item.currency)
                if (account && payItem) {
                    item.isShow = true
                    item.available = account.available
                    item.amountPay = payItem.amount
                    // 计算需要充值的金额
                    item.depositAmount = minus(item.amountPay, item.available)
                }
                result.push(item)
            })
        } else {
            // 单资产
            const item = {
                currency: activeCurrency.value,
                amountPay: '0.00',
                isShow: false
            }
            const account = accountList.value?.find(el => el.currency === item.currency)
            const payItem = singleAssetsPay.value
            if (account && payItem) {
                item.isShow = true
                item.available = account.available
                item.amountPay = payItem.amountPay
                // 计算需要充值的金额
                item.depositAmount = minus(item.amountPay, item.available)
            }
            result.push(item)
        }
        return result
    })

    // 获取基金详情
    store.dispatch('_quote/queryFundInfo', fund.fundId).then(res => {
        if (res.check()) {
            fundAssetsList.value = fund.fundCurrencyList
            activeCurrency.value = activeCurrencyList.value[0]?.currencyCode
            activeAssets.value = activeCurrencyList.value[0]
            updateAccountAssetsInfo(direction === 'buy' ? activeCurrency.value : res.data.shareTokenCode)
        }
    })

    // 获取基金净值等数据
    const getFundValue = () => {
        return store.dispatch('_quote/fundNetValue', { fundId: fund.fundId })
    }

    // 获取基金详情
    const getFundInfo = () => {
        return store.dispatch('_quote/queryFundInfo', fund.fundId)
    }

    // 获取申购手续费
    const calcApplyShares = (val) => {
        getCalcApplyFee(val, activeCurrency.value)
    }

    // 获取基金净值等数据
    const queryFundNetValue = () => {
        store.dispatch('_quote/fundNetValue', { fundId: fund.fundId })
    }

    // 点击申购
    const submitFundApply = (params) => {
        if (!params?.amountPay) {
            return Toast(t('fundInfo.subScriptePlaceholder'))
        }
        loading.value = true
        return fundApply(params).then(res => {
            loading.value = false
            updateAccountAssetsInfo(activeCurrency.value)
            getFundValue()
            getFundInfo()
            return res
        })
    }

    // 点击赎回
    const submitFundRedeem = (params) => {
        if (!params?.shares) {
            return Promise.resolve().then(() => Toast(t('fundInfo.redeemNumPlaceholder')))
        }
        loading.value = true
        return fundRedeem(params).then(res => {
            loading.value = false
            updateAccountAssetsInfo(fund.shareTokenCode)
            getFundValue()
            getFundInfo()
            return res
        })
    }

    // 申购赎回可选择的资产列表数据
    const selectActions = computed(() => {
        const resultList = activeCurrencyList.value.map(el => {
            return {
                ...el,
                name: el.currencyCode
            }
        })
        return resultList
    })

    // 选择资产
    const onSelect = (value) => {
        activeCurrency.value = value.currencyCode
        activeAssets.value = value
        updateAccountAssetsInfo(value)
    }

    // 更新单个资产详情
    const updateAccountAssetsInfo = (currency) => {
        const account = accountList.value?.find(el => el.currency === currency)
        if (!account) return false
        store.dispatch('_user/queryAccountAssetsInfo', {
            tradeType: 5,
            accountId: parseInt(account.accountId)
        })
    }

    const calcApplyFee = ref('') // 获取申购手续费
    const calcShares = ref('') // 获取申购份额
    const calcSharesNet = ref('') // 获取申购手净值
    const getCalcApplyFee = (amountPay, currencyPay) => {
        if (!amountPay) {
            singleAssetsPay.value = null
            selfAssetsList.value = []
            return false
        }

        if (Number(amountPay) < Number(activeAssets.value.minPurchaseNum)) {
            singleAssetsPay.value = null
            selfAssetsList.value = []
            return Toast('单笔最小申购份额是' + activeAssets.value.minPurchaseNum)
        }

        fundCalcApplyShares({
            amountPay,
            currencyPay,
            applyType: 2,
            fundId: parseInt(fund.fundId)
        }).then(res => {
            if (res.check()) {
                const { data } = res
                if (activeCurrency.value === 'self') {
                    selfAssetsList.value = data.list || []
                } else {
                    singleAssetsPay.value = data
                }
                // calcApplyFee.value = data.fees
                // calcShares.value = data.shares
                // calcSharesNet.value = data.sharesNet
                // getFundValue()
            }
        })
    }

    // 获取基金净值等数据
    queryFundNetValue()

    return {
        fund,
        accountList,
        loading,
        calcApplyShares,
        submitFundApply,
        submitFundRedeem,
        selectActions,
        onSelect,
        activeCurrency,
        curAccount,
        updateAccountAssetsInfo,
        calcApplyFee,
        calcShares,
        calcSharesNet,
        getFundValue,
        getFundInfo,
        isLogin,
        lastAssetsPay,
        activeAssets,
        fundAssetsList,
        queryFundNetValue
    }
}
