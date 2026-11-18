import { useId, useState } from 'react';
import { IMAGE_UPLOAD } from '@/constants';
import { compressImage, formatBytes } from '@/utils/compressImage';
import { cn } from '@/utils/format';
import CloudImage from './CloudImage';

const MAX_MB = IMAGE_UPLOAD.MAX_SIZE / (1024 * 1024);
const MAX_SOURCE_MB = IMAGE_UPLOAD.MAX_SOURCE_SIZE / (1024 * 1024);

/**
 * Image picker with a local preview. The chosen file is checked, compressed in the browser
 * (see compressImage) and then passed to onChange(file). With `onRemove`, a Remove button
 * clears the current image; the parent decides what removal means (e.g. removeCover on save).
 * `shape="round"` is used for avatars, `"wide"` for blog covers.
 */
const ImageUpload = ({
  label,
  currentUrl,
  onChange,
  onRemove,
  error,
  shape = 'wide',
  maxDimension = 2000,
  disabled,
}) => {
  const id = useId();
  const [preview, setPreview] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState({ busy: false, note: '', error: '' });

  const handleChange = async (event) => {
    const picked = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!picked) return;

    if (!IMAGE_UPLOAD.ACCEPT.includes(picked.type)) {
      setStatus({ busy: false, note: '', error: 'Please choose a JPEG, PNG, WEBP or GIF image.' });
      return;
    }
    if (picked.size > IMAGE_UPLOAD.MAX_SOURCE_SIZE) {
      setStatus({ busy: false, note: '', error: `Image must be smaller than ${MAX_SOURCE_MB}MB.` });
      return;
    }

    setStatus({ busy: true, note: 'Optimizing image…', error: '' });
    const file = await compressImage(picked, { maxDimension });

    if (file.size > IMAGE_UPLOAD.MAX_SIZE) {
      setStatus({
        busy: false,
        note: '',
        error: `This image is still ${formatBytes(file.size)} after optimizing (max ${MAX_MB}MB). Try a smaller one.`,
      });
      return;
    }

    setStatus({
      busy: false,
      error: '',
      note:
        file === picked
          ? formatBytes(file.size)
          : `Optimized ${formatBytes(picked.size)} → ${formatBytes(file.size)}`,
    });
    setRemoved(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setRemoved(true);
    setStatus({ busy: false, note: '', error: '' });
    onRemove();
  };

  const existing = removed ? null : currentUrl;
  const hasImage = Boolean(preview || existing);
  const shownError = status.error || error;
  const round = shape === 'round';

  return (
    <div>
      {label && <p className="mb-1.5 block text-sm font-medium text-gray-700">{label}</p>}
      <div className={cn('flex gap-4', round ? 'items-center' : 'flex-col')}>
        <div
          className={cn(
            'relative overflow-hidden bg-gray-100 ring-1 ring-gray-200',
            round ? 'size-24 shrink-0 rounded-full' : 'aspect-[2/1] w-full rounded-lg'
          )}
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : existing ? (
            <CloudImage
              src={existing}
              widths={round ? [96, 192] : [400, 800]}
              sizes={round ? '96px' : '320px'}
              aspectRatio={round ? 1 : 2}
              gravity={round ? 'face' : 'auto'}
              loading="eager"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-gray-400">
              {removed ? 'Will be removed when you save' : 'No image'}
            </div>
          )}
          {status.busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-gray-600">
              Optimizing…
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={id}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center rounded-lg bg-white px-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50',
                (disabled || status.busy) && 'pointer-events-none opacity-60'
              )}
            >
              {hasImage ? 'Change image' : 'Upload image'}
            </label>
            {onRemove && hasImage && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || status.busy}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
          <input
            id={id}
            type="file"
            accept={IMAGE_UPLOAD.ACCEPT.join(',')}
            onChange={handleChange}
            disabled={disabled || status.busy}
            className="sr-only"
          />
          <p className="mt-1.5 text-xs text-gray-500" aria-live="polite">
            {status.note || `JPEG, PNG, WEBP or GIF. Large photos are optimized automatically.`}
          </p>
          {shownError && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {shownError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
