import { model as modelFixture } from 'src/fixtures/model';
import {
  compressModelToString,
  decompressStringToModel,
  generateShareableUrl,
  extractModelFromUrl,
  hasSharedModelInUrl,
  MAX_URL_LENGTH
} from '../shareUtils';

// Mock window.location
let originalHref: string;
let originalOrigin: string;

beforeEach(() => {
  // Save original values
  originalHref = window.location.href;
  originalOrigin = window.location.origin;

  // Use Object.defineProperty to mock location properties
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      href: 'https://example.com',
      origin: 'https://example.com',
      // Add other required properties
      search: '',
      pathname: '/',
      hash: '',
      host: 'example.com',
      hostname: 'example.com',
      protocol: 'https:',
      port: ''
    }
  });
});

afterEach(() => {
  // Restore original values
  Object.defineProperty(window.location, 'href', {
    writable: true,
    value: originalHref
  });
  Object.defineProperty(window.location, 'origin', {
    writable: true,
    value: originalOrigin
  });
});

// Tests for shareUtils
describe('shareUtils', () => {
  // Test exports
  describe('exports', () => {
    test('exports the expected functions and constants', () => {
      expect(compressModelToString).toBeDefined();
      expect(decompressStringToModel).toBeDefined();
      expect(generateShareableUrl).toBeDefined();
      expect(extractModelFromUrl).toBeDefined();
      expect(hasSharedModelInUrl).toBeDefined();
      expect(MAX_URL_LENGTH).toBeDefined();
      expect(typeof MAX_URL_LENGTH).toBe('number');
    });
  });

  // Test function types
  describe('function types', () => {
    test('functions have the correct types', () => {
      expect(typeof compressModelToString).toBe('function');
      expect(typeof decompressStringToModel).toBe('function');
      expect(typeof generateShareableUrl).toBe('function');
      expect(typeof extractModelFromUrl).toBe('function');
      expect(typeof hasSharedModelInUrl).toBe('function');
    });
  });

  // Test basic functionality
  describe('basic functionality', () => {
    test('compressModelToString produces a string', () => {
      const compressed = compressModelToString(modelFixture);
      expect(typeof compressed).toBe('string');
    });

    test('decompressStringToModel returns null for invalid input', () => {
      expect(decompressStringToModel('')).toBeNull();
    });

    test('generateShareableUrl creates a URL with the share parameter', () => {
      const url = generateShareableUrl(modelFixture);
      expect(url).toContain('?share=');
    });

    test('generateShareableUrl uses provided baseUrl', () => {
      const baseUrl = 'https://custom-domain.com';
      const url = generateShareableUrl(modelFixture, baseUrl);
      expect(url).toContain(baseUrl);
    });

    test('hasSharedModelInUrl detects share parameter', () => {
      const url = 'https://example.com?share=something';
      expect(hasSharedModelInUrl(url)).toBe(true);
    });

    test('hasSharedModelInUrl returns false for URLs without share parameter', () => {
      const url = 'https://example.com';
      expect(hasSharedModelInUrl(url)).toBe(false);
    });

    test('hasSharedModelInUrl returns false for invalid URLs', () => {
      expect(hasSharedModelInUrl('not-a-url')).toBe(false);
    });

    test('extractModelFromUrl returns null for URLs without share parameter', () => {
      const url = 'https://example.com';
      const extracted = extractModelFromUrl(url);
      expect(extracted).toBeNull();
    });

    test('extractModelFromUrl returns null for invalid URLs', () => {
      const extracted = extractModelFromUrl('not-a-url');
      expect(extracted).toBeNull();
    });
  });
});
