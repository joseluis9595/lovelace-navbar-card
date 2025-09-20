/**
 * Map string to enum value
 *
 * @param enumType Enum type to map to
 * @param value Value to map
 * @returns Enum value or undefined if not found
 */
export const mapStringToEnum = <T extends Record<string, unknown>>(
  enumType: T,
  value: string,
): T[keyof T] | undefined => {
  if (Object.values(enumType).includes(value)) {
    return value as T[keyof T];
  }
  return undefined;
};

/**
 * Generate a hash for a string
 *
 * @param str - String to hash
 * @returns Hash of the string
 */
export const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return hash.toString();
};