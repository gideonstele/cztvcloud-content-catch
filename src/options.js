import Vue from 'vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import './style/option_style.scss';
import 'element-ui/lib/theme-chalk/index.css';

import storage from '_utils/localstore.js';
import App from './pages/AppOptions.vue';
import Common from './pages/views/Common.vue';
import Output from './pages/views/Output.vue';
import Sites from './pages/views/Sites.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'common',
      component: Common,
    },
    {
      path: '/output',
      name: 'output',
      component: Output,
    },
    {
      path: '/sites',
      name: 'sites',
      component: Sites,
    },
  ],
});

Vue.use(ElementUI, {
  size: 'small',
  zIndex: 3000,
});

(async () => {
  window.rootApp = new Vue({
    el: '#root',
    router,
    provide() {
      return {
        output: storage.namespace('output'),
        common: storage.namespace('common'),
        sites: storage.namespace('sites'),
      };
    },
    render: h => h(App),
  });
})();
