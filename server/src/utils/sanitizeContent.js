import sanitizeHtml from 'sanitize-html';

// Whitelist for rich-text editor output. Anything else (scripts, iframes, inline event
// handlers, javascript: URLs) is stripped before the content is stored.
const OPTIONS = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2', 'figure', 'figcaption'],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    pre: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  // Only syntax-highlighting classes survive on code blocks
  allowedClasses: { code: ['language-*'], pre: ['language-*'] },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
};

export const sanitizeContent = (html) => sanitizeHtml(html, OPTIONS);

// Text length of the content once tags are removed, used to reject "empty" posts like "<p></p>"
export const plainTextLength = (html) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim().length;
