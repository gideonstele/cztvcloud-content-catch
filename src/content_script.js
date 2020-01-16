import $ from 'jquery';
import Vue from 'vue';
import shortid from 'shortid';
import './lib/install';

// import { catchHtml } from './lib/catch';
import { catchHtml } from './lib/catchHtml';
import { common, output, matchedSite } from './lib/matchConfig';
import { findEntryDom } from './lib/findEntryDom';
import './style/content_style.scss';
import Box from './components/box.vue';

const BOXID = '___cztvcloud_catch_box';
console.log('cztvcloud catch script loaded!');

window.$ = $;

window.configs = {
  site: {},
  common: {},
  output: {},
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
  return vm;
};

$(async () => {
  // 取到配置放在这里
  const [ commonCfg, outputCfg, site ] = await Promise.all([
    common.get(),
    output.get(),
    matchedSite(location.href),
  ]);
  window.configs.site = site;
  window.configs.common = commonCfg;
  window.configs.output = outputCfg;
  const vm = appendBox();
  vm.injectEntryDom(findEntryDom());
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