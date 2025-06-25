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
 * Process a template string with Home Assistant states and user context.
 *
 * @param hass - Home Assistant instance
 * @param template - Template string to be processed
 * @returns The processed template result or the original value if not a template
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

/**
 * Fire a DOM event with optional detail and event options.
 *
 * @param node - The node to dispatch the event from
 * @param type - The event type
 * @param options - Optional event options (bubbles, composed)
 * @param detail - Optional event detail
 * @returns The created and dispatched event
 */
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

/**
 * Trigger haptic feedback by firing a 'haptic' event on the window.
 *
 * @param hapticType - The type of haptic feedback (default: 'selection')
 * @returns The created and dispatched event
 */
export const hapticFeedback = (hapticType: string = 'selection') => {
  return fireDOMEvent(window, 'haptic', undefined, hapticType);
};
