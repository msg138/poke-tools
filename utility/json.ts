const maxLevel = 20;
export const removeAllKeys = (obj: object, key: string, level = 0) => {
  if (!obj) {
    return;
  }
  Object.keys(obj).forEach((checkKey) => {
    if (checkKey === key) {
      delete obj[key];
      return;
    }
    if (typeof obj[checkKey] === 'object' && level < maxLevel) {
      removeAllKeys(obj[checkKey], key, level + 1);
    }
  });
};
