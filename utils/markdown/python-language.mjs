// Existing articles use both Python and python fence labels.
export default function pythonLanguage() {
  function normalize(node) {
    return {
      ...node,
      ...(node.type === "code" && node.lang === "Python" ? { lang: "python" } : {}),
      ...(node.children ? { children: node.children.map(normalize) } : {}),
    };
  }
  return normalize;
}
