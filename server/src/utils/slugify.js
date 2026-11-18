const MAX_SLUG_LENGTH = 80;

// "Héllo, World!  Part 2" -> "hello-world-part-2"
export const slugify = (text) =>
  String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, '');
