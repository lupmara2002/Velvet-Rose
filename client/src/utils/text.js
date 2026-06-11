// Capitalises the first letter of each word, leaves the rest unchanged.
// "dior backstage" → "Dior Backstage"
export const toTitleCase = (str) => {
  if (!str) return str;
  return str.replace(/\b\w/g, (ch) => ch.toUpperCase());
};

// Capitalises only the first letter of the whole string.
// "dior backstage foundation" → "Dior backstage foundation"
export const toSentenceCase = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
