console.log('background ready');

const sendMessageToActiveContent = function sendMessageToActiveContent(message) {
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
      sendMessageToActiveContent(true);
      break;
    case 'catch:complete':
      const url = chrome.extension.getURL('reflowed.html');
      chrome.tabs.create({ url }, function (tab) {
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, request.dom);
        }, 200);
      });
      break;
  }
});

chrome.browserAction.onClicked.addListener(function (tab) {
  // chrome.tabs.insertCSS(null, {
  //   file: 'dist/chunk_style.css'
  // });
  chrome.tabs.insertCSS(tab.id, {
    file: 'dist/content_script_style.css'
  });
  // chrome.tabs.executeScript(tab.id, {
  //   file: 'dist/vendors~content_script.js'
  // });
  chrome.tabs.executeScript(tab.id, {
    file: 'dist/content_script.js'
  });
});