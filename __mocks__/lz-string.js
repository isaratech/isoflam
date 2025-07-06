// Mock implementation of lz-string
const LZString = {
  compressToEncodedURIComponent: jest.fn((data) => {
    return `compressed_${data}`;
  }),
  decompressFromEncodedURIComponent: jest.fn((data) => {
    if (data && data.startsWith('compressed_')) {
      return data.substring(11); // Remove 'compressed_' prefix
    }
    return null;
  })
};

module.exports = LZString;