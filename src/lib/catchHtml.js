import $ from 'jquery';
import { flattenDeep } from 'lodash';

// todo default value
// * 220以下识别为广告
const MAX_PIC_VALUE = 220;
// * 400以上为加粗
const BOLD_WEIGHT = 400;

const lineFeedTags = ["P", "SECTION", "BLOCKQUOTE",
                      "H1", "H2", "H3", "H4", "H5", "H6"];
const ignoreTags = ["BR", "HR", "SVG", "CANVAS", "TABLE", "AUDIO", "VIDEO", 
                    "BUTTON", "SELECT", "SCRIPT" ,"TEXTAREA", "INPUT", "IFRAME"]

class ParagraphNode {
  constructor(type, content = "") {
    this.type = type;
    this.content = content;
  }
}

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
const isBold = ($n) => $n.css('font-weight') > BOLD_WEIGHT;

// 判断当前元素是不是图片
const isImg = ($n) => $n.is('img')

// 获取图片真实的地址（考虑懒加载和防爬）
const getImgSrc = (img) => {
  const $img = $(img);
  if (img.width < MAX_PIC_VALUE && img.height < MAX_PIC_VALUE) {
    return '';
  }
  const src = img.src.startsWith('data:image/') || !img.src ? ($img.attr('data-src') || trimCSSURL($img.css('background-image'))) : img.src;
  return src;
};

// * 第一步，先往下找最底层，取节点
// * 节点中包括文本及图片
const analysisWechatNode = (node, total = []) => {
  if(ignoreTags.includes(node.tagName)){
    // todo ignore tag
  }
  else if(node.childNodes.length) {
    node.childNodes.forEach(n => total.concat(analysisWechatNode(n, total)));
  } else {
    total.push(node);
  }
  
  return total;
};

// * 第二步，过滤节点
// * 只保留文本或图片节点
const filterNodes = (nodes) => {
  return nodes.filter(node => (node.tagName === "IMG" || node.textContent.trim()));
}

// * 第三步，自定义过滤
// * 过滤某些特定的内容，如小于200的图片，gif等
// todo 


// * 第四步，生成结构
// * 不同样式等因素造成内容存于不同节点，将其修复
// todo 微信公众号用于分段的标签为<p>, <section>, <blockquote>
const getParagraphNode = (node) => {
  let result = node;
  if(!lineFeedTags.includes(node.tagName) && node.parentNode) {
    result = getParagraphNode(node.parentNode)
  }
  return result;
}

const createParagraphContent = (nodes) => {
  // 存放所有的段落
  const paragraphPool = [];
  // 存放段落对应的内容
  const paragraphContents = [];
  nodes.forEach(node => {
    // 获取此节点的分段节点
    const paragraphNode = getParagraphNode(node);
    const paragraphIndex = paragraphPool.indexOf(paragraphNode);
    let paragraphContent = paragraphContents[paragraphIndex];
    if(paragraphIndex === -1) {
      paragraphContent = [];
      paragraphContents.push(paragraphContent)
      paragraphPool.push(paragraphNode)
    }
    paragraphContent.push(node);
  })
  return paragraphContents;
}

// * 第五步，生成DOM
const getDOMByType = (paragraphNode) => {
  let dom = "";
  switch(paragraphNode.type) {
    case "img": {
      const p = document.createElement("p");
      const img = document.createElement("img");
      img.src = paragraphNode.content;
      p.appendChild(img);
      dom = p;
      break;
    }
    case "text": {
      const p = document.createElement("p");
      p.innerText = paragraphNode.content;
      dom = p;
      break;
    }
    default: {

    }
  }
  return dom;
}

const parseDOM = (paragraphContents) => {
  return paragraphContents.reduce((dom, paragraph) => {
    // * 获取类型及内容
    const paragraphNode = paragraph.reduce((content, node) => {
      if(node.tagName === "IMG") {
        const imgStr = getImgSrc(node);
        if(imgStr) {
          content.type = "img"
          content.content = imgStr;
        }
      } else {
        content.type = "text";
        content.content += node.textContent.trim();
      }

      return content;
    }, new ParagraphNode());

    // * 根据类型内容生成DOM
    const nodeDOM = getDOMByType(paragraphNode);
    if(nodeDOM) {
      dom.push(nodeDOM);
    }
    return dom;
  }, [])
}

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
  const wechatNodes = analysisWechatNode($entry);
  const articleNodes = filterNodes(wechatNodes);
  const paragraphContent = createParagraphContent(articleNodes);
  const parsed = parseDOM(paragraphContent);

  // const analysisTree = analysisChildNodeType($entry, configs.site);
  // const parsed = flattenDeep(parseTree(analysisTree, configs, []));


  console.log(parsed);
  const html = parsed.filter(node => !!(node && node.innerHTML)).map(node => {
    return node.outerHTML ? node.outerHTML : node.contentText;
  }).join('');
  return {
    html,
  };
}