import themeRouter from '@/themeCommon/router'
import Layout from '../layout/index'
// import popupLayout from '../layout/popupLayout'

const h5Children = [
    {
        path: 'depost',
        component: () => import(/* webpackChunkName: "Contract" */ '../views/contract/contract.vue'),
    }
]

const routes = [
    ...themeRouter,
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "Login" */ '../views/login/login.vue'),
        meta: {
            title: 'route.login',
            keepAlive: true,
            roles: [],
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import(/* webpackChunkName: "Register" */ '../views/register/register.vue'),
        meta: {
            title: 'route.register',
            keepAlive: true,
            roles: [],
        }
    },
    {
        path: '/forgot',
        name: 'Forgot',
        component: () => import(/* webpackChunkName: "Forgot" */ '../views/forgot/forgot.vue'),
        meta: {
            title: 'route.forgot',
            keepAlive: true,
            roles: [],
        }
    },
    {
        path: '/',
        redirect: '/home',
        name: 'Layout',
        component: Layout,
        keepAlive: true,
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import(/* webpackChunkName: "Home" */ '../views/home/home.vue'),
                meta: {
                    title: 'route.home',
                    keepAlive: true,
                    roles: [],
                },
                children: h5Children
            },
            {
                path: 'quote',
                name: 'Quote',
                component: () => import(/* webpackChunkName: "Quote" */ '../views/quote/quote.vue'),
                meta: {
                    title: 'route.quote',
                    keepAlive: true,
                    roles: [],
                },
                children: h5Children
            },
            {
                path: 'order',
                name: 'Order',
                component: () => import(/* webpackChunkName: "Order" */ '../views/order/order.vue'),
                meta: {
                    title: 'route.order',
                    keepAlive: true,
                    roles: [],
                }
            },
            {
                path: 'assets',
                name: 'Assets',
                component: () => import(/* webpackChunkName: "Assets" */ '../views/assets/assets.vue'),
                meta: {
                    title: 'route.assets',
                    keepAlive: true,
                    roles: [],
                }
            },
        ]
    },
    {
        path: '/:params/setting',
        name: 'Setting',
        component: {
            centerView: () => import(/* webpackChunkName: "Forgot" */ '../views/setting/setting.vue')
        },
        meta: {
            title: 'route.setting',
            keepAlive: true,
            roles: [],
        }
    },
]

export default routes
