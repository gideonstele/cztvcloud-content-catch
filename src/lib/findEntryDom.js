const url = location.href;
const findEntryDom = () => {
  let $content;
  if (/mp\.weixin\.qq\.com\/s/.test(url)) {
    $content = document.getElementById('js_content');
  } else if (/\.xuexi\.cn/.test(url)) {
    $content = document.querySelector('.render-detail-content');
  }
  $content && $content.setAttribute('data-catched', '___cztvcloud_catched');
  return !!$content ? '[data-catched=___cztvcloud_catched]' : '';
};

export default findEntryDom;