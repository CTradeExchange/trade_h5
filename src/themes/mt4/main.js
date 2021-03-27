import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VantBase from './vantBase'
import Socket from '@/plugins/socket/socket'

const app = createApp(App)

app.use(VantBase).use(store).use(router).use(Socket, { $store: store })
store.dispatch('_base/getCompanyInfo').then(() => {
    app.mount('#app')
})
