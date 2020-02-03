import $ from 'jquery';
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import Dialog from './components/ImageEditDialog.vue'

Vue.use(ElementUI);

console.log('reflow ready')
const dialogID = "__img_edit_dialog";
const clipImg = (img) => {
  const dialog = document.getElementById(dialogID);
  if(!dialog) {
    $(document.body).append(`<div id="${dialogID}"></div>`)
  }
  
  new Vue({
    el: `#${dialogID}`,
    provide() {
      return {
        originImage: img
      }
    },
    render: h => h(Dialog),
  });
}

// todo 接收到处理后的图文页面并显示
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const app = document.getElementById('app');
  if (message.error) {
    app.innerHTML = 'error';
  } else {
    app.innerHTML = message.html;
    $("img").click(e => clipImg(e.target));
  }
});