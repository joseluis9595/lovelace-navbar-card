import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { NavbarCard } from '@/navbar-card';
import { RouteItem } from '@/config';
import { TemplateError } from '@errors';
import {
  cleanTemplate,
  isTemplate,
  wrapTemplate,
  processTemplate,
} from '@utils';

describe('Template utilities', () => {
  let mockHass: HomeAssistant;
  let mockNavbar: NavbarCard;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHass = {
      states: {
        'light.kitchen': { entity_id: 'light.kitchen', state: 'on', attributes: {}, context: {}, last_changed: '', last_updated: '' },
        'light.living_room': { entity_id: 'light.living_room', state: 'off', attributes: {}, context: {}, last_changed: '', last_updated: '' },
        'sensor.temperature': { entity_id: 'sensor.temperature', state: '22.5', attributes: {}, context: {}, last_changed: '', last_updated: '' },
      },
      areas: {
        area1: { area_id: 'area1', name: 'Kitchen', icon: 'mdi:kitchen' },
        area2: { area_id: 'area2', name: 'Living Room', icon: 'mdi:sofa' },
      },
      user: { id: 'user1', name: 'User', is_admin: true, is_owner: true, credentials: [], mfa_modules: [] },
      config: {},
      themes: {},
      selectedTheme: null,
      panels: {},
      services: {},
      auth: { data: { access_token: '', expires_in: 0, refresh_token: '', token_type: '' } },
    } as unknown as HomeAssistant;

    mockNavbar = { isDesktop: true } as NavbarCard;
  });
-
  describe('isTemplate', () => {
    it('Correctly identifies valid JSTemplates', () => {
      expect(isTemplate('[[[ return states["light.kitchen"].state ]]]')).toBe(true);
      expect(isTemplate('[[[ const x = 1; ]]]')).toBe(true);
      expect(isTemplate('[[[ ]]]')).toBe(true);
    });

    it('Rejects non-strings and null/undefined', () => {
      expect(isTemplate(123)).toBe(false);
      expect(isTemplate({})).toBe(false);
      expect(isTemplate([])).toBe(false);
      expect(isTemplate(null)).toBe(false);
      expect(isTemplate(undefined)).toBe(false);
    });

    it('Rejects improperly formatted templates', () => {
      expect(isTemplate('[[[ missing end')).toBe(false);
      expect(isTemplate('missing start ]]]')).toBe(false);
    });
  });

  describe('cleanTemplate', () => {
    it('Removes delimiters and trims whitespace for single-line templates', () => {
      expect(cleanTemplate('[[[ return states["light.kitchen"].state ]]]')).toBe('return states["light.kitchen"].state');
    });

    it('Removes delimiters and trims whitespace for multi-line templates', () => {
      const template = `
        [[[
          return states["light.kitchen"].state
        ]]]
      `;
      expect(cleanTemplate(template)).toBe('return states["light.kitchen"].state');
    });

    it('Returns null for invalid templates', () => {
      expect(cleanTemplate('Not a template')).toBe(null);
      expect(cleanTemplate('[[[ Not properly closed')).toBe(null);
      expect(cleanTemplate('Not properly opened ]]]')).toBe(null);
    });
  });

  describe('wrapTemplate', () => {
    it('Wraps raw strings in template delimiters', () => {
      const raw = 'states["light.kitchen"].state';
      expect(wrapTemplate(raw)).toBe('[[[states["light.kitchen"].state]]]');
    });

    it('Does not double-wrap an already wrapped template', () => {
      const wrapped = '[[[ states["light.kitchen"].state ]]]';
      expect(wrapTemplate(wrapped)).toBe(wrapped);
    });

    it('Handles empty string correctly', () => {
      expect(wrapTemplate('')).toBe('[[[]]]');
    });
  });

  describe('processTemplate', () => {
    it('Evaluates templates returning arrays of objects dynamically', () => {
      const template = `
        [[[
          return Object.values(hass.areas).map(area => ({
            label: area.name,
            url: "/d-bubble/home#" + area.area_id,
            icon: area.icon
          }));
        ]]]
      `;

      const result = processTemplate<RouteItem[]>(mockHass, mockNavbar, template);
      expect(result).toEqual([
        { label: 'Kitchen', url: '/d-bubble/home#area1', icon: 'mdi:kitchen' },
        { label: 'Living Room', url: '/d-bubble/home#area2', icon: 'mdi:sofa' },
      ]);
    });

    it('Evaluates templates returning boolean values correctly', () => {
      const template = `
        [[[
          return states["light.kitchen"].state === 'on';
        ]]]
      `;

      const result = processTemplate<boolean>(mockHass, mockNavbar, template);
      expect(result).toBe(true);
    });

    it('Evaluates templates returning string values', () => {
      const template = `
        [[[
          return "Hello, " + user.name;
        ]]]
      `;

      const result = processTemplate<string>(mockHass, mockNavbar, template);
      expect(result).toBe('Hello, User');
    });

    it('Throws TemplateError for templates without explicit return', () => {
      const template = `
        [[[
          states["light.kitchen"].state === 'on';
        ]]]
      `;

      expect(() => processTemplate<boolean>(mockHass, mockNavbar, template))
        .toThrowError(TemplateError);
    });

    it('Throws TemplateError for completely invalid templates', () => {
      expect(() => processTemplate<string>(mockHass, mockNavbar, 'Not a template'))
        .toThrowError(TemplateError);
    });

    it('Returns original value in safe mode instead of throwing', () => {
      const invalidTemplate = 'Not a template';
      const result = processTemplate<string>(mockHass, mockNavbar, invalidTemplate, { safe: true });

      expect(result).toBe(invalidTemplate);
    });

    it('Handles empty templates gracefully in safe mode', () => {
      const emptyTemplate = '[[[ ]]]';
      const result = processTemplate<string>(mockHass, mockNavbar, emptyTemplate, { safe: true });

      expect(result).toBe(emptyTemplate);
    });

    it('Caches compiled template functions to improve performance', () => {
      const template = '[[[ return states["light.kitchen"].state ]]]';

      // First call compiles and caches
      const first = processTemplate<string>(mockHass, mockNavbar, template);
      expect(first).toBe('on');

      // Second call should use cache, result should be identical
      const second = processTemplate<string>(mockHass, mockNavbar, template);
      expect(second).toBe('on');
    });
  });
});
