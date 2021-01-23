import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@ct/layout/index'

const routes = [
    {
        path: '/',
        redirect: '/home',
        component: Layout,
        children: [
            {
                path: '/home',
                name: 'Home',
                component: () => import(/* webpackChunkName: "home" */ '../views/home.vue'),
                meta: {
                    title: '关注列表'
                }
            },
        ]
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import(/* webpackChunkName: "search" */ '../views/search.vue'),
        meta: {
            title: '搜索'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '../views/login.vue'),
        meta: {
            title: '登录'
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/register/register.vue'),
        meta: {
            title: '注册开户'
        }
    },
    {
        path: '/register/success',
        name: 'RegisterSuccess',
        component: () => import('../views/register/registerSuccess.vue'),
        meta: {
            title: '注册开户'
        }
    },
    {
        path: '/forgot',
        name: 'Forgot',
        component: () => import('../views/forgot/forgot.vue'),
        meta: {
            title: '找回密码'
        }
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
