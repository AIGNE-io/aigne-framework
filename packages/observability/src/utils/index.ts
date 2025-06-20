const origin =
  window.blocklet?.prefix ??
  (process.env.NODE_ENV === "development" ? "http://localhost:7890" : "");

export { origin };
