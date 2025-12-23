import type { HomeAssistant } from 'custom-card-helpers';

import type { NavbarCard } from '@/navbar-card';
import type { NavbarCardPublicState } from '@/types/types';
import { generateHash } from '@/utils';

export type TemplateFunction<T = unknown> = (
  states: HomeAssistant['states'],
  user: HomeAssistant['user'],
  hass: HomeAssistant,
  navbar: NavbarCardPublicState,
) => T;

const templateFunctionCache = new Map<string, TemplateFunction>();

/**
 * Check if a value is a valid navbar-card template string.
 *
 * A valid template string:
 * - Is of type `string`
 * - Starts with `[[[` and ends with `]]]`
 *
 * @param value - The value to check.
 * @returns True if the value is a template string, false otherwise.
 */
export const isTemplate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.startsWith('[[[') && trimmed.endsWith(']]]');
};

/**
 * Remove navbar-card delimiters (`[[[` and `]]]`) from a template string.
 *
 * @param value - The template string to clean.
 * @returns The unwrapped template content, or null if not a valid template.
 */
export const cleanTemplate = (
  value: string | null | undefined,
): string | null => {
  if (!isTemplate(value)) return null;
  return value.trim().slice(3, -3).trim();
};

/**
 * Wrap a string in navbar-card template delimiters if not already wrapped.
 *
 * @param value - The raw template code (e.g., `"states.light.kitchen.state"`).
 * @returns The string wrapped with delimiters (`[[[value]]]`).
 */
export const wrapTemplate = (value: string): string => {
  return isTemplate(value) ? value : `[[[${value}]]]`;
};

/**
 * Process and evaluate a Home Assistant template string within the current context.
 *
 * Templates must be wrapped in `[[[` and `]]]`. Multi-line templates are supported.
 * Templates are compiled once and cached internally by a hash of their cleaned content.
 *
 * Example:
 * ```ts
 * const template = `[[[ states["light.kitchen"].state ]]]`;
 * const state = processTemplate<string>(hass, navbar, template);
 * ```
 *
 * @typeParam T - The expected return type of the evaluated template.
 * @param hass - The Home Assistant instance providing `states`, `user`, and other context.
 * @param navbar - Optional `NavbarCard` context to provide template access to properties like `isDesktop`.
 * @param template - The raw value or template string to process.
 * @returns The evaluated template result of type `T`. If not a valid template, returns the original value.
 */
export const processTemplate = <T = unknown>(
  hass: HomeAssistant,
  navbar?: NavbarCard,
  template?: unknown,
  options?: {
    returnNullIfInvalid?: boolean;
    disableEmptyReturnCheck?: boolean;
  },
): T => {
  if (template == null || !isTemplate(template)) {
    return template as T;
  }

  try {
    const clean = cleanTemplate(template);
    if (clean === null) {
      console.error(`[navbar-card] Invalid template format: ${template}`);
      // TODO add proper typing for null return
      if (options?.returnNullIfInvalid) return null as T;
      return template as T;
    }

    const hashed = generateHash(clean);
    let func = templateFunctionCache.get(hashed) as
      | TemplateFunction
      | undefined;

    // If we haven't cached the function yet, create and cache it
    if (!func) {
      func = new Function(
        'states',
        'user',
        'hass',
        'navbar',
        clean,
      ) as TemplateFunction;
      templateFunctionCache.set(hashed, func);
    }

    // Execute the function with the current context
    // This is stored in a variable instead of directly returned
    // to allow for easier debugging and error handling
    const result = func(hass.states, hass.user, hass, {
      isDesktop: navbar?.isDesktop ?? false,
    }) as T;

    if (result === undefined) {
      if (!options?.disableEmptyReturnCheck) {
        console.error(
          `[navbar-card] Template did not return a value: ${template}`,
        );
      }
      // TODO add proper typing for null return
      if (options?.returnNullIfInvalid) return null as T;
      return template as T;
    }

    return result;
  } catch (err) {
    console.error(`[navbar-card] Error evaluating template: ${err}`);
    // TODO add proper typing for null return
    if (options?.returnNullIfInvalid) return null as T;
    return template as T;
  }
};

/**
 * @deprecated This function is deprecated and will be removed in future versions.
 *
 * @param hass - The Home Assistant instance providing states.
 * @param template - A raw JavaScript expression string to evaluate.
 * @returns True if the expression evaluates truthy, false otherwise.
 */
export const processBadgeTemplate = (
  hass: HomeAssistant,
  template?: string,
): boolean => {
  if (!(hass && template)) return false;

  try {
    const func = new Function('states', `return ${template}`);
    return Boolean(func(hass.states));
  } catch (err) {
    console.error('[navbar-card] Error evaluating badge template:', err);
    return false;
  }
};
