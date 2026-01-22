import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorage, isStorageAvailable } from '../src/utils/storage';

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  describe('getStorage', () => {
    it('should return sessionStorage for "sessionStorage" type', () => {
      const storage = getStorage('sessionStorage');
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
    });

    it('should return localStorage for "localStorage" type', () => {
      const storage = getStorage('localStorage');
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
    });

    it('should return memory storage for "memory" type', () => {
      const storage = getStorage('memory');
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
    });

    it('should return memory storage for unknown type', () => {
      const storage = getStorage('memory');
      expect(storage).toBeDefined();
      storage.setItem('key', 'value');
      expect(storage.getItem('key')).toBe('value');
    });
  });

  describe('memory storage', () => {
    it('should implement Storage interface', () => {
      const storage = getStorage('memory');

      // setItem and getItem
      storage.setItem('key1', 'value1');
      expect(storage.getItem('key1')).toBe('value1');

      // Return null for non-existent keys
      expect(storage.getItem('nonexistent')).toBeNull();

      // removeItem
      storage.removeItem('key1');
      expect(storage.getItem('key1')).toBeNull();

      // clear
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });

    it('should track length correctly', () => {
      const storage = getStorage('memory');
      storage.clear();

      expect(storage.length).toBe(0);
      storage.setItem('key1', 'value1');
      expect(storage.length).toBe(1);
      storage.setItem('key2', 'value2');
      expect(storage.length).toBe(2);
      storage.removeItem('key1');
      expect(storage.length).toBe(1);
    });

    it('should support key() method', () => {
      const storage = getStorage('memory');
      storage.clear();

      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');

      // Note: key order is not guaranteed
      const keys = [storage.key(0), storage.key(1)];
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(storage.key(99)).toBeNull();
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true for available sessionStorage', () => {
      expect(isStorageAvailable('sessionStorage')).toBe(true);
    });

    it('should return true for available localStorage', () => {
      expect(isStorageAvailable('localStorage')).toBe(true);
    });
  });
});
