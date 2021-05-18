import request from '@utils/request'
export function getPageConfig (id) {
    return request({
        url: '/wp-json/wp/v2/vi_page/',
        params: {
            page_code: id
        },
        method: 'get'
    })
}
export function modifyPageConfig (data) {
    return request({
        url: '/wp-json/wp/v2/vi_page',
        method: 'post',
        data: data
    })
}
export function pageList (data) {
    return request({
        url: '/wp-json/wp/v2/vi_list',
        params: data,
        method: 'get'
    })
}
export function accountGroup (data) {
    return request({
        url: '/wp-json/wp/v2/queryAccountGroup',
        method: 'get'
    })
}
export function querySymbolGroup (data) {
    return request({
        url: '/wp-json/wp/v2/querySymbolGroup',
        method: 'get'
    })
}
export function accountGroupSymbol (id) {
    return request({
        url: '/wp-json/wp/v2/queryAccountGroupSymbol',
        params: {
            accountGroupIds: id
        },
        method: 'get'
    })
}
// 发布
export function pushPage (data) {
    return request({
        url: '/wp-json/wp/v2/pushPage',
        data: data,
        method: 'post'
    })
}
export function getPushPageList (data) {
    return request({
        url: '/wp-json/wp/v2/getPushPageList',
        data: data,
        method: 'post'
    })
}

export function openAccountViewSet () {
    return request({
        url: '/wp-json/wp/v2/openAccountViewSett',
        method: 'get'
    })
}
export function checkEnvironment () {
    return request({
        url: '/wp-json/wp/v2/checkEnvironment',
        method: 'get'
    })
}
export function reloadSymbol () {
    return request({
        url: '/wp-json/wp/v2/reloadSymbol',
        method: 'get'
    })
}
export function reloadAccountGroup () {
    return request({
        url: '/wp-json/wp/v2/reloadAccountGroup',
        method: 'get'
    })
}
export function reloadAccountGroupByGroupId (data) {
    return request({
        url: '/wp-json/wp/v2/reloadAccountGroupByGroupId',
        method: 'get',
        params: data
    })
}

export function reloadSymbolGroup (data) {
    return request({
        url: '/wp-json/wp/v2/reloadSymbolGroup',
        method: 'get',
        params: data
    })
}

export function getInitPageCodeList (data) {
    return request({
        url: '/wp-json/wp/v2/getInitPageCodeList',
        method: 'get',
        params: data
    })
}
export function initPageByPageCode (data) {
    return request({
        url: '/wp-json/wp/v2/initPageByPageCode',
        data: data,
        method: 'post'
    })
}
export function updateDataToH5Index (data) {
    return request({
        url: '/wp-json/wp/v2/updateDataToH5Index',
        method: 'get'
    })
}
export function updateDataToH5IndexView (data) {
    return request({
        url: '/wp-json/wp/v2/updateDataToH5IndexView',
        method: 'get'
    })
}
export function rollBackReleasePage (data) {
    return request({
        url: '/wp-json/wp/v2/rollBackReleasePage',
        data: data,
        method: 'post'
    })
}
export function getCompanyInfo (data) {
    return request({
        url: '/wp-json/wp/v2/getCompanyInfo',
        data: data,
        method: 'get'
    })
}