import type { HomeAssistant } from 'custom-card-helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCard } from '@/navbar-card';
import type { RouteItem } from '@/types/config';
import {
  cleanTemplate,
  isTemplate,
  processTemplate,
  wrapTemplate,
} from '@/utils';

describe('Template utilities', () => {
  let mockHass: HomeAssistant;
  let mockNavbar: NavbarCard;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHass = {
      areas: {
        area1: { area_id: 'area1', icon: 'mdi:kitchen', name: 'Kitchen' },
        area2: { area_id: 'area2', icon: 'mdi:sofa', name: 'Living Room' },
      },
      auth: {
        data: {
          access_token: '',
          expires_in: 0,
          refresh_token: '',
          token_type: '',
        },
      },
      config: {},
      panels: {},
      selectedTheme: null,
      services: {},
      states: {
        'light.kitchen': {
          attributes: {},
          context: {},
          entity_id: 'light.kitchen',
          last_changed: '',
          last_updated: '',
          state: 'on',
        },
        'light.living_room': {
          attributes: {},
          context: {},
          entity_id: 'light.living_room',
          last_changed: '',
          last_updated: '',
          state: 'off',
        },
        'sensor.temperature': {
          attributes: {},
          context: {},
          entity_id: 'sensor.temperature',
          last_changed: '',
          last_updated: '',
          state: '22.5',
        },
      },
      themes: {},
      user: {
        credentials: [],
        id: 'user1',
        is_admin: true,
        is_owner: true,
        mfa_modules: [],
        name: 'User',
      },
    } as unknown as HomeAssistant;

    mockNavbar = { isDesktop: true } as NavbarCard;
  });

  describe('isTemplate', () => {
    it('Correctly identifies valid JSTemplates', () => {
      expect(isTemplate('[[[ return states["light.kitchen"].state ]]]')).toBe(
        true,
      );
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
      expect(
        cleanTemplate('[[[ return states["light.kitchen"].state ]]]'),
      ).toBe('return states["light.kitchen"].state');
    });

    it('Removes delimiters and trims whitespace for multi-line templates', () => {
      const template = `
        [[[
          return states["light.kitchen"].state
        ]]]
      `;
      expect(cleanTemplate(template)).toBe(
        'return states["light.kitchen"].state',
      );
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

      const result = processTemplate<RouteItem[]>(
        mockHass,
        mockNavbar,
        template,
      );
      expect(result).toEqual([
        { icon: 'mdi:kitchen', label: 'Kitchen', url: '/d-bubble/home#area1' },
        { icon: 'mdi:sofa', label: 'Living Room', url: '/d-bubble/home#area2' },
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

    it('Returns original value for templates without explicit return', () => {
      const template = `
        [[[
          states["light.kitchen"].state === 'on';
        ]]]
      `;

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = processTemplate<boolean>(mockHass, mockNavbar, template);

      expect(result).toBe(template);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[navbar-card] Template did not return a value',
        ),
      );
    });

    it('Returns original value as template is invalid', () => {
      const invalidTemplate = 'Not a template';
      const result = processTemplate<string>(
        mockHass,
        mockNavbar,
        invalidTemplate,
      );

      expect(result).toBe(invalidTemplate);
    });

    it('Handles empty templates gracefully', () => {
      const emptyTemplate = '[[[ ]]]';
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = processTemplate<string>(
        mockHass,
        mockNavbar,
        emptyTemplate,
      );

      expect(result).toBe(emptyTemplate);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[navbar-card] Template did not return a value',
        ),
      );
    });

    it('Caches compiled template functions to improve performance', () => {
      const template = '[[[ return states["light.kitchen"].state ]]]';

      // First call
      const start1 = performance.now();
      const first = processTemplate<string>(mockHass, mockNavbar, template);
      const duration1 = performance.now() - start1;
      expect(first).toBe('on');

      // Second call (cached)
      const start2 = performance.now();
      const second = processTemplate<string>(mockHass, mockNavbar, template);
      const duration2 = performance.now() - start2;
      expect(second).toBe('on');

      // The second call should be faster due to caching
      expect(duration2).toBeLessThan(duration1);
    });
  });
});
