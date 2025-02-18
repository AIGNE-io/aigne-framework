export const tryParse = (s?: unknown) => {
  if (typeof s !== "string") return undefined;

  try {
    return JSON.parse(s);
  } catch {
    // ignore
  }
  return undefined;
};
