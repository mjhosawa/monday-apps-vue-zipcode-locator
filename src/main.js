import { createApp } from 'vue'
import App from './App.vue'
import mondaySdk from 'monday-sdk-js'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })
const app = createApp(App)

app.config.globalProperties.monday = mondaySdk()
app.config.productionTip = false

app.use(vuetify).mount('#app')
