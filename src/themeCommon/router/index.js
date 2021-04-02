// import { createRouter, createWebHistory } from 'vue-router'
const routes = [
    {
        path: '/withdraw',
        name: 'Withdraw',
        component: () => import(/* webpackChunkName: "withdraw" */ '../user/withdraw.vue'),
        meta: {
            title: '取款',
            footerMenu: false
        }
    },
    {
        path: '/withdrawRecord',
        name: 'WithdrawRecord',
        component: () => import(/* webpackChunkName: "withdrawRecord" */ '../user/withdrawRecord.vue'),
        meta: {
            title: '取款记录',
            footerMenu: false
        }
    },
    {
        path: '/addBank',
        name: 'AddBank',
        component: () => import(/* webpackChunkName: "addBank" */ '../user/addBank.vue'),
        meta: {
            title: '添加银行卡',
            footerMenu: false
        }
    },
    {
        path: '/desposit',
        name: 'Desposit',
        component: () => import(/* webpackChunkName: "addBank" */ '../user/desposit.vue'),
        meta: {
            title: '存款',
            footerMenu: false
        }
    },
    {
        path: '/despositRecord',
        name: 'DespositRecord',
        component: () => import(/* webpackChunkName: "addBank" */ '../user/depositRecord.vue'),
        meta: {
            title: '存款记录',
            footerMenu: false
        }
    }
]
// const router = createRouter({
//     history: createWebHistory(process.env.BASE_URL),
//     routes
// })
export default routes
