import { img } from '@admin/components/baseConfig'
const config = {}
img.forEach(item => {
    config[item.name] = item
})
export default {
    title: '产品行情轮播',
    tag: 'productsSwipe',
    exclude: ['nav'], // 排除的页面code
    tagIcon: 'el-icon-s-marketing',
    document: 'https://element.eleme.cn/#/zh-CN/component/input',
    config: [
        {
            name: 'product',
            label: '产品ID',
            type: 'Product',
            default: {}
        }
    ]
}