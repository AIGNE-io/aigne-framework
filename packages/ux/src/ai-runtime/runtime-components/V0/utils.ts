export const getLineClamp = (count: number) => {
  return {
    display: "-webkit-box",
    WebkitLineClamp: count,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
};
