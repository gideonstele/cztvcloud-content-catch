import $ from 'jquery';
import trimCSSURL from '../utils/trimcssurl';
import { flattenDeep } from 'lodash';

// todo default value
// * filter width and height smaller than 220px
const MAX_PIC_VALUE = 220;
const MAX_PIC_SINGLE_AD_VALUE = 60;
// * 400以上为加粗
const BOLD_WEIGHT = 400;

// todo 基于当前数量来判断是否为小标题
const MIN_SUBTITLE_COUNT = 1;
// todo 基于当前数量来判断是否为图说
const MIN_IMAGE_DESC_COUNT = 2;
// todo 小标题最大识别数
const MAX_SUBTITLE_LENGTH = 22;
// todo 图说最大识别数
const MAX_IMAGE_DESC_LENGTH = 30;

const lineFeedTags = ["IMG", "P", "SECTION", "BLOCKQUOTE",
                      "H1", "H2", "H3", "H4", "H5", "H6"];
const ignoreTags = ["BR", "HR", "SVG", "CANVAS", "AUDIO", "VIDEO", 
                    "BUTTON", "SELECT", "SCRIPT" ,"TEXTAREA", "INPUT", "IFRAME"];
const punctuations = [".", "。", "?", "？", "!", "！", ",", "，", "、", "；", "：", "…", "—", "～", "﹏", "￥"];
const needMerge = [",", "，"];
const compareCss = ["fontFamily", "fontSize", "color"];

// todo type enum
const NodeType = {
  IMAGE: "IMG",
  TEXT: "TEXT"
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

const isBoldDOM = (el) => el.tagName === "STRONG" || 
                          $(el).css('font-weight') > BOLD_WEIGHT ||
                          (el.parentNode && el.parentNode.tagName === "STRONG") ||
                          (el.parentNode && $(el.parentNode).css('font-weight') > BOLD_WEIGHT)

// 判断当前元素是不是图片
const isImg = ($n) => $n.is('img')

// 获取图片真实的地址（考虑懒加载和防爬）
const getImgSrc = (img) => {
  const $img = $(img);
  // todo width !== height 文中必要防止二维码
  if (img.width < MAX_PIC_SINGLE_AD_VALUE || img.height < MAX_PIC_SINGLE_AD_VALUE ||
    img.width !== img.height && img.width < MAX_PIC_VALUE && img.height < MAX_PIC_VALUE) {
    return '';
  }
  const src = img.src.startsWith('data:image/') || !img.src ? ($img.attr('data-src') || trimCSSURL($img.css('background-image'))) : img.src;
  return src;
};

// ! 第一步，先往下找最底层，取节点
// * 节点中包括文本及图片
const analysisChildNode = (node, total = []) => {
  if(ignoreTags.includes(node.tagName)){
    // todo ignore tag
  }
  else if(node.childNodes.length) {
    node.childNodes.forEach(n => total.concat(analysisChildNode(n, total)));
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
  if(!nodes && nodes.length === 0) {
    return nodes;
  }
  return filterImgOrText(nodes);
}

// ! 第三步，生成结构
// * 不同样式等因素造成内容存于不同节点，将其修复
const getParagraphNode = (node) => {
  if(!lineFeedTags.includes(node.tagName)) {
    node = node.parentNode ? getParagraphNode(node.parentNode) : null;
  }
  return node;
}
// * "IMG" 或者 "TEXT"
const getContentType = (articleNodes) => {
  return articleNodes.every(node => node.tagName === "IMG") ? NodeType.IMAGE : NodeType.TEXT;
}

// * 
const parseContent = (articleNodes, type) => {
  if(type === NodeType.IMAGE) {
    return articleNodes.reduce((content, node) => {
      content = getImgSrc(node);
      return content;
    }, "");
  } else {
    return articleNodes.reduce((content, node) => {
      content += node.textContent.trim();
      return content
    }, "");
  }
}

/* 生成基础节点池, 支持扩展
interface ArticleNode {
  index: number, 
  type: string, 
  isImageDesc: boolean, 
  isSubTitle: boolean, 
  lastNode: ArticleNode | null,
  nextNode: ArticleNode | null,
  paragraphNode: element, 
  nodes: Array<element>,
  content: string
}
*/
const createBaseNodes = (nodes) => {
  if(!nodes && nodes.length === 0) {
    return nodes;
  }
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

  const nodeArray = paragraphContents.reduce((result, paragraph, i) => {
    const type = getContentType(paragraph);
    const content = parseContent(paragraph, type);
    const isMerge = 
      content && type === NodeType.TEXT &&
      needMerge.includes(content[content.length - 1]);
    if(content) {
      result = [...result, {
        index: i,
        type: type,
        isMerge: isMerge,
        isImageDesc: false,
        isSubTitle: false,
        lastNode: null,
        nextNode: null,
        paragraphNode: paragraphPool[i],
        nodes: paragraph,
        content: content,
      }]
    }
    return result;
  }, []);


  return nodeArray;
}
const addAssociate = (baseNodes) => {
  return baseNodes.reduce((tree, node, index, obj) => {
    index > 0 && (node.lastNode = obj[index - 1]);
    index < obj.length && (node.nextNode = obj[index + 1]);
    return tree;
  }, baseNodes)
};

const isSameCss = (el1, el2) => {
  return compareCss.every(css => $(el1).css(css) === $(el2).css(css))
}

const analyseNodeTree = (nodes) => {
  const maySubTitleOrImageDesc = nodes.reduce((total, node) => {
    if(node.type === NodeType.TEXT &&
      node.nodes.length === 1 &&
      node.content.length < Math.max(MAX_SUBTITLE_LENGTH, MAX_IMAGE_DESC_LENGTH) &&
      !punctuations.includes(node.content[node.content.length - 1])) {
        total.push(node);
      }
    return total;
  }, []);

  maySubTitleOrImageDesc.forEach(node => {
    const nodeEl = node.nodes[0].parentNode;
    const sameNode = maySubTitleOrImageDesc.filter(item => isSameCss(item.nodes[0].parentNode, nodeEl));
    if(!isBoldDOM(nodeEl) &&
      sameNode.length >= MIN_IMAGE_DESC_COUNT &&
      sameNode.every(item => item.lastNode && item.lastNode.type === NodeType.IMAGE)) {
        node.isImageDesc = true;
    }
    if(!node.isImageDesc && sameNode.length >= MIN_SUBTITLE_COUNT &&
      sameNode.every(item => item.content.length <= MAX_SUBTITLE_LENGTH)) {
        node.isSubTitle = true;
      } 
  });

  return nodes;
}
const parseParagraphNodeTree = (nodes) => {
  // todo 生成树
  const baseNodes = createBaseNodes(nodes);
  // todo 生成树，强化节点关联
  const hasAssociateTree = addAssociate(baseNodes);
  // todo 分析小标题和图片描述并赋值
  const analysedNodeTree = analyseNodeTree(hasAssociateTree);

  return analysedNodeTree;
}

const getDOMText = (paragraphNode) => {
  if(paragraphNode.isMerge && paragraphNode.nextNode && paragraphNode.nextNode.type === NodeType.TEXT) {
    return paragraphNode.content += getDOMText(paragraphNode.nextNode);
  } else {
    return paragraphNode.content;
  }
}

// ! 第四步，生成DOM
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
  const cssDesc = {
    'font-size': cfgOutput.imgdesc_fontsize,
    'line-height': cfgOutput.imgdesc_lineheight,
    'text-align': paragraphNode.content.length > MAX_SUBTITLE_LENGTH ? 'justify' : 'center',
  };
  const cssImg = {
    'text-align': cfgOutput.img_textalign,
  };

  switch(paragraphNode.type) {
    case NodeType.IMAGE: {
      const p = document.createElement("p");
      $(p).css(cssImg);

      const img = document.createElement("img");
      img.src = paragraphNode.content;
      p.appendChild(img);
      return p;
    }
    case NodeType.TEXT: {
      if(paragraphNode.lastNode && paragraphNode.lastNode.isMerge) {
        return '';
      }
      const p = document.createElement("p");
      $(p).css(cssParagraph);
      if(paragraphNode.isImageDesc) {
        $(p).css(cssDesc);
      } else if (paragraphNode.isSubTitle) {
        $(p).css(cssCenter);
      }

      p.innerText = getDOMText(paragraphNode);
      return p;
    }
    default: {
      return "";
    }
  }
}

const parseDOM = (paragraphNodeTree, configs) => {
  return paragraphNodeTree.reduce((dom, paragraphNode) => {
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
  const childNodes = analysisChildNode($entry);
  const articleNodes = filterNodes(childNodes);
  // todo 通过此tree来智能分析
  const paragraphNodeTree = parseParagraphNodeTree(articleNodes);
  const parsed = parseDOM(paragraphNodeTree, configs);

  // const analysisTree = analysisChildNodeType($entry, configs.site);
  // const parsed = flattenDeep(parseTree(analysisTree, configs, []));

  const html = parsed.filter(node => !!(node && node.innerHTML)).map(node => {
    return node.outerHTML ? node.outerHTML : node.contentText;
  }).join('');
  return {
    html,
  };
}