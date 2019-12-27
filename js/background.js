// 注入全局
window.EventEmitter = window.EventEmitter2;
// 注入全局
// window.observe;

window.getConfig = function (key) {
  if (key) {
    return window.localStorage.getItem(key);
  }
  return Object.assign({}, window.localStorage);
};

window.setConfig = function (key, value = '') {
  return window.localStorage.setItem(key, value);
};

if (!window.localStorage.length) {
  window.setConfig('show_content_frame', 'true');
}

window.sendMessageToActiveContent = function sendMessageToActiveContent(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        resolve(response);
      });
    });
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch(request.action) {
    case 'ready':
      sendResponse(true);
      break;
    case 'config:get':
      sendResponse(window.getConfig(request.key));
      break;
    case 'catch:start':
      break;
    case 'catch:complete':
      break;
  }
});

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.insertCSS(null, {
    file: 'styles/box.css'
  });
  chrome.tabs.executeScript(null, {
    file: 'js/ttkyh_parse.js'
  });
});