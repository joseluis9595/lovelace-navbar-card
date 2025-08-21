import { HomeAssistant } from 'custom-card-helpers';
import { NavbarCardPublicState, TemplateFunction } from './types';
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
  navbar: NavbarCard,
): NavbarCardPublicState => {
  return {
    isDesktop: navbar.isDesktop ?? false,
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
  navbar: NavbarCard,
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
 * Trigger haptic feedback by firing a 'haptic' event on the window.
 *
 * @param hapticType - The type of haptic feedback (default: 'selection')
 * @returns The created and dispatched event
 */
export const hapticFeedback = (hapticType: string = 'selection') => {
  return fireDOMEvent(window, 'haptic', undefined, hapticType);
};
