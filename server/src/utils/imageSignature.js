// File signatures ("magic bytes"). The MIME type in a multipart upload is whatever the client
// says it is; these check what the bytes actually are, so a renamed .exe/.html/.svg is rejected.
const SIGNATURES = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, i) => b[i] === byte),
  },
  {
    type: 'image/gif',
    // "GIF87a" or "GIF89a"
    test: (b) =>
      b.toString('ascii', 0, 4) === 'GIF8' && [0x37, 0x39].includes(b[4]) && b[5] === 0x61,
  },
  {
    type: 'image/webp',
    // "RIFF" <size> "WEBP"
    test: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
];

/** Returns the real image MIME type of `buffer`, or null if it isn't a supported image. */
export const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  return SIGNATURES.find((signature) => signature.test(buffer))?.type ?? null;
};
