const formatNumber = (num: number, locale: string) => {
  if (typeof num !== "number" || Number.isNaN(num)) {
    return "0";
  }

  if (num >= 10000) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(num);
  }
  return new Intl.NumberFormat(locale).format(num);
};

export default formatNumber;
