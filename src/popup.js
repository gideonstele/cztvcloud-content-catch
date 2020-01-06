chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const app = document.getElementById('app');
  console.log(message);
  app.innerHTML = message;
});