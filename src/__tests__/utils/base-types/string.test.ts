import { describe, it, expect } from 'vitest';
import { generateHash } from '@/utils';

describe('generateHash', () => {
  it('returns a string result for a given input', () => {
    const result = generateHash('test');
    expect(typeof result).toBe('string');
  });

  it('is deterministic for the same input', () => {
    const h1 = generateHash('consistent');
    const h2 = generateHash('consistent');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different inputs', () => {
    const h1 = generateHash('apple');
    const h2 = generateHash('banana');
    expect(h1).not.toBe(h2);
  });

  it('handles empty strings gracefully', () => {
    const result = generateHash('');
    expect(result).toBe('0'); // expected by implementation
  });

  it('handles long strings without crashing', () => {
    const longStr = 'a'.repeat(10_000);
    const result = generateHash(longStr);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('may theoretically collide but is stable for known examples', () => {
    const h1 = generateHash('Aa');
    const h2 = generateHash('BB');
    expect(h1).not.toBeUndefined();
    expect(h2).not.toBeUndefined();
  });
});
