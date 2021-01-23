import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VantBase from './vantBase'
const app = createApp(App)
app.use(VantBase).use(store).use(router).mount('#app')
