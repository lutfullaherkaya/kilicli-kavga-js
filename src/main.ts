import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

Vue.config.productionTip = false


new Vue({
    vuetify: new Vuetify({
        theme: { dark: true },

    }),
    router,
    render: h => h(App)
}).$mount('#app')
