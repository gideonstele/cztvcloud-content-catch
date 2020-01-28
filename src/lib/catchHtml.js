import $ from 'jquery';
import { flattenDeep } from 'lodash';

// 元素是块(block)还是行(inline)或不可见(false)
const inlineOrBlock = ($n) => {
  const d = $n.css('display');
  if (d === 'none' || $n.is(':hidden')) {
    return false;
  }
  if (/^inline/.test(d)) {
    return 'inline';
  } else {
    return 'block';
  }
};

// 判断当前元素是不是加粗的
const isBold = ($n) => $n.css('font-weight') > 400;

// 判断当前元素是不是图片
const isImg = ($n) => $n.is('img')

// 获取图片真实的地址（考虑懒加载和防爬）
const getImgSrc = (img) => {
  const $img = $(img);
  if (img.width < 220 && img.height < 220) {
    return '';
  }
  const src = img.src.startsWith('data:image/') || !img.src ? ($img.attr('data-src') || trimCSSURL($img.css('background-image'))) : img.src;
  return src;
};

const analysisChildNodeType = (n, site) => {
  const result = [];
  result.devideIndexs = [];
  result.needDivied = false;
  n.childNodes.forEach((node, index) => {
    if (node.nodeType === 3) {
      result.push({
        index: result.length,
        type: 'text',
        text: node.textContent.trim(),
      });
    } else if (node.nodeType === 1) {
      const $node = $(node);
      const display = inlineOrBlock($node);
      if (/^(br|hr|svg|canvas|table|audio|video|button|select|script|textarea|input|iframe)$/ig.test(node.tagName)) {
        console.log('[cztvcloud - catch] Element Ignored: ', node);
      } else if (site.ignores && $node.is(site.ignores)) {
        console.log('[cztvcloud - catch] Element Ignored By Setting: ', node);
      } else if (node.tagName.match(/^h(1-6)$/)) {
        result.push({
          index: result.length,
          type: 'title',
          level: node.tagName,
          text: node.textContent.trim().replace(/[\r\n]/g, ' '),
        });
      } else if (isImg($node)) {
        result.needDivied = true;
        result.devideIndexs.push(result.length);
        result.push({
          index: result.length,
          type: 'img',
          src: getImgSrc(node),
        });
        return ;
      } else if (site.imgdesc && $node.is(site.imgdesc)) {
        result.push({
          index: result.length,
          type: 'desc',
          text: node.textContent.trim(),
        });
      } else {
        if (display === 'inline') {
          result.push({
            index: result.length,
            type: 'inline',
            bold: isBold($node),
            text: node.textContent.trim(),
          });
        } else if (display === 'block') {
          result.needDivied = true;
          result.devideIndexs.push(result.length);
          result.push({
            index: result.length,
            type: 'block',
            el: node,
            children: analysisChildNodeType(node, site),
          });
        }
      }
    }
  });
  result.index = 0;
  result.type = 'block';
  result.needDivied = true;
  result.devideIndexs = 0;
  return result;
};

const wrapParagraph = (node, configs) => {
  const cfgOutput = configs.output;
  const cssH = {
    'line-height': cfgOutput.passage_lineheight,
  };
  const cssParagraph = {
    'font-size': cfgOutput.passage_fontsize,
    'line-height': cfgOutput.passage_lineheight,
    'text-align': cfgOutput.passage_textalign,
  };
  const cssDesc = {
    'font-size': cfgOutput.imgdesc_fontsize,
    'line-height': cfgOutput.imgdesc_lineheight,
    'text-align': cfgOutput.imgdesc_textalign,
  };
  const cssImg = {
    'text-align': cfgOutput.img_textalign,
  };
  function wrapContent (node, keepBold) {
    if (node.children) {
      return children.map((child) => {
        if (child.type === 'inline') {
          const tagName = child.isBold && keepBold ? 'strong' : 'span';
          return `<${tagName}>${child.text}</${tagName}>`;
        } else {
          return child.text;
        }
      }).join('');
    } else if (node.text) {
      return node.text;
    } else {
      return '';
    }
  }
  if (node.type === 'title' && cfgOutput.hlevel) {
    return $(`<${node.level}>${node.text}</${node.level}>`).css(cssH)[0];
  } else if (node.type === 'desc'){
    const content = wrapContent(node, cfgOutput.imgdesc_bold);
    return $(`<p>${content}</p>`).css(cssDesc)[0];
  } else if (node.type === 'img') {
    return $(`<p><img src="${node.src}" /></p>`).css(cssImg)[0];
  } else if (node.text) {
    return $(`<p>${node.text}</p>`).css(cssParagraph)[0];
  }
  const content = wrapContent(node, cfgOutput.passage_bold);
  return $(`<p>${content}</p>`).css(cssParagraph)[0];
};

function parseTree(nodes, configs, collections = [], depth = 0) {
  nodes.forEach((node, index) => {
    if ((node.type === 'block' && node.children.needDivied) || node.type === 'img' || node.type === 'title') {
      if (node.children) {
        collections.push(parseTree(node.children, configs, [], depth + 1));
      } else {
        collections.push(wrapParagraph(node, configs));
      }
    } else {
      console.log('parse node', node, wrapParagraph(node, configs));
      collections.push(wrapParagraph(node, configs));
    }
  });
  return collections;
}


// type = img | desc | title | inline
export const catchHtml = (selector) => {
  const configs = window.configs;
  const $entry = document.querySelector(selector);
  if (!$entry) {
    return {
      error: true,
      message: '没有找到设定的入口',
    }
  }
  const analysisTree = analysisChildNodeType($entry, configs.site);
  const parsed = flattenDeep(parseTree(analysisTree, configs, []));
  console.log(parsed);
  const html = parsed.filter(node => !!(node && node.innerHTML)).map(node => {
    return node.outerHTML ? node.outerHTML : node.contentText;
  }).join('');
  return {
    html,
  };
}