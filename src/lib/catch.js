import shortid from 'shortid';
import _ from 'lodash';
import trimCSSURL from '../utils/trimcssurl';
import { createTextPara, createImgPara, createImgDescPara } from './para';

// 处理空白的p标签
const produceSeeds = (seeds) => {
  const ps = seeds.filter(s => s.hasChildNodes());
  const root = document.createElement('div');
  ps.forEach(p => {
    root.appendChild(p);
  });
  return root.innerHTML;
}

const tryParaType = (node) => {
  if (/img-desc|article-img-desc/i.test(node.className)) {
    return 'img';
  } else if (/img-para|article-img-desc/i.test(node.className)) {
    return 'desc';
  }
  return 'normal';
};

/**
 * @function traverseNodes
 * @description 核心方法，遍历目标node，广度优先
 * @param {HTMLElement} root 遍历入口
 * @param {(node: Node, level: Number) => any} cb 遍历回调 
 * @returns {Array<Node>} 
*/
const traverseNodes = (root, cb) => {
  const queue = [];
  let node = root;
  let level = 0;
  while (node) {
    const childNodes = node.childNodes;
    const l = childNodes ? childNodes.length : 0;
    if (node !== root && node.el !== root) {
      cb(node, level);
    }
    if (l !== 0) {
      for (let i = 0; i < l; i++) {
        const childNode = childNodes[i];
        if (childNode.nodeType === 1) {
          queue.push({
            id: shortid(),
            pid: level ? node.id : '0',
            level: level,
            tagName: childNode.tagName,
            nodeType: childNode.nodeType,
            type: 'el',
            childNodes: childNode.childNodes,
            el: childNode,
          });
        } else if (childNode.nodeType === 3) {
          queue.push({
            pid: level ? node.id : '0',
            level: level,
            nodeType: childNode.nodeType,
            type: 'text',
            textContent: childNode.textContent.trim(),
            node: childNode,
          });
        }
      }
      level++;
    }
    node = queue.shift();
  }
};

/**
 * @function walk
 * @description 核心方法，递归遍历所有元素
 * @returns {Array<Node>} 可能存在空的p标签，需要进一步过滤
*/
const walk = (root, seeds = [], paragraph) => {
  root.childNodes.forEach((node, i) => {
    if (node.nodeType === 1) {
      // 如果是div / p 则递归遍历自己
      if (/^(div|section|article|header|aside|p|ul|ol)$/ig.test(node.tagName) && node.childNodes.length) {
        let newp;
        if (/img-desc|article-img-desc/i.test(node.className)) {
          newp = createImgDescPara();
        } else {
          newp = createTextPara();
        }
        seeds.push(newp);
        walk(node, seeds, newp);
      } else if (/^(span|strong|b)$/i.test(node.tagName) && node.childNodes.length) {
        if (node.childElementCount !== node.childNodes.length) {
          walk(node, seeds, paragraph);
        } else {
          let contextNode = document.createTextNode(node.textContent);
          const computedStyle = window.getComputedStyle(node);
          if (computedStyle.fontWeight > 400) {
            contextNode = document.createElement('strong');
            contextNode.textContent = node.textContent;
          }
          paragraph.appendChild(contextNode);
        }
      } else if (/img/i.test(node.tagName)) {
        const src = node.src.startsWith('data:image/') || !node.src ? (node.getAttribute('data-src') || trimCSSURL(node.style.backgroundImage)) : node.src;
        const p = createImgPara();
        p.innerHTML = `<img src="${src}" />`;
        seeds.push(p);
      } else {
        console.log('[cztvcloud - catch] Element Ignored: ', node);
      }
    } else if (node.nodeType === 3) {
      // 如果是文本节点
      const text = node.textContent.trim();
      if (text) {
        paragraph.appendChild(document.createTextNode(text));
      }
    }
  });
};

/**
 * @function catchHtml
 * @description 抓取页面
 * @param {String|HTMLElement} selector 抓取入口
*/
export const catchHtml = async (selector) => {
  let articleRoot = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!articleRoot) {
    chrome.runtime.sendMessage({
      action: 'catch:failed',
      message: '没有找到页面指定入口元素',
    });
    return;
  }
  const seeds = [];
  walk(articleRoot, seeds);
  return produceSeeds(seeds);
}

/**
 root.childNodes.forEach((node, i) => {
    // 处理元素节点
    if (node.nodeType === 1) {
      // 如果是div / p 则递归遍历自己
      if (/div|section|article|p|ul|ol/i.test(node.tagName) && node.childNodes.length) {
        let contextNode;
        if (/img-desc|article-img-desc/i.test(node.className)) {
          contextNode = createImgDescPara();
        } else if (/img-para|article-img-desc/i.test(node.className)) {
          contextNode = createImgPara();
        } else {
          contextNode = createTextPara();
        }
        seeds.push(contextNode);
        walkElements(node, seeds, contextNode);
      } else if (/span|strong|b/i.test(node.tagName) && node.childNodes.length) {
        let contextNode;
        const computedStyle = window.getComputedStyle(node);
        if (computedStyle.fontWeight > 400 || /b|strong/i.test(node.tagName)) {
          contextNode = document.createElement('strong');
          contextNode.textContent = node.textContent;
          context.append(contextNode);
        }
        walkElements(node, seeds, context);
      } else if (/img/i.test(node.tagName)) {
        const src = node.src.startsWith('data:image/') || !node.src ? (node.getAttribute('data-src') || trimCSSURL(node.style.backgroundImage)) : node.src;
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
*/

export default catchHtml;