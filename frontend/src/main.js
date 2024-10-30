import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import '@/config/firebaseInit';
import firebaseApp from '@/config/firebaseInit';
import { VueFire } from 'vuefire'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import '@formkit/themes/genesis'
import '@formkit/pro/genesis'
import { plugin, defaultConfig } from '@formkit/vue'
import { createProPlugin, inputs } from '@formkit/pro'
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';


/**
 * CSS files
 */

import "@/assets/css/index.css";
import "@/assets/css/driver.css";


const pro = createProPlugin('fk-12603cbaaf0', inputs)

const app = createApp(App).use(store).use(router).use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
      // we will see other modules later on
      // VueFireAuth(),
    ],
})
app.use(ToastPlugin,{position: 'top-right'});
app.use(plugin, defaultConfig({ plugins: [pro]}))
app.mount('#app');
// Use plugin defaults (optional)
app.component('VDatePicker', DatePicker)

// SIDEBAR
let element = document.createElement('div');
element.id="my-sidebar"
document.getElementById("app")?.appendChild(element)
// MODAL
element = document.createElement('div');
element.id="my-modal"
document.getElementById("app")?.appendChild(element)
// DROP DOWN
element = document.createElement('div');
element.id="my-dropdown"
document.getElementById("app")?.appendChild(element)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(() => {
      console.info('Service worker registered:');
    })
    .catch((error) => {
      console.info('Service worker registration failed:', error);
    });
}