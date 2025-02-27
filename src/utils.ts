import { HomeAssistant } from 'custom-card-helpers';

/**
 * Map string to enum value
 *
 * @param enumType Enum type to map to
 * @param value Value to map
 * @returns Enum value or undefined if not found
 */
export const mapStringToEnum = <T extends Record<string, any>>(
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
    console.warn(`NavbarCard: Error evaluating badge template: ${e}`);
    return false;
  }
};

/**
 *  Process template with Home Assistant states
 *
 *  @param hass Home Assistant instance
 *  @param template Template string to be processed
 */
export const processTemplate = (hass: HomeAssistant, template?: any) => {
  if (!template || !hass) return template;

  // Check if template is of type string
  if (typeof template !== 'string') return template;

  // Valid template starts with [[ and ends with ]]]
  if (!(template.trim().startsWith('[[[') && template.trim().endsWith(']]]'))) {
    return template;
  }
  console.log(template);

  // Run template against home assistant states
  try {
    const cleanTemplate = template.replace(/\[\[\[|\]\]\]/g, '');
    const func = new Function('states', cleanTemplate);
    return func(hass.states);
  } catch (e) {
    console.warn(`NavbarCard: Error evaluating template: ${e}`);
    return template;
  }
};
