import { DeepPartial } from "@/types";

/**
 * Deep merges data from "newData" into "item", completely replacing arrays
 * instead of merging them
 *
 * @param item Original item
 * @param newData New data to deepmerge and override
 */
export function deepMergeKeepArrays<T>(item: T, newData: DeepPartial<T>): T {
  if (Array.isArray(newData)) {
    // Replace arrays entirely
    return newData as T;
  } else if (
    newData !== null &&
    typeof newData === 'object' &&
    item !== null &&
    typeof item === 'object'
  ) {
    // Merge objects
    const result = { ...item } as Record<string, unknown>;
    for (const key in newData) {
      if (newData[key] === null) {
        // Remove key if newData[key] is null
        delete result[key];
      } else if (newData[key] !== undefined) {
        result[key] = deepMergeKeepArrays(
          (item as Record<string, unknown>)[key],
          newData[key],
        );
      }
      // If newData[key] is undefined, keep the original
    }
    return result as T;
  } else if (newData !== undefined) {
    // For primitives or if newData is defined, use newData
    return newData as T;
  }
  // If newData is undefined, keep the original item
  return item;
}