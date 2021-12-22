import { localGet } from '@/utils/util'
import store from './store'
const colors = {
    common: {
        primary: '#2B70AE',
        riseColor: '#B72122',
        fallColor: '#2B70AE',
        warn: '#B72122',
        success: '#26a69a',
        focusColor: '#f2a11b'
    },
    night: {
        primaryAssistColor: '#2c2e3b',
        color: '#eaebee',
        normalColor: '#9294a3',
        minorColor: '#9294a3',
        placeholdColor: '#515366',
        contentColor: '#21262f',
        bgColor: '#191e24',
        assistColor: '#2c2e3b',
        lineColor: '#2c2e3b'
    },
    light: {
        primaryAssistColor: '#f4f7fc',
        color: '#333333',
        normalColor: '#656667',
        minorColor: '#999999',
        placeholdColor: '#c2c2c2',
        contentColor: '#ffffff',
        bgColor: '#f8f8f8',
        assistColor: '#f8f8f8',
        lineColor: '#eeeeee'
    },

    /* 'color': '#333',
    'mutedColor': '#989898',
    'placeholder': '#c2c2c2',
    'tabColor': '#333',
    'tabLine': '#333',
    'bdColor': '#e5e5e5',
    'btnColor': '#f6f6f6',
    'btnLine': '#e5e5e5',
    'btnText': '#333',
    'btnText2': '#989898',
    'btnSelected': '#ff7418',
    'btnInterval': '#e5e5e5',
    'iconColor': '#333',
    'iconColor2': '#333',
    'white': '#fff',
    'bgColor': '#f6f6f6',
    'riseColor': '#e3525c',
    'fallColor': '#10b873',
    'sellColor': '#E3525C',
    'buyColor': '#007AFF',
    'primary': '#477fd3',
    'lightenPrimary': '#f3f8ff',
    'success': '#10B873', */
}

// 更新body类
function updateBodyClass (themeColor) {
    const classList = document.body.classList
    if (!themeColor || classList.contains(themeColor)) return false
    classList.remove('light')
    classList.remove('night')
    classList.add(themeColor)
}

// 设置root变量
export function setRootVariable (themeColor, primaryColor) {
    const invertColor = themeColor || localGet('invertColor')
    const chartColorType = JSON.parse(localGet('chartConfig'))?.chartColorType || 1
    if (primaryColor) {
        colors.common.primary = primaryColor
    }
    const colorsArr = Object.assign(colors[invertColor], colors.common)
    updateBodyClass(invertColor)
    const { riseColor, fallColor } = colorsArr

    if (Number(chartColorType) === 1) {
        colorsArr.riseColor = fallColor
        colorsArr.fallColor = riseColor
    } else {
        colorsArr.riseColor = riseColor
        colorsArr.fallColor = fallColor
    }

    const style = document.body.style
    for (const key in colorsArr) {
        if (Object.hasOwnProperty.call(colorsArr, key)) {
            const el = colorsArr[key]
            style.setProperty(`--${key}`, el)
        }
    }
    store.commit('Update_style', colorsArr)
    sessionStorage.setItem('themeColors', JSON.stringify(colors))
}

export default colors
