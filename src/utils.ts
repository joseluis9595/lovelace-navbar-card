import { HomeAssistant } from 'custom-card-helpers';

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
 *  Badge visibility evaluator
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
 *  Process template with Home Assistant states
 *
 *  @param hass Home Assistant instance
 *  @param template Template string to be processed
 */
export const processTemplate = (hass: HomeAssistant, template?: unknown) => {
  if (!template || !hass) return template;

  // Check if template is of type string
  if (typeof template !== 'string') return template;

  // Valid template starts with [[ and ends with ]]]
  if (!(template.trim().startsWith('[[[') && template.trim().endsWith(']]]'))) {
    return template;
  }

  // Run template against home assistant states
  try {
    const cleanTemplate = template.replace(/\[\[\[|\]\]\]/g, '');
    const func = new Function('states', 'user', 'hass', cleanTemplate);
    return func(hass.states, hass.user, hass);
  } catch (e) {
    console.error(`NavbarCard: Error evaluating template: ${e}`);
    return template;
  }
};

export const fireDOMEvent = (
  node: HTMLElement | Window,
  type: Event['type'],
  options?: { bubbles?: boolean; composed?: boolean },
  detail?: unknown,
) => {
  const event = new Event(type, options ?? {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (event as any).detail = detail;
  node.dispatchEvent(event);
  return event;
};

export const hapticFeedback = (hapticType: string = 'selection') => {
  return fireDOMEvent(window, 'haptic', undefined, hapticType);
};
