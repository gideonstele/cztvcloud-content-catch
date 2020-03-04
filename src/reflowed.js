import $ from 'jquery';
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import Dialog from './components/ImageEditDialog.vue'

Vue.use(ElementUI);

console.log('reflow ready')
const dialogID = "__img_edit_dialog";
const clipDialog = (img) => {
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

const getArticleFromTag = () => {
  const p = document.createElement("p");
  p.style.fontSize = "16px";
  p.style.lineHeight = 1.75;
  p.style.textAlign = "justify";
  p.textContent = "来源：";
  return p;
}
const copy = (e) => {
  const node = document.createElement('div');
  const range = window.getSelection().getRangeAt(0);
  const selectedData = range.cloneContents();
  
  if(!selectedData.lastChild.textContent && !selectedData.lastChild.hasChildNodes()){
    selectedData.lastChild.remove();
  }
  selectedData.appendChild(getArticleFromTag());
  node.appendChild(selectedData);
  const htmlData = node.innerHTML;

  event.clipboardData.setData("text/html", htmlData);
  event.clipboardData.setData("text/plain", range);
  e.preventDefault();
};

// todo 接收到处理后的图文页面并显示
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const app = document.getElementById('app');
  if (message.error) {
    app.innerHTML = 'error';
  } else {
    app.innerHTML = message.html;
    app.addEventListener('copy', copy);
    $("img").click(e => clipDialog(e.target));
  }
});