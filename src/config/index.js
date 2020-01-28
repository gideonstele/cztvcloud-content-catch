// 这里返回插件的默认设置，在插件被首次安装的时候，他会被写入。
// 但如果插件已经存在相关配置了，它不会覆盖
export const getDefaultConfig = () => ({
  'isInstall': true,
  // 通用设置
  'common': {
    'imgtype': ['jpg', 'png', 'webp'],
  },
  // 输出设置
  'output': {
    'hlevel': false, // 保留标题等级
    'passage_textalign': 'justify', // 正文对齐方式
    'passage_bold': false,  // 加粗对齐方式
    'passage_fontsize': '16px', // 字号
    'passage_lineheight': '1.75', // 行高
    'imgdesc_textalign': 'center', // 图片描述对齐方式
    'imgdesc_bold': false, // 图片描述加粗方式
    'imgdesc_fontsize': '14px', // 图片描述字号
    'imgdesc_lineheight': '1.75', // 图片描述行高
    'img_textalign': 'center', // 图片对齐
  },
  'sites': {
    'XueXi': {
      name: 'XueXi',
      regexp: 'xuexi\\.cn',
      entry: '.render-detail-content',
      ignores: '.video-article-content',
      imgdesc: '.article-img-desc',
    },
    'weixinmp': {
      name: 'weixinmp',
      regexp: 'mp\\.weixin\\.qq\\.com\\/s',
      entry: '#js_content',
      ignores: '#js_mpvedio',
      imgdesc: '[style~="color: rgb(176, 176, 176)"]',
    },
    'hangplus':{
      name: 'hangplus',
      regexp: 'cst123\\.cn',
      entry: '.news-content',
      ignores: '',
      imgdesc: '',
    },
    'wapcztv': {
      name: 'wapcztv',
      regexp: 'wap\\.cztv\\.com',
      entry: '#conten_main',
      ignores: '',
      imgdesc: '[label=图片脚注]',
    },
    'zjol': {
      name: 'zjol',
      regexp: 'zjol\\.com\\.cn',
      entry: '.news_content',
      ignores: '.video_box',
      imgdesc: '.imagenote',
    },
    'zhangshangyuhang': {
      name: 'zhangshangyuhang',
      regexp: 'cmsuiv3\\.aheading\\.com',
      entry: '.article-con',
      ignores: '.video_box',
      imgdesc: '.imagenote',
    },
    'eyhclass': {
      name: 'eyhclass',
      regexp: 'eyh\\.cn\\/class',
      entry: '.t2 + div',
      ignores: '.video_box',
      imgdesc: '.imagenote',
    },
    'yhcb': {
      name: 'yhcb',
      regexp: 'yhcb\\.eyh\\.cn\\/html',
      entry: '#ozoom',
      ignores: '.video_box',
      imgdesc: '.imagenote',
    },
    'mdailyhangzhou': {
      name: 'mdailyhangzhou',
      regexp: 'mdaily\\.hangzhou\\.com\\.cn',
      entry: '.content',
      ignores: '.video_box',
      imgdesc: '.imagenote',
    },
  },
});