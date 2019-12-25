(function (window) {
  let isReady = false;
  function setReady() {
    if (!isReady) {
      isReady = true;
      chrome.runtime.sendMessage({
        action: 'ready',
        data: '#image-text-content',
      });
    }
  }
  if (document.readyState !== 'complete ') {
    document.onreadystatechange = function (e) {
      if (document.readyState === 'complete') {
        setReady();
      }
    };
  } else {
    setReady();
  }

  const utils = {
    trimCSSURL(string) {
      const matches = /url\((\"|\')(.*)(\"|\')\)/i.exec(string);
      if (matches && matches[2]) {
        return matches[2];
      }
      return string;
    },
    createTextPara() {
      const p = document.createElement('p');
      p.style.lineHeight = '1.75em';
      p.style.textAlign = 'left';
      return p;
    },
    createImgPara() {
      const p = document.createElement('p');
      p.style.lineHeight = '1.75em';
      p.style.textAlign = 'center';
      return p;
    },
    createImgDescPara() {
      const p = document.createElement('p');
      p.style.lineHeight = '1.75em';
      p.style.textAlign = 'center';
      p.style.fontSize = '14px';
      return p;
    },
  };

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'catch') {
      if (!isReady) {
        sendResponse({
          success: false,
          message: '页面还没有加载完成，请稍后再试'
        });
        return ;
      }
      catchHtml(message.selector);
    }
  });

  function catchHtml(selector) {
    if (/xuexi\.cn/.test(location.hostname)) {
      catchHtmlXx(selector);
    } else {
      chrome.runtime.sendMessage({
        action: 'complete',
        success: false,
        message: '当前页面不支持抓取',
      });
    }
  }

  function catchHtmlXx(selector) {
    let articleRoot = document.querySelector('#image-text-content') || document.querySelector('.render-detail-content') || document.querySelector(selector);
    if (!articleRoot) {
      chrome.runtime.sendMessage({
        action: 'complete',
        success: false,
        message: '没有找到页面指定入口元素',
      });
      return;
    }
    const seeds = [];
    walkElements(articleRoot, seeds);
    const formatted = produceSeeds(seeds);
    chrome.runtime.sendMessage({
      action: 'complete',
      success: true,
      html: formatted,
    });
  }

  function walkElements(root, seeds = [], context) {
    if (!context) {
      context = utils.createTextPara();
      seeds.push(context);
    }
    root.childNodes.forEach((node, i) => {
      // 处理元素节点
      if (node.nodeType === 1) {
        // 如果是div / p 则递归遍历自己
        if (/div|p|ul|ol/i.test(node.tagName) && node.childNodes.length) {
          let contextNode;
          if (/img-desc|article-img-desc/i.test(node.className)) {
            contextNode = utils.createImgDescPara();
          } else if (/img-para|article-img-desc/i.test(node.className)) {
            contextNode = utils.createImgPara();
          } else {
            contextNode = utils.createTextPara();
          }
          seeds.push(contextNode);
          walkElements(node, seeds, contextNode);
        } else if (/span|strong|b/i.test(node.tagName) && node.childNodes.length) {
          let contextNode;
          if (node.style.fontWeight > 400 || /b|strong/i.test(node.tagName)) {
            contextNode = document.createElement('strong');
            context.append(contextNode);
          } else {
            contextNode = context || utils.createTextPara();
          }
          walkElements(node, seeds, contextNode);
        } else if (/img/i.test(node.tagName)) {
          const src = node.src.startsWith('data:image/') || !node.src ? (node.getAttribute('data-src') || utils.trimCSSURL(node.style.backgroundImage)) : node.src;
          const p = document.createElement('p');
          p.style.textAlign = 'center';
          p.style.lineHeight = '1.75em';
          p.innerHTML = `<img src="${src}" />`;
          seeds.push(p);
        } else {
          console.log('[cztvcloud - catch] Element Ignored: ', node);
        }
      } else if (node.nodeType === 3) {
        // 如果是文本节点
        const text = node.textContent.trim();
        if (text) {
          context.appendChild(document.createTextNode(text));
        }
      }
    });
  }

  function produceSeeds(seeds) {
    const ps = seeds.filter(s => s.hasChildNodes());
    const root = document.createElement('div');
    ps.forEach(p => {
      root.appendChild(p);
    });
    return root.innerHTML;
  }
})();