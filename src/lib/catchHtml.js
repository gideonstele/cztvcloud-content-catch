import $ from 'jquery';
import { flattenDeep } from 'lodash';

// todo default value
// * 220以下识别为广告
const MAX_PIC_VALUE = 220;
// * 400以上为加粗
const BOLD_WEIGHT = 400;

const lineFeedTags = ["IMG", "P", "SECTION", "BLOCKQUOTE",
                      "H1", "H2", "H3", "H4", "H5", "H6"];
const ignoreTags = ["BR", "HR", "SVG", "CANVAS", "AUDIO", "VIDEO", 
                    "BUTTON", "SELECT", "SCRIPT" ,"TEXTAREA", "INPUT", "IFRAME"];
const punctuations = ["。", "？", "！", "，", "、", "；", "：","（", "）", 
                      "〔", "〕", "…", "—", "～", "﹏", "￥"];

const MAX_TITLE_LENGTH = 18;

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

// ! 第一步，先往下找最底层，取节点
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

// ! 第二步，过滤节点
// * 只保留文本或图片节点
const filterImgOrText = (nodes) => {
  return nodes.filter(node => (
    node.tagName === "IMG" || // todo 取图片
    (node.textContent.trim() && node.nodeType !== 8) // todo 取非注释文本, 8为注释节点
    ));
}

const filterNodes = (nodes) => {
  let result = nodes;
  result = filterImgOrText(result);
  return result;
}

// ! 第三步，生成结构
// * 不同样式等因素造成内容存于不同节点，将其修复
const getParagraphNode = (node) => {
  // todo 微信公众号用于分段的标签为<p>, <section>, <blockquote>
  if(!lineFeedTags.includes(node.tagName)) {
    node = node.parentNode ? getParagraphNode(node.parentNode) : null;
  }
  return node;
}

const createParagraphContent = (nodes) => {
  // 存放所有的段落
  const paragraphPool = [];
  // 存放段落对应的内容
  const paragraphContents = [];
  nodes.forEach(node => {
    // 获取此节点的分段节点
    const paragraphNode = getParagraphNode(node);
    if(!paragraphNode) {
      paragraphPool.push(null);
      paragraphContents.push([node]);
      return;
    }

    const paragraphIndex = paragraphPool.indexOf(paragraphNode);
    if(paragraphIndex === -1) {
      paragraphPool.push(paragraphNode);
      paragraphContents.push([node]);
    } else {
      const paragraphContent = paragraphContents[paragraphIndex];
      paragraphContent.push(node);
    }
  })
  return paragraphContents;
}

// ! 第四步，生成DOM
const isSubHead = (text) => {
  if(text && !punctuations.includes(text[text.length - 1]) && text.length < MAX_TITLE_LENGTH){
    return true;
  } else{
    return false
  }
}

const getDOMByType = (paragraphNode, configs) => {
  const cfgOutput = configs.output;
  const cssParagraph = {
    'font-size': cfgOutput.passage_fontsize,
    'line-height': cfgOutput.passage_lineheight,
    'text-align': cfgOutput.passage_textalign,
  };
  const cssCenter = {
    'text-align': 'center',
  };
  const cssImg = {
    'text-align': cfgOutput.img_textalign,
  };

  switch(paragraphNode.type) {
    case "img": {
      const p = document.createElement("p");
      $(p).css(cssImg);

      const img = document.createElement("img");
      img.src = paragraphNode.content;
      p.appendChild(img);
      return p;
    }
    case "text": {
      const p = document.createElement("p");
      $(p).css(cssParagraph);
      // todo 小标题居中
      // ! 此为特殊要求
      if(isSubHead(paragraphNode.content)) $(p).css(cssCenter);

      p.innerText = paragraphNode.content;
      return p;
    }
    default: {
      return "";
    }
  }
}

const parseDOM = (paragraphContents, configs) => {
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
    const nodeDOM = getDOMByType(paragraphNode, configs);
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
  const parsed = parseDOM(paragraphContent, configs);

  // const analysisTree = analysisChildNodeType($entry, configs.site);
  // const parsed = flattenDeep(parseTree(analysisTree, configs, []));

  const html = parsed.filter(node => !!(node && node.innerHTML)).map(node => {
    return node.outerHTML ? node.outerHTML : node.contentText;
  }).join('');
  return {
    html,
  };
}