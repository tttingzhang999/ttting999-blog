// Shared with the publisher so nested Chinese filenames retain meaningful URLs.
export const blogSlugifyOptions = {
  lower: true,
  remove: /[^\p{L}\p{N}\s$*_+~.()'"!\-:@]+/gu,
};
