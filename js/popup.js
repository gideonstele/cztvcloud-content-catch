const $button_catch = document.getElementById('t_do_catch');
const $input_selector = document.getElementById('t_selector');
const $result = document.getElementById('result');

// 获取background对象，该对象即background的window，可以直接调用它的全局方法。
const bg = chrome.extension.getBackgroundPage();
// 单击
$button_catch.onclick = function () {
  bg.sendMessageToActiveContent({
    action: 'catch',
    selector: $result.value,
  });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'complete') {
    if (!request.success) {
      alert(request.message);
    } else {
      const html = request.html;
      // $result.innerHTML = html;
      // $result.contentEditable = true;
      const page = chrome.extension.getURL('reflowed.html');
      chrome.tabs.create({
        url: page,
        active: true,
      });
    }
    sendResponse(true);
  }
});