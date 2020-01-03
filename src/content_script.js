import $ from 'jquery';
import Vue from 'vue';
import uuid from 'uuid';

import Box from './components/box.vue';

const BOXID = '___cztvcloud_catch_box';
let domready = false;

const appendBox = () => {
  const $box = document.getElementById(BOXID);
  if (!$box) {
    $(document.body).append(`<div id="${BOXID}"></div>`);
  }
  const vm = new Vue({
    component: {
      Box
    },
    data: {
      _P: uuid(),
      _B: BOXID,
    },
    template: `
      <div :id="_B">
        <Box :uuid="_P" :handleCatch="handleCatch" />
      </div>
    `,
    methods: {
      handleCatch() {
        chrome.runtime.sendMessage();
      },
    }
  })
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