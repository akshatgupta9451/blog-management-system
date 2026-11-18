// Lowercase, strip accents: "Zoë" -> "zoe"
export const normalizeText = (text = '') =>
  String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// "Ada  Lovelace-Byron" -> ["ada", "lovelace", "byron"]
export const tokenizeName = (name) => [
  ...new Set(
    normalizeText(name)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  ),
];

// Makes user input safe to embed in a RegExp
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Index-friendly prefix match: { $gte: "lov", $lt: "low" } finds every key starting with "lov"
export const prefixRange = (prefix) => ({
  $gte: prefix,
  $lt: prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1),
});
