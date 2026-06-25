export const toTitleCase = (str) => {
  if (!str) return str;
  return str.replace(/\b\w/g, (ch) => ch.toUpperCase());
};

export const toSentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
