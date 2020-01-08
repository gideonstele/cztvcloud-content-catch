import $ from 'jquery';
import Vue from 'vue';
import shortid from 'shortid';
import './lib/install';

import { catchHtml } from './lib/catch';
import findEntryDom  from './lib/findEntryDom';

import './style/content_style.scss';
import Box from './components/box.vue';

const BOXID = '___cztvcloud_catch_box';
let domready = false;

console.log('cztvcloud catch script loaded!');

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
        <Box ref="box" :handleCatch="handleCatch" />
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
      injectEntryDom(selector) {
        this.$refs.box.injectEntryDom(selector);
      },
    }
  });
  vm.$mount(`#${BOXID}`);
  vm.injectEntryDom(findEntryDom());
  return vm;
};

$(() => {
  domready = true;
  appendBox();
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'catch:failed':
      ElementUI.MessageBox.alert(message.message, '抓取失败');
      break;
    default:
      break;
  }
});