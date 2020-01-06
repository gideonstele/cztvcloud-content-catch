import $ from 'jquery';
import Vue from 'vue';
import shortid from 'shortid';
import ElementUI from 'element-ui';

import { catchHtml } from './lib/catch';

import './style/content_style.scss';
import Box from './components/box.vue';

const BOXID = '___cztvcloud_catch_box';

let domready = false;

console.log('script loaded!');

Vue.use(ElementUI, {
  size: 'small',
});

const appendBox = () => {
  const $box = document.getElementById(BOXID);
  if (!$box) {
    $(document.body).append(`<div id="${BOXID}"></div>`);
  }
  const vm = new Vue({
    components: {
      Box,
    },
    data: {
      uuid: shortid(),
      boxid: BOXID,
    },
    template: `
      <div :id="boxid">
        <Box :handleCatch="handleCatch" />
      </div>
    `,
    methods: {
      handleCatch(selector) {
        const formatted = catchHtml(selector);
        chrome.runtime.sendMessage({
          action: 'catch:complete',
          dom: formatted,
        });
      },
    }
  });
  vm.$mount(`#${BOXID}`);
  return vm;
};

$(() => {
  domready = true;
  appendBox();
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'catch':
      break;
    default:
      break;
  }
});