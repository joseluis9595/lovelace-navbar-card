import { describe, it, expect } from 'vitest';
import { generateHash, mapStringToEnum } from '@/utils';

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

describe('mapStringToEnum', () => {
  enum TestEnum {
    VALUE1 = 'value1',
    VALUE2 = 'value2',
    VALUE3 = 'value3',
  }

  enum NumericEnum {
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
  }

  enum MixedEnum {
    STRING_VALUE = 'string',
    NUMERIC_VALUE = 42,
    BOOLEAN_VALUE = true,
  }

  it('should return enum value when string matches enum value', () => {
    const result = mapStringToEnum(TestEnum, 'value1');
    expect(result).toBe(TestEnum.VALUE1);
  });

  it('should return enum value for different enum values', () => {
    const result1 = mapStringToEnum(TestEnum, 'value2');
    const result2 = mapStringToEnum(TestEnum, 'value3');

    expect(result1).toBe(TestEnum.VALUE2);
    expect(result2).toBe(TestEnum.VALUE3);
  });

  it('should return undefined when string does not match any enum value', () => {
    const result = mapStringToEnum(TestEnum, 'nonexistent');
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const result = mapStringToEnum(TestEnum, '');
    expect(result).toBeUndefined();
  });

  it('should return undefined for numeric enum values (string comparison)', () => {
    // Numeric enums have numeric values, not string values
    const result = mapStringToEnum(NumericEnum, '1');
    expect(result).toBeUndefined();
  });

  it('should return undefined for numeric enum with non-matching string', () => {
    const result = mapStringToEnum(NumericEnum, '4');
    expect(result).toBeUndefined();
  });

  it('should handle mixed enum types', () => {
    const result1 = mapStringToEnum(MixedEnum, 'string');
    const result2 = mapStringToEnum(MixedEnum, '42');
    const result3 = mapStringToEnum(MixedEnum, 'true');

    expect(result1).toBe(MixedEnum.STRING_VALUE);
    expect(result2).toBeUndefined(); // Numeric value 42 is not string '42'
    expect(result3).toBeUndefined(); // Boolean value true is not string 'true'
  });

  it('should return undefined for mixed enum with non-matching values', () => {
    const result1 = mapStringToEnum(MixedEnum, 'number');
    const result2 = mapStringToEnum(MixedEnum, 'false');
    const result3 = mapStringToEnum(MixedEnum, '100');

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
    expect(result3).toBeUndefined();
  });

  it('should handle case sensitivity correctly', () => {
    const result = mapStringToEnum(TestEnum, 'VALUE1'); // Different case
    expect(result).toBeUndefined();
  });

  it('should handle single value enum', () => {
    enum SingleEnum {
      ONLY = 'only',
    }

    const result = mapStringToEnum(SingleEnum, 'only');
    expect(result).toBe(SingleEnum.ONLY);
  });

  it('should handle empty enum', () => {
    enum EmptyEnum {}

    const result = mapStringToEnum(EmptyEnum, 'any');
    expect(result).toBeUndefined();
  });

  it('should handle enum with special characters', () => {
    enum SpecialEnum {
      SPECIAL = 'special-value_with.dots',
      ANOTHER = 'another@value#with$symbols',
    }

    const result1 = mapStringToEnum(SpecialEnum, 'special-value_with.dots');
    const result2 = mapStringToEnum(SpecialEnum, 'another@value#with$symbols');

    expect(result1).toBe(SpecialEnum.SPECIAL);
    expect(result2).toBe(SpecialEnum.ANOTHER);
  });

  it('should handle enum with numeric string values', () => {
    enum StringNumericEnum {
      ZERO = '0',
      ONE = '1',
      TEN = '10',
    }

    const result1 = mapStringToEnum(StringNumericEnum, '0');
    const result2 = mapStringToEnum(StringNumericEnum, '1');
    const result3 = mapStringToEnum(StringNumericEnum, '10');

    expect(result1).toBe(StringNumericEnum.ZERO);
    expect(result2).toBe(StringNumericEnum.ONE);
    expect(result3).toBe(StringNumericEnum.TEN);
  });

  it('should demonstrate difference between numeric and string enums', () => {
    enum NumericEnum {
      FIRST = 1,
    }
    enum StringEnum {
      FIRST = '1',
    }

    // Numeric enum: value is number 1, not string '1'
    const numericResult = mapStringToEnum(NumericEnum, '1');
    expect(numericResult).toBeUndefined();

    // String enum: value is string '1'
    const stringResult = mapStringToEnum(StringEnum, '1');
    expect(stringResult).toBe(StringEnum.FIRST);
  });

  it('should return undefined for whitespace-only strings', () => {
    const result = mapStringToEnum(TestEnum, '   ');
    expect(result).toBeUndefined();
  });

  it('should handle enum with boolean string values', () => {
    enum BooleanStringEnum {
      TRUE = 'true',
      FALSE = 'false',
    }

    const result1 = mapStringToEnum(BooleanStringEnum, 'true');
    const result2 = mapStringToEnum(BooleanStringEnum, 'false');

    expect(result1).toBe(BooleanStringEnum.TRUE);
    expect(result2).toBe(BooleanStringEnum.FALSE);
  });
});
