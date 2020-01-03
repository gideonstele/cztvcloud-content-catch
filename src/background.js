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
    case 'catch:start':
      break;
    case 'catch:complete':
      break;
  }
});

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.insertCSS(null, {
    file: 'dist/content_style.css'
  });
  chrome.tabs.executeScript(null, {
    file: 'dist/content_script.js'
  });
});