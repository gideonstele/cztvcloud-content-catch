export const trimCSSURL = (string) => {
  const matches = /url\((\"|\')(.*)(\"|\')\)/i.exec(string);
  if (matches && matches[2]) {
    return matches[2];
  }
  return string;
}

export default trimCSSURL;