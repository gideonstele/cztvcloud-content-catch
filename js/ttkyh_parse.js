(function (window, undefined) {

  const BOXID = '___cztvcloud_catch';

  const pageReady = (function (window) {
    const readyCallbacks = [];
    var whenReady = function(fn) {
      readyCallbacks.push(fn);
    };
    const executeReady = function(fn) {
      window.setTimeout(function () {
        fn.call(document);
      });
    };
    const _ = {
      // Is the DOM ready to be used? Set to true once it occurs.
      isReady: false,
      // A counter to track how many items to wait for before
      // the ready event fires. See #6781
      readyWait: 1,
      ready(wait) {
        // Abort if there are pending holds or we're already ready
        if (wait === true ? --_.readyWait : _.isReady) {
          return undefined;
        }
        // Remember that the DOM is ready
        _.isReady = true;
        // If a normal DOM Ready event fired, decrement, and wait if need be
        if (wait !== true && --_.readyWait > 0) {
          return undefined;
        }
        whenReady = function (fn) {
          readyCallbacks.push(fn);
          while (readyCallbacks.length) {
            fn = readyCallbacks.shift();
            if (typeof fn === "function") {
              executeReady(fn);
            }
          }
        };
        whenReady();
      }
    };
    /**
     * The ready event handler and self cleanup method
     */
    function completed() {
      document.removeEventListener( "DOMContentLoaded", completed );
      window.removeEventListener( "load", completed );
      _.ready();
    }

    // Catch cases where $(document).ready() is called
    // after the browser event has already occurred.

    if (document.readyState !== "loading") {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      window.setTimeout(_.ready);
    } else {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", completed );
      // A fallback to window.onload, that will always work
	    window.addEventListener( "load", completed );
    }

    const ret = function (fn) {
      whenReady(fn);
    };

    ret.isReady = _.isReady;

    return ret;

  })(window);

  const panel = () => {
    return `
      <section class="${BOXID}-catch-panel">
        <header>
          <h3>抓取设置</h3>
          <a href="javascript:;" class="${BOXID}-close-handler"></a>
        </header>
        <section class="${BOXID}-catch-body">
          <section class="${BOXID}-form-body">
            <section class="${BOXID}-row">
              <label for="${BOXID}-t_selector">入口节点选择器</label>
              <section class="${BOXID}-content">
                <input type="text" id="t_selector" />
              </section>
            </section>
          </section>
          <section class="${BOXID}-form-body">
            <button type="button" id="${BOXID}-t_do_catch">抓页面</button>
          </section>
        </section>
      </section>
    `;
  }

  const utils = {
    // 将css属性中的 url("path/to/resource.ext")改为 path/to/resource.ext
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
  
  // 抓取页面
  function catchHtml(selector) {
    let articleRoot = document.querySelector('#js_content') || document.querySelector(selector);
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
  
  /**
   * @function walkElements
   * @description 核心方法，递归遍历所有元素
   * @returns {Array<Node>} 可能存在空的p标签，需要进一步过滤
  */
  function walkElements(root, seeds = [], context) {
    if (!context) {
      context = utils.createTextPara();
      seeds.push(context);
    }
    root.childNodes.forEach((node, i) => {
      // 处理元素节点
      if (node.nodeType === 1) {
        // 如果是div / p 则递归遍历自己
        if (/div|section|article|p|ul|ol/i.test(node.tagName) && node.childNodes.length) {
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

  const injectedPageUrl = chrome.extension.getURL('html/injected.html');
  
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'catch') {
      if (!isReady) {
        sendResponse({
          success: false,
          message: '页面还没有加载完成，请稍后再试'
        });
        return ;
      }
      sendResponse({
        success: true,
        message: '页面已经加载完成，正在抓取页面'
      });
      catchHtml(message.selector);
    }
  });

  function showFrame() {
    const wrap = document.createElement('div');
    wrap.id = BOXID;
    wrap.innerHTML = panel();
    document.body.append(wrap);
  };

  if (!document.getElementById(BOXID)) {
    showFrame();
  }

})(window);