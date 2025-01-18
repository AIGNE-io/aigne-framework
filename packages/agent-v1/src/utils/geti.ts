// @ts-ignore
import castPath from "lodash/_castPath";
// @ts-ignore
import toKey from "lodash/_toKey";
import toLower from "lodash/toLower";

export const geti = (object: any, path: any, defaultValue?: any) => {
  if (!object) return defaultValue === undefined ? null : defaultValue;

  const paths = castPath(path, object);
  const { length } = paths;
  let index = 0;

  let iterator = object;
  while (iterator !== undefined && index < length) {
    const key = toKey(paths[index]).toLowerCase();
    iterator = findLowercaseKey(iterator, key);
    index += 1;
  }
  return index && index === length && iterator !== undefined
    ? iterator
    : defaultValue;
};

const findLowercaseKey = (value: any, key: any) => {
  return Object.keys(value).reduce((a, k) => {
    if (a !== undefined) {
      return a;
    }
    if (toLower(k) === key) {
      return value[k];
    }
    return undefined;
  }, undefined);
};
