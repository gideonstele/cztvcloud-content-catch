console.log('reflow ready')
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const app = document.getElementById('app');
  if (message.error) {
    app.innerHTML = 'error';
  } else {
    app.innerHTML = message.html;
  }
});