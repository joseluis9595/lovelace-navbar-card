import { HomeAssistant } from 'custom-card-helpers';

// Extend the `HomeAssistant` type to include updated properties.
declare module 'custom-card-helpers' {
  interface HomeAssistant {
    entities: Record<string, { icon?: string; [key: string]: unknown }>;
  }
}

export type NavbarCardPublicState = {
  isDesktop: boolean;
};

export type TemplateFunction<T = unknown> = (
  states: HomeAssistant['states'],
  user: HomeAssistant['user'],
  hass: HomeAssistant,
  navbar: NavbarCardPublicState,
) => T;

export type RippleElement = Element & {
  hovered?: boolean;
  pressed?: boolean;
};

/**
 * Type referring to all the keys inside a dictionary, using dot notation
 */
export type DotNotationKeys<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends unknown[]
        ? `${string & K}`
        : `${string & K}` | `${string & K}.${DotNotationKeys<T[K]>}`;
    }[keyof T]
  : never;

/**
 * Get the nested type of a key inside a dictionary, using dot notation
 */
export type NestedType<
  T,
  K extends DotNotationKeys<T>,
> = K extends `${infer FirstKey}.${infer RestKeys}`
  ? FirstKey extends keyof T
    ? RestKeys extends DotNotationKeys<T[FirstKey]>
      ? NestedType<T[FirstKey], RestKeys>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never;

/**
 * Get a property from an object, given a dot notation field, with type checking
 * for typescript using genericity
 * @param obj any object
 * @param key a valid string key using dot notation
 * @returns the value of the given key inside the dictionary
 */
export function genericGetProperty<T, K extends DotNotationKeys<T>>(
  obj: T,
  key: K,
): NestedType<T, K> {
  return key.split('.').reduce((o: T, k: string) => o?.[k], obj) as NestedType<
    T,
    K
  >;
}

/**
 * Set a property in an object, given a dot notation field, with type checking
 * for typescript using genericity
 * @param obj any object
 * @param key a valid string key using dot notation
 * @param value new value for the given key
 */
export function genericSetProperty<T, K extends DotNotationKeys<T>>(
  obj: T,
  key: K,
  value: NestedType<T, K> | null,
): T {
  const paths = key.split('.');
  const finalKey = paths.pop() as string;

  // Recursively copy the object structure
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };

  // Pointers for both current and original objects
  let currentObj: Record<string, unknown> = copy as Record<string, unknown>;
  let originalObj: Record<string, unknown> = obj as Record<string, unknown>;

  // Iterate through each entry
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    // If property does not exist or is not an object, create it
    if (
      typeof originalObj[p] !== 'object' ||
      originalObj[p] === undefined ||
      originalObj[p] === null
    ) {
      // Determine if next key is a number (for arrays)
      const nextKey = paths[i + 1];
      const isArrayIndex = nextKey !== undefined && !isNaN(Number(nextKey));
      currentObj[p] = isArrayIndex ? [] : {};
    } else {
      // Copy each level
      currentObj[p] = Array.isArray(originalObj[p])
        ? [...(originalObj[p] as unknown[])]
        : { ...(originalObj[p] as Record<string, unknown>) };
    }
    currentObj = currentObj[p] as Record<string, unknown>;
    originalObj = (originalObj[p] as Record<string, unknown>) ?? {};
  }

  // Return the modified copy
  currentObj[finalKey] = value;
  return copy as T;
}

/**
 * A utility type that makes all properties of a given type optional,
 * including nested properties. This type recursively applies `Partial`
 * to every property in the object, allowing for deep partial updates.
 *
 * @template T - The object type to apply deep partiality to.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
