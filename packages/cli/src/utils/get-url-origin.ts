export const getUrlOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
};
