import $ from 'jquery';
import { flattenDeep } from 'lodash';

const hasPlainTextChildNode = (n) => {
  let has = false;
  n.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      has = true;
    }
  });
  return has;
};

const getImgSrc = (img, configs) => {
  const $img = $(img);
  if (img.width < 220 && img.height < 220) {
    return '';
  }
  const src = img.src.startsWith('data:image/') || !img.src ? ($img.attr('data-src') || trimCSSURL($img.css('background-image'))) : img.src;
  return src;
};

function parsePara(p, configs) {
  const results = [];
  p.childNodes.forEach(node => {
    if (node.nodeType === 3) { // 如果是文本节点，直接存入
      results.push(node.textContent.trim());
    } else if (node.nodeType === 1) {
      const $node = $(node);
      if (node.TagName === 'img') {
        const src = getImgSrc(node, configs);
        src && results.push({ type: 'img', src });
      } else if ($node.is('span,b,strong') && $node.css('font-weight') > 400) {
        results.push({
          type: 'inline',
          tag: 'strong',
          text: node.textContent,
        });
      } else {
        results.push(node.textContent.trim());
      }
    }
  });
  return results;
}

function walk($root, configs, collections = []) {
  const site = configs.site;
  $root.childNodes.forEach(node => {
    if (node.nodeType === 3) { // 如果是文本节点，直接存入
      const text = node.textContent.trim();
      if (collections.length) {
        const current = collections[collections.length - 1];
        if (typeof current === 'object') {
          current.text = (current.text || '') + text;
        } else if (typeof current === 'string') {
          current.text = current.text + text;
        } else {
          collections.push(text);
        }
      } else {
        collections.push(text);
      }
    } else if (node.nodeType === 1) { // 如果是元素节点
      const $node = $(node);
      if ($node.is(site.ignores)) {
        console.log('[cztvcloud - catch] Element Ignored By Option: ', node);
        return;
      }
      if (/^(div|section|article|header|aside|p|ul|ol)$/ig.test(node.tagName) && node.childNodes.length) {
        if ($node.is(site.imgdesc)) {
          collections.push({
            type: 'desc',
            text: node.textContent,
          });
        } else if (hasPlainTextChildNode(node)) { // 如果节点存在直接的文本节点，进行子遍历
          collections.push(walk(node, configs, []));
        } else {
          if ($node.is('p')) {
            collections.push(parsePara(node, configs));
          } else {
            walk(node, configs, collections);
          }
        }
      } else if (/^h[1-6]$/ig.test(node.tagName)) {
        collections.push({
          type: 'title',
          tag: node.tagName,
          text: node.textContent.trim(),
        });
      } else if (/^(span|strong|em|i|small|font)$/) {
        collections.push({
          type: 'inline',
          tag: $node.is('span,b,strong') && $node.css('font-weight') > 400 ? 'strong' : 'span',
          text: node.textContent,
        });
      } else if (/^img$/ig.test(node.tagName)) {
        collections.push({
          type: 'img',
          src: getImgSrc(node, configs),
        });
      } else {
        console.log('[cztvcloud - catch] Element Ignored: ', node);
      }
    }
  });
  return collections;
}

function genHtml(seeds, configs) {
  const flattenSeeds = flattenDeep(seeds);
  console.log(flattenSeeds);
  const $root = $('<div></div>');
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
  flattenSeeds.forEach(seed => {
    if (seed && typeof seed === 'string') {
      const p = $(`<p>${seed}</p>`).css(cssParagraph);
      $root.append(p);
    } else if (typeof seed === 'object' && seed.text || seed.src) {
      if (seed.type === 'title') {
        let p;
        if (cfgOutput.hlevel) {
          p = $(`<${seed.tag}>${seed.text}</${seed.tag}>`).css(cssH);
        } else {
          p = $(`<p>${seed.text}</p>`).css(cssParagraph);
        }
        $root.append(p);
      } else if (seed.type === 'inline') {
        let s;
        if (cfgOutput.passage_bold) {
          s = $(`<${seed.tag}>${seed.text}</${seed.tag}>`);
        } else {
          s = $(`<span>${seed.text}</span>`);
        }
        $root.children().last().append(s);
      } else if (seed.type === 'img') {
        const img = $('<p></p>').css(cssImg);
        img.append(`<img src='${seed.src}' />`);
        $root.append(img);
      } else if (seed.type === 'desc') {
        const desc = $(`<p>${seed.text}</p>`).css(cssDesc);
        $root.append(desc);
      }
    }
  });
  return $root.html();
}
// type = img | desc | title | inline
export const catchHtml = (selector) => {
  const configs = window.configs;
  const $entry = document.querySelector(selector);
  const seeds = [];
  walk($entry, configs, seeds);
  const html = genHtml(seeds, configs);
  return html;
}