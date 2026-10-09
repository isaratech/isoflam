// Imported images are embedded in the drawing as data URLs: a full resolution phone photo
// makes the JSON file several MB heavy for no visible benefit. Images larger than this
// (longest side, in pixels) are downscaled on import. Screenshots of maps stay untouched.
export const MAX_IMPORTED_IMAGE_SIZE = 2560;

const RESIZABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const JPEG_QUALITY = 0.85;

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      return resolve(image);
    };
    image.onerror = reject;
    image.src = src;
  });
};

// Returns the image (data URL) downscaled to fit MAX_IMPORTED_IMAGE_SIZE, or the original one
// when it is small enough, of a type we don't re-encode (GIF, SVG...) or if anything fails.
export const downscaleImage = async (
  dataUrl: string,
  mimeType: string,
  maxSize = MAX_IMPORTED_IMAGE_SIZE
): Promise<string> => {
  if (!RESIZABLE_TYPES.includes(mimeType)) return dataUrl;

  try {
    const image = await loadImage(dataUrl);
    const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight);

    if (scale >= 1) return dataUrl;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) return dataUrl;

    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // PNG and WebP may have transparency: keep them lossless
    const resized =
      mimeType === 'image/jpeg'
        ? canvas.toDataURL('image/jpeg', JPEG_QUALITY)
        : canvas.toDataURL('image/png');

    return resized.length < dataUrl.length ? resized : dataUrl;
  } catch (e) {
    return dataUrl;
  }
};
