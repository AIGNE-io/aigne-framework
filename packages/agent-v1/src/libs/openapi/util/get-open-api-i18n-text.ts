const getOpenApiTextFromI18n = (data: any, key: string, locale: string) => {
  const i18nKey: string = `x-${key}-${locale}`;
  return data[i18nKey] || data[key];
};

export default getOpenApiTextFromI18n;
