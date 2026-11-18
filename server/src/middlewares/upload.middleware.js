import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { detectImageType } from '../utils/imageSignature.js';
import { IMAGE_UPLOAD } from '../constants/index.js';

// Files are kept in memory and streamed to Cloudinary, so nothing is written to disk.
// The limits bound how much memory a single request can make the server hold.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_UPLOAD.MAX_BYTES,
    files: 1,
    fields: 20,
    parts: 25,
  },
  // Cheap first check on the declared type, before the file is even buffered
  fileFilter(_req, file, cb) {
    if (IMAGE_UPLOAD.MIME_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new ApiError(400, 'Only JPEG, PNG, WEBP and GIF images are allowed'));
  },
});

// Second check on the actual bytes. Also rejects a declared type that doesn't match the content
// (e.g. a PNG sent as image/jpeg), which usually means the file was tampered with or renamed.
const verifyImageContent = (req, _res, next) => {
  if (!req.file) return next();

  const detected = detectImageType(req.file.buffer);
  if (!detected || detected !== req.file.mimetype) {
    return next(new ApiError(400, 'The uploaded file is not a valid JPEG, PNG, WEBP or GIF image'));
  }
  next();
};

/**
 * Accepts at most one image in multipart field `field`, verified by content.
 * Requests without a file (or JSON requests) pass straight through.
 * Usage: router.post('/', protect, ...acceptImage('coverImage'), validator, handler)
 */
export const acceptImage = (field) => [upload.single(field), verifyImageContent];
