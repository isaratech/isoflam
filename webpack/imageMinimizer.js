const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

// The icon bank weighs ~100 MB of PNG, and the service worker precaches all of it on the
// first visit. Re-encoding the PNGs with a 256 colour palette (libimagequant) brings it to
// ~22 MB with no visible difference: dithering is disabled because it shows as a grain on
// flat colours. Source images are left untouched; only the built assets are optimised.
const PNG_OPTIONS = {
  palette: true,
  quality: 90,
  dither: 0,
  effort: 7,
  compressionLevel: 9
};

// Keep the original when re-encoding doesn't make the file smaller
const sharpMinifyIfSmaller = async (original, options) => {
  const result = await ImageMinimizerPlugin.sharpMinify(original, options);

  if (!result || result.data.length >= original.data.length) {
    return original;
  }

  return result;
};

module.exports = new ImageMinimizerPlugin({
  test: /\.png$/i,
  minimizer: {
    implementation: sharpMinifyIfSmaller,
    options: {
      encodeOptions: {
        png: PNG_OPTIONS
      }
    }
  }
});
