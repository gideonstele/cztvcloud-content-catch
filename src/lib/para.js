export const createTextPara = () => {
  const p = document.createElement('p');
  p.style.lineHeight = '1.75em';
  p.style.textAlign = 'left';
  return p;
};

export const createImgPara = () => {
  const p = document.createElement('p');
  p.style.lineHeight = '1.75em';
  p.style.textAlign = 'center';
  return p;
};

export const createImgDescPara = () => {
  const p = document.createElement('p');
  p.style.lineHeight = '1.75em';
  p.style.textAlign = 'center';
  p.style.fontSize = '14px';
  return p;
};