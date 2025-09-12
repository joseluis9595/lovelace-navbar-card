import { HomeAssistant } from 'custom-card-helpers';
import { DeepPartial, TemplateFunction, NavbarCardPublicState } from './types';
import { NavbarCard } from './navbar-card';
import { fireDOMEvent } from './dom-utils';

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
 * Process a Home Assistant template for badge visibility.
 *
 * @param hass - Home Assistant instance
 * @param template - Template string to evaluate
 * @returns True if the badge should be shown, false otherwise
 */
export const processBadgeTemplate = (
  hass: HomeAssistant,
  template?: string,
): boolean => {
  if (!template || !hass) return false;
  try {
    // Dynamically evaluate template with current Home Assistant context
    const func = new Function('states', `return ${template}`);
    return func(hass.states) as boolean;
  } catch (e) {
    console.error(`NavbarCard: Error evaluating badge template: ${e}`);
    return false;
  }
};

/**
 * Generate a hash for a string
 *
 * @param str - String to hash
 * @returns Hash of the string
 */
const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return hash.toString();
};

// Template function cache for performance optimization
const templateFunctionCache = new Map<string, TemplateFunction>();

// Extract publicly accessible state variables from navbar card
const extractAccessibleStateVariables = (
  navbar?: NavbarCard,
): NavbarCardPublicState => {
  return {
    isDesktop: navbar?.isDesktop ?? false,
  };
};

/**
 * Process a template string with Home Assistant states and user context.
 *
 * @param hass - Home Assistant instance
 * @param template - Template string to be processed
 * @returns The processed template result or the original value if not a template
 */
export const processTemplate = <T = unknown>(
  hass: HomeAssistant,
  navbar?: NavbarCard,
  template?: unknown,
): T => {
  if (!template) return template as T;

  // Check if template is of type string
  if (typeof template !== 'string') return template as T;

  // Valid template starts with [[ and ends with ]]]
  if (!(template.trim().startsWith('[[[') && template.trim().endsWith(']]]'))) {
    return template as T;
  }

  // Run template against home assistant states
  try {
    const cleanTemplate = template.replace(/\[\[\[|\]\]\]/g, '');
    const hashedTemplate = generateHash(cleanTemplate);
    let func = templateFunctionCache.get(hashedTemplate);
    if (!func) {
      func = new Function(
        'states',
        'user',
        'hass',
        'navbar',
        cleanTemplate,
      ) as TemplateFunction;
      templateFunctionCache.set(hashedTemplate, func);
    }
    return func(
      hass.states,
      hass.user,
      hass,
      extractAccessibleStateVariables(navbar),
    ) as T;
  } catch (e) {
    console.error(`NavbarCard: Error evaluating template: ${e}`);
    return template as T;
  }
};

/**
 * Removes navbar-card template delimiters ([[[ and ]]]) from a template string.
 *
 * @param template - The template string to clean (e.g., '[[[ some code ]]]').
 * @returns The template string without the wrapping delimiters.
 */
export const cleanTemplate = (template: unknown): string => {
  if (typeof template === 'string') {
    return template.replace(/\[\[\[|\]\]\]/g, '');
  }
  return template?.toString() ?? '';
};

/**
 * Adds navbar-card template delimiters ([[[ and ]]]), if not already present, to a template string.
 *
 * @param template - The template string to wrap (e.g., 'some code').
 * @returns The template string wrapped with triple brackets if not already wrapped.
 */
export const wrapTemplate = (template: string) => {
  const trimmed = template.trim();
  if (trimmed.startsWith('[[[') && trimmed.endsWith(']]]')) {
    return template;
  }
  return `[[[${template}]]]`;
};

/**
 * Trigger haptic feedback by firing a 'haptic' event on the window.
 *
 * @param hapticType - The type of haptic feedback (default: 'selection')
 * @returns The created and dispatched event
 */
export const hapticFeedback = (hapticType: string = 'selection') => {
  return fireDOMEvent(window, 'haptic', undefined, hapticType);
};

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
