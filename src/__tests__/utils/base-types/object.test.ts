import { describe, expect, it } from 'vitest';

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
        active: true,
        user: {
          age: 30,
          name: 'John',
          settings: {
            notifications: true,
            theme: 'dark',
          },
        },
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
        active: true,
        user: {
          age: 31,
          name: 'John',
          settings: {
            notifications: true,
            theme: 'light',
          },
        },
      });
    });

    it('should remove keys when newData value is null', () => {
      const original = {
        age: 30,
        email: 'john@example.com',
        name: 'John',
      };
      const newData = {
        age: null,
        email: 'newemail@example.com',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        email: 'newemail@example.com',
        name: 'John',
      });
      expect('age' in result).toBe(false);
    });

    it('should keep original values when newData value is undefined', () => {
      const original = {
        age: 30,
        email: 'john@example.com',
        name: 'John',
      };
      const newData = {
        age: undefined,
        email: 'jane@example.com',
        name: 'Jane',
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        age: 30, // Kept original value
        email: 'jane@example.com',
        name: 'Jane',
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
        age: 30,
        name: 'John',
      };
      const newData = undefined;

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toBe(original);
    });

    it('should handle mixed array and object updates', () => {
      const original = {
        settings: {
          language: 'en',
          theme: 'dark',
        },
        tags: ['important', 'urgent'],
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
      };
      const newData = {
        settings: {
          theme: 'light', // Update nested object
        },
        tags: ['new', 'updated'], // Replace entire array
        users: [{ id: 3, name: 'Bob' }], // Replace entire array
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        settings: {
          language: 'en',
          theme: 'light',
        },
        tags: ['new', 'updated'],
        users: [{ id: 3, name: 'Bob' }],
      });
    });

    it('should handle deeply nested objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              other: 'keep',
              value: 'deep',
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
              other: 'keep',
              value: 'updated',
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
        age: 30,
        name: 'John',
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
        age: 30,
        name: 'John',
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
            retries: 3,
            timeout: 5000,
          },
        },
        metadata: {
          tags: ['stable', 'production'],
          version: '1.0.0',
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
          tags: ['beta', 'testing'],
          version: '2.0.0',
        },
      };

      const result = deepMergeKeepArrays(original, newData);

      expect(result).toEqual({
        config: {
          servers: [{ host: 'newserver', port: 3000 }],
          settings: {
            retries: 3,
            timeout: 10000,
          },
        },
        metadata: {
          tags: ['beta', 'testing'],
          version: '2.0.0',
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
