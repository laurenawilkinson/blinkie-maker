import Vue from 'vue';
import App from './App.vue';
import './css/main.scss';

new Vue({ render: createElement => createElement(App) })
  .$mount('#app');