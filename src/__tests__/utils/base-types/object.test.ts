import { describe, it, expect } from 'vitest';
import { deepMergeKeepArrays } from '../../../utils/base-types/object';

describe('object utilities', () => {
  describe('deepMergeKeepArrays', () => {
    it('should replace arrays entirely', () => {
      const original = {
        items: [1, 2, 3],
        name: 'test',
      };
      const newData = {
        items: [4, 5, 6],
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        items: [4, 5, 6],
        name: 'test',
      });
    });

    it('should merge nested objects', () => {
      const original = {
        user: {
          name: 'John',
          age: 30,
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        active: true,
      };
      const newData = {
        user: {
          age: 31,
          settings: {
            theme: 'light',
          },
        },
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        user: {
          name: 'John',
          age: 31,
          settings: {
            theme: 'light',
            notifications: true,
          },
        },
        active: true,
      });
    });

    it('should remove keys when newData value is null', () => {
      const original = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };
      const newData = {
        age: null,
        email: 'newemail@example.com',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        name: 'John',
        email: 'newemail@example.com',
      });
      expect('age' in result).toBe(false);
    });

    it('should keep original values when newData value is undefined', () => {
      const original = {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      };
      const newData = {
        name: 'Jane',
        age: undefined,
        email: 'jane@example.com',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        name: 'Jane',
        age: 30, // Kept original value
        email: 'jane@example.com',
      });
    });

    it('should handle primitive values', () => {
      const original = 'hello';
      const newData = 'world';

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toBe('world');
    });

    it('should handle null values', () => {
      const original = {
        value: 'test',
      };
      const newData = {
        value: null,
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({});
      expect('value' in result).toBe(false);
    });

    it('should handle undefined newData', () => {
      const original = {
        name: 'John',
        age: 30,
      };
      const newData = undefined;

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toBe(original);
    });

    it('should handle mixed array and object updates', () => {
      const original = {
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
        settings: {
          theme: 'dark',
          language: 'en',
        },
        tags: ['important', 'urgent'],
      };
      const newData = {
        users: [{ id: 3, name: 'Bob' }], // Replace entire array
        settings: {
          theme: 'light', // Update nested object
        },
        tags: ['new', 'updated'], // Replace entire array
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        users: [{ id: 3, name: 'Bob' }],
        settings: {
          theme: 'light',
          language: 'en',
        },
        tags: ['new', 'updated'],
      });
    });

    it('should handle deeply nested objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
              other: 'keep',
            },
          },
          level2Other: 'keep',
        },
        topLevel: 'keep',
      };
      const newData = {
        level1: {
          level2: {
            level3: {
              value: 'updated',
            },
          },
        },
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'updated',
              other: 'keep',
            },
          },
          level2Other: 'keep',
        },
        topLevel: 'keep',
      });
    });

    it('should handle empty objects', () => {
      const original = {};
      const newData = {
        newProp: 'value',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        newProp: 'value',
      });
    });

    it('should handle empty newData object', () => {
      const original = {
        name: 'John',
        age: 30,
      };
      const newData = {};

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual(original);
    });

    it('should handle null original item', () => {
      const original = null;
      const newData = {
        name: 'John',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        name: 'John',
      });
    });

    it('should handle null newData', () => {
      const original = {
        name: 'John',
        age: 30,
      };
      const newData = null;

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toBe(null);
    });

    it('should handle arrays with objects', () => {
      const original = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      };
      const newData = {
        items: [
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
        ],
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        items: [
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
        ],
      });
    });

    it('should handle complex nested structures with arrays', () => {
      const original = {
        config: {
          servers: [
            { host: 'server1', port: 8080 },
            { host: 'server2', port: 9090 },
          ],
          settings: {
            timeout: 5000,
            retries: 3,
          },
        },
        metadata: {
          version: '1.0.0',
          tags: ['stable', 'production'],
        },
      };
      const newData = {
        config: {
          servers: [{ host: 'newserver', port: 3000 }],
          settings: {
            timeout: 10000,
          },
        },
        metadata: {
          version: '2.0.0',
          tags: ['beta', 'testing'],
        },
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        config: {
          servers: [{ host: 'newserver', port: 3000 }],
          settings: {
            timeout: 10000,
            retries: 3,
          },
        },
        metadata: {
          version: '2.0.0',
          tags: ['beta', 'testing'],
        },
      });
    });

    it('should not mutate original objects', () => {
      const original = {
        name: 'John',
        settings: {
          theme: 'dark',
        },
      };
      const originalCopy = JSON.parse(JSON.stringify(original));
      const newData = {
        name: 'Jane',
        settings: {
          theme: 'light',
        },
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(original).toEqual(originalCopy);
      expect(result).not.toBe(original);
    });

    it('should handle boolean values', () => {
      const original = {
        enabled: true,
        visible: false,
      };
      const newData = {
        enabled: false,
        visible: true,
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        enabled: false,
        visible: true,
      });
    });

    it('should handle number values', () => {
      const original = {
        count: 10,
        price: 99.99,
      };
      const newData = {
        count: 20,
        price: 149.99,
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        count: 20,
        price: 149.99,
      });
    });
  });
});
