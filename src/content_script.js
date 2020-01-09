import $ from 'jquery';
import Vue from 'vue';
import shortid from 'shortid';
import './lib/install';

import { catchHtml } from './lib/catch';
import findEntryDom  from './lib/findEntryDom';
import storage from './utils/localstore';

import './style/content_style.scss';
import Box from './components/box.vue';

const BOXID = '___cztvcloud_catch_box';
let domready = false;

console.log('cztvcloud catch script loaded!');

window.config = {};

const getConfig = async () => {
  const cfgCommon = await storage.get(['common', location.hostname]);
  return _.merge(...Object.values(cfgCommon));
};

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
      async handleCatch(selector) {
        const formatted = await catchHtml(selector);
        console.log(formatted);
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

$(async () => {
  domready = true;
  // 取到配置放在这里
  window.config = await getConfig();
  console.log(config);
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