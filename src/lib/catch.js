// 处理空白的p标签
const produceSeeds = (seeds) => {
  const ps = seeds.filter(s => s.hasChildNodes());
  const root = document.createElement('div');
  ps.forEach(p => {
    root.appendChild(p);
  });
  return root.innerHTML;
}

  /**
   * @function walkElements
   * @description 核心方法，递归遍历所有元素
   * @returns {Array<Node>} 可能存在空的p标签，需要进一步过滤
  */
const walkElements = (root, seeds = [], context) => {
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

  /**
   * @function catchHtml
   * @description 抓取页面
   * @param {String} selector 抓取入口
  */
export const catchHtml = (selector) => {
  let articleRoot = document.querySelector(selector);
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



export default catchHtml;