const emitter = new window.EventEmitter2({
  delimiter: ':',
});

window.sendMessageToActiveContent = function sendMessageToActiveContent(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        resolve(response);
      });
    });
  });
};

// 创建一个响应式数据
function createReactiveData (data = {}) {
  const o = new Proxy(data, {
    get: (t, key, recevier) => {

    },
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'ready') {
    sendResponse(true);
  }
});