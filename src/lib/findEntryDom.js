import $ from 'jquery';

export const findEntryDom = () => {
  const site = window.configs.site;
  const $entry = $(site.entry)[0];
  $entry && $entry.setAttribute('data-catched', '___cztvcloud_catched');
  return !!$entry ? '[data-catched=___cztvcloud_catched]' : '';
};

export default findEntryDom;