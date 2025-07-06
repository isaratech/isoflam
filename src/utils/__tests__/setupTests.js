// Mock for lz-string
jest.mock('lz-string', () => ({
  compressToEncodedURIComponent: jest.fn((data) => `compressed_${data}`),
  decompressFromEncodedURIComponent: jest.fn((data) => {
    if (data && data.startsWith('compressed_')) {
      return data.substring(11); // Remove 'compressed_' prefix
    }
    return null;
  })
}));