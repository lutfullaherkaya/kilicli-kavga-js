import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { io, Socket } from "socket.io-client";
Vue.use(Vuetify)

Vue.config.productionTip = false
Vue.prototype.$socket = io();

new Vue({
    vuetify: new Vuetify(),
    router,
    render: h => h(App)
}).$mount('#app')
