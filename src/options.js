import Vue from 'vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import './style/option_style.scss';
import 'element-ui/lib/theme-chalk/index.css';

import App from './pages/AppOptions.vue';
import Common from './pages/views/Common.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: { name: 'common' },
    },
    {
      path: '/common',
      name: 'common',
      component: Common,
    }
  ],
});

Vue.use(ElementUI, {
  size: 'small',
  zIndex: 3000,
});

new Vue({
  el: '#root',
  router,
  render: h => h(App),
});