import { isEmpty } from 'lodash';
import { nsstorage } from '_utils/localstore';

export const common = nsstorage('common');
export const output = nsstorage('output');
export const sites = nsstorage('sites');

export const matchedSite = async (url) => {
  const u = new URL(url);
  const simpleUrl = `${u.host}${u.pathname}`;
  const s = Object.values(await sites.get());

  const matchedConfig = {
    names: [],
    regexps: [],
    entry: '',
    ignores: [],
    imgdesc: [],
  };
  s.forEach(site => {
    if (isEmpty(site)) {
      return ;
    }
    const r = new RegExp(site.regexp, 'ig');
    const matches = simpleUrl.match(r);
    if (matches && matches.length) {
      matchedConfig.names.push(site.name);
      matchedConfig.regexps.push(site.regexp);
      matchedConfig.entry = matchedConfig.entry || site.entry;
      site.ignores && matchedConfig.ignores.push(site.ignores);
      site.imgdesc && matchedConfig.imgdesc.push(site.imgdesc);
    }
  });
  matchedConfig.ignores = matchedConfig.ignores.length ? matchedConfig.ignores.join(',') : '';
  matchedConfig.imgdesc = matchedConfig.imgdesc.length ? matchedConfig.imgdesc.join(',') : '';
  return matchedConfig;
}