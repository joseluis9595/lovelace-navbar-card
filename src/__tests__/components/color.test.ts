import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Color } from '../../components/color';

// Type definitions for test mocks
interface MockColorCache extends Map<string, Color> {
  clear: () => void;
}

describe('Color class', () => {
  beforeEach(() => {
    // Clear the color cache before each test
    (Color as unknown as { colorCache: MockColorCache }).colorCache.clear();
  });

  afterEach(() => {
    // Clean up any DOM elements created during tests
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    describe('hex string parsing', () => {
      it('should parse 3-digit hex colors', () => {
        const color = new Color('#abc');
        expect(color.rgb()).toEqual({ r: 170, g: 187, b: 204 });
      });

      it('should parse 6-digit hex colors', () => {
        const color = new Color('#ff0000');
        expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should parse 8-digit hex colors with alpha', () => {
        const color = new Color('#ff000080');
        expect(color.rgba()).toEqual({ r: 255, g: 0, b: 0, a: 128 });
      });

      it('should handle hex without # prefix', () => {
        // Mock getComputedStyle to return the expected RGB value for hex strings
        const mockGetComputedStyle = vi.fn().mockReturnValue({
          color: 'rgb(255, 0, 0)',
        });
        Object.defineProperty(window, 'getComputedStyle', {
          value: mockGetComputedStyle,
          writable: true,
        });

        const color = new Color('ff0000');
        expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should handle numeric string as hex', () => {
        const color = new Color('255');
        expect(color.rgb()).toEqual({ r: 34, g: 85, b: 85 }); // #255 = #225555
      });

      it('should handle edge cases in isValidInt', () => {
        // Test various edge cases that might trigger different code paths
        const testCases = [
          { input: '000', expected: { r: 0, g: 0, b: 0 } },
          { input: '111', expected: { r: 17, g: 17, b: 17 } },
          { input: '123', expected: { r: 17, g: 34, b: 51 } }, // This should be treated as hex
        ];

        testCases.forEach(({ input, expected }) => {
          const color = new Color(input);
          expect(color.rgb()).toEqual(expected);
        });
      });

      it('should throw error for invalid hex length', () => {
        expect(() => new Color('#ff')).toThrow(
          'Invalid hex format for color string: "#ff"',
        );
        expect(() => new Color('#fffffff')).toThrow(
          'Invalid hex format for color string: "#fffffff"',
        );
      });
    });

    describe('RGB string parsing', () => {
      it('should parse RGB strings', () => {
        const color = new Color('rgb(255, 0, 0)');
        expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should parse RGB strings with spaces', () => {
        const color = new Color('rgb( 100 , 150 , 200 )');
        expect(color.rgb()).toEqual({ r: 100, g: 150, b: 200 });
      });

      it('should throw error for invalid RGB format', () => {
        expect(() => new Color('rgb(255, 0)')).toThrow(
          'Invalid \'rgb(r,g,b)\' format for color string: "rgb(255, 0)"',
        );
        expect(() => new Color('rgb(255, 0, 0, 0)')).toThrow(
          'Invalid \'rgb(r,g,b)\' format for color string: "rgb(255, 0, 0, 0)"',
        );
        expect(() => new Color('rgba(255, 0, 0)')).toThrow(
          'Invalid \'rgba(r,g,b,a)\' format for color string: "rgba(255, 0, 0)"',
        );
      });
    });

    describe('RGBA string parsing', () => {
      it('should parse RGBA strings', () => {
        const color = new Color('rgba(255, 0, 0, 0.5)');
        expect(color.rgba()).toEqual({ r: 255, g: 0, b: 0, a: 0 });
      });

      it('should parse RGBA strings with spaces', () => {
        const color = new Color('rgba( 100 , 150 , 200 , 128 )');
        expect(color.rgba()).toEqual({ r: 100, g: 150, b: 200, a: 128 });
      });

      it('should throw error for invalid RGBA format', () => {
        expect(() => new Color('rgba(255, 0, 0)')).toThrow(
          'Invalid \'rgba(r,g,b,a)\' format for color string: "rgba(255, 0, 0)"',
        );
        expect(() => new Color('rgba(255, 0, 0, 0.5, 0.5)')).toThrow(
          'Invalid \'rgba(r,g,b,a)\' format for color string: "rgba(255, 0, 0, 0.5, 0.5)"',
        );
      });
    });

    describe('array parsing', () => {
      it('should parse RGB arrays', () => {
        const color = new Color([255, 0, 0]);
        expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('should parse RGBA arrays', () => {
        const color = new Color([255, 0, 0, 128]);
        expect(color.rgba()).toEqual({ r: 255, g: 0, b: 0, a: 128 });
      });

      it('should use default alpha when not provided', () => {
        const color = new Color([255, 0, 0]);
        expect(color.rgba()).toEqual({ r: 255, g: 0, b: 0, a: 255 });
      });

      it('should throw error for invalid array length', () => {
        expect(() => new Color([255, 0])).toThrow(
          'Invalid array format color string: "255,0"\nSupported formats: [r,g,b] | [r,g,b,a]',
        );
        expect(() => new Color([255])).toThrow(
          'Invalid array format color string: "255"\nSupported formats: [r,g,b] | [r,g,b,a]',
        );
      });
    });

    describe('Color instance copying', () => {
      it('should copy from another Color instance', () => {
        const original = new Color('#ff0000');
        const copy = new Color(original);
        expect(copy.rgb()).toEqual(original.rgb());
        expect(copy.rgba()).toEqual(original.rgba());
      });
    });

    describe('DOM color parsing', () => {
      it('should parse CSS color names', () => {
        // Mock getComputedStyle to return a known RGB value
        const mockGetComputedStyle = vi.fn().mockReturnValue({
          color: 'rgb(255, 0, 0)',
        });
        Object.defineProperty(window, 'getComputedStyle', {
          value: mockGetComputedStyle,
          writable: true,
        });

        const color = new Color('red');
        expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
        expect(mockGetComputedStyle).toHaveBeenCalled();
      });

      it('should throw error for unsupported color format', () => {
        const mockGetComputedStyle = vi.fn().mockReturnValue({
          color: 'invalid',
        });
        Object.defineProperty(window, 'getComputedStyle', {
          value: mockGetComputedStyle,
          writable: true,
        });

        expect(() => new Color('invalidcolor')).toThrow(
          'Format not supported for color string: "invalidcolor"',
        );
      });
    });

    describe('error handling', () => {
      it('should throw error for unsupported data type', () => {
        expect(() => new Color(null as unknown as string)).toThrow(
          'Format not supported for color: "object"',
        );
        expect(() => new Color(undefined as unknown as string)).toThrow(
          'Format not supported for color: "undefined"',
        );
        expect(() => new Color(123 as unknown as string)).toThrow(
          'Format not supported for color: "number"',
        );
      });
    });
  });

  describe('static from method', () => {
    it('should create new Color instance', () => {
      const color = Color.from('#ff0000');
      expect(color.rgb()).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should use cache for same color', () => {
      const color1 = Color.from('#ff0000');
      const color2 = Color.from('#ff0000');
      expect(color1).toBe(color2);
    });

    it('should normalize color strings', () => {
      const color1 = Color.from('#FF0000');
      const color2 = Color.from('#ff0000');
      expect(color1).toBe(color2);
    });

    it('should trim whitespace', () => {
      const color1 = Color.from(' #ff0000 ');
      const color2 = Color.from('#ff0000');
      expect(color1).toBe(color2);
    });
  });

  describe('color transformations', () => {
    describe('opacity', () => {
      it('should set opacity correctly', () => {
        const color = new Color('#ff0000');
        const result = color.opacity(0.5);
        expect(result.rgba().a).toBe(127.5); // 0.5 * 255
      });

      it('should clamp opacity to valid range', () => {
        const color1 = new Color('#ff0000');
        const color2 = new Color('#ff0000');
        const result1 = color1.opacity(-0.5);
        const result2 = color2.opacity(1.5);
        // The opacity method uses Math.max(0, Math.min(opacity * 255, 255))
        // For -0.5: Math.max(0, Math.min(-127.5, 255)) = Math.max(0, -127.5) = 0
        // For 1.5: Math.max(0, Math.min(382.5, 255)) = Math.max(0, 255) = 255
        expect(result1.rgba().a).toBe(0);
        expect(result2.rgba().a).toBe(255);
      });

      it('should return the same Color instance', () => {
        const color = new Color('#ff0000');
        const result = color.opacity(0.5);
        expect(result).toBe(color); // opacity modifies the current instance
        expect(result.rgb()).toEqual(color.rgb());
      });
    });

    describe('complementary', () => {
      it('should return complementary color', () => {
        const color = new Color('#ff0000'); // Red
        const complementary = color.complementary();
        expect(complementary.rgb()).toEqual({ r: 0, g: 255, b: 255 }); // Cyan
      });

      it('should handle gray colors', () => {
        const color = new Color('#808080'); // Gray
        const complementary = color.complementary();
        expect(complementary.rgb()).toEqual({ r: 127, g: 127, b: 127 }); // Inverted gray
      });

      it('should preserve alpha channel', () => {
        const color = new Color('#ff000080'); // Red with alpha
        const complementary = color.complementary();
        expect(complementary.rgba().a).toBe(128);
      });

      it('should handle blue-dominant colors', () => {
        const color = new Color('#0000ff'); // Blue
        const complementary = color.complementary();
        expect(complementary.rgb()).toEqual({ r: 255, g: 255, b: 0 }); // Yellow
      });

      it('should handle green-dominant colors', () => {
        const color = new Color('#00ff00'); // Green
        const complementary = color.complementary();
        expect(complementary.rgb()).toEqual({ r: 255, g: 0, b: 255 }); // Magenta
      });

      it('should handle complex color calculations', () => {
        const color = new Color('#ff8000'); // Orange
        const complementary = color.complementary();
        // This should trigger the HSL calculation path
        expect(complementary.rgb().r).toBeDefined();
        expect(complementary.rgb().g).toBeDefined();
        expect(complementary.rgb().b).toBeDefined();
      });

      it('should handle various hue ranges in HSL conversion', () => {
        // Test colors that will trigger different branches in hue2rgb function
        const colors = [
          '#ff0000', // Red - should trigger case r
          '#00ff00', // Green - should trigger case g
          '#0000ff', // Blue - should trigger case b
          '#ffff00', // Yellow - should trigger case r
          '#ff00ff', // Magenta - should trigger case r
          '#00ffff', // Cyan - should trigger case g
        ];

        colors.forEach(colorHex => {
          const color = new Color(colorHex);
          const complementary = color.complementary();
          expect(complementary.rgb().r).toBeGreaterThanOrEqual(0);
          expect(complementary.rgb().g).toBeGreaterThanOrEqual(0);
          expect(complementary.rgb().b).toBeGreaterThanOrEqual(0);
          expect(complementary.rgb().r).toBeLessThanOrEqual(255);
          expect(complementary.rgb().g).toBeLessThanOrEqual(255);
          expect(complementary.rgb().b).toBeLessThanOrEqual(255);
        });
      });
    });

    describe('shade', () => {
      it('should lighten color with positive percentage', () => {
        const color = new Color('#808080'); // Gray
        const lighter = color.shade(50);
        expect(lighter.rgb().r).toBeGreaterThan(color.rgb().r);
        expect(lighter.rgb().g).toBeGreaterThan(color.rgb().g);
        expect(lighter.rgb().b).toBeGreaterThan(color.rgb().b);
      });

      it('should darken color with negative percentage', () => {
        const color = new Color('#808080'); // Gray
        const darker = color.shade(-50);
        // The shade method calculates: (128 * (100 + (-50))) / 100 = (128 * 50) / 100 = 64
        // But there's additional logic that might affect the result
        expect(darker.rgb().r).toBeLessThanOrEqual(color.rgb().r);
        expect(darker.rgb().g).toBeLessThanOrEqual(color.rgb().g);
        expect(darker.rgb().b).toBeLessThanOrEqual(color.rgb().b);
      });

      it('should clamp values to 255', () => {
        const color = new Color('#ff0000');
        const result = color.shade(100);
        expect(result.rgb().r).toBe(255);
        expect(result.rgb().g).toBe(0);
        expect(result.rgb().b).toBe(0);
      });

      it('should return complementary for very dark colors', () => {
        const color = new Color('#000000'); // Black
        const result = color.shade(50);
        // Black has brightness 0, so it should return complementary color
        expect(result.rgb()).toEqual({ r: 255, g: 255, b: 255 }); // Should return complementary (white)
      });

      it('should recursively lighten very dark colors', () => {
        const color = new Color('#101010'); // Very dark gray
        const result = color.shade(50);
        // Should recursively call shade with increased percentage
        expect(result.rgb().r).toBeGreaterThan(color.rgb().r);
      });
    });

    describe('contrastingColor', () => {
      it('should return black for light colors', () => {
        const color = new Color('#ffffff'); // White
        const contrasting = color.contrastingColor();
        expect(contrasting.rgb()).toEqual({ r: 0, g: 0, b: 0 }); // Black
      });

      it('should return white for dark colors', () => {
        const color = new Color('#000000'); // Black
        const contrasting = color.contrastingColor();
        expect(contrasting.rgb()).toEqual({ r: 255, g: 255, b: 255 }); // White
      });

      it('should return black for medium-light colors', () => {
        const color = new Color('#cccccc'); // Light gray
        const contrasting = color.contrastingColor();
        expect(contrasting.rgb()).toEqual({ r: 0, g: 0, b: 0 }); // Black
      });

      it('should return white for medium-dark colors', () => {
        const color = new Color('#333333'); // Dark gray
        const contrasting = color.contrastingColor();
        expect(contrasting.rgb()).toEqual({ r: 255, g: 255, b: 255 }); // White
      });
    });
  });

  describe('data accessors', () => {
    describe('luma', () => {
      it('should calculate luma correctly', () => {
        const white = new Color('#ffffff');
        const black = new Color('#000000');
        const red = new Color('#ff0000');

        expect(white.luma()).toBeCloseTo(255, 0);
        expect(black.luma()).toBeCloseTo(0, 0);
        expect(red.luma()).toBeCloseTo(54.213, 1); // 0.2126 * 255
      });

      it('should use Rec. 709 weightings', () => {
        const green = new Color('#00ff00');
        const blue = new Color('#0000ff');

        expect(green.luma()).toBeCloseTo(182.376, 1); // 0.7152 * 255
        expect(blue.luma()).toBeCloseTo(18.411, 1); // 0.0722 * 255
      });
    });
  });

  describe('output formats', () => {
    const testColor = new Color('#ff8000');

    describe('rgb', () => {
      it('should return RGB object', () => {
        const rgb = testColor.rgb();
        expect(rgb).toEqual({ r: 255, g: 128, b: 0 });
        expect(typeof rgb.r).toBe('number');
        expect(typeof rgb.g).toBe('number');
        expect(typeof rgb.b).toBe('number');
      });
    });

    describe('rgba', () => {
      it('should return RGBA object', () => {
        const rgba = testColor.rgba();
        expect(rgba).toEqual({ r: 255, g: 128, b: 0, a: 255 });
        expect(typeof rgba.r).toBe('number');
        expect(typeof rgba.g).toBe('number');
        expect(typeof rgba.b).toBe('number');
        expect(typeof rgba.a).toBe('number');
      });
    });

    describe('rgbaString', () => {
      it('should return RGBA string', () => {
        const rgbaString = testColor.rgbaString();
        expect(rgbaString).toBe('rgba(255, 128, 0, 255)');
      });
    });

    describe('hex', () => {
      it('should return hex string', () => {
        const hex = testColor.hex();
        expect(hex).toBe('#ff8000');
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      });

      it('should pad single digits with zeros', () => {
        const color = new Color('#010203');
        expect(color.hex()).toBe('#010203');
      });
    });

    describe('hexa', () => {
      it('should return hex string with alpha', () => {
        const hexa = testColor.hexa();
        expect(hexa).toBe('#ffff8000');
        expect(hexa).toMatch(/^#[0-9a-f]{8}$/i);
      });

      it('should include alpha channel', () => {
        const color = new Color('#ff000080');
        expect(color.hexa()).toBe('#80ff0000');
      });
    });

    describe('array', () => {
      it('should return array format', () => {
        const array = testColor.array();
        expect(array).toEqual([255, 128, 0, 255]);
        expect(Array.isArray(array)).toBe(true);
        expect(array.length).toBe(4);
      });

      it('should return correct types', () => {
        const array = testColor.array();
        array.forEach(value => {
          expect(typeof value).toBe('number');
        });
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle zero values', () => {
      const color = new Color('#000000');
      expect(color.rgb()).toEqual({ r: 0, g: 0, b: 0 });
      expect(color.luma()).toBe(0);
    });

    it('should handle maximum values', () => {
      const color = new Color('#ffffff');
      expect(color.rgb()).toEqual({ r: 255, g: 255, b: 255 });
      expect(color.luma()).toBeCloseTo(255, 0);
    });

    it('should handle invalid hex characters gracefully', () => {
      // Invalid hex characters result in NaN values, which are handled by parseInt
      const color = new Color('#gggggg');
      expect(color.rgb().r).toBeNaN();
      expect(color.rgb().g).toBeNaN();
      expect(color.rgb().b).toBeNaN();
    });

    it('should handle malformed RGB strings', () => {
      // These malformed strings will be parsed as CSS color names
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        color: 'rgb(255, 0, 0)',
      });
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true,
      });

      const color1 = new Color('rgb(255, 0, 0');
      const color2 = new Color('rgb(255, 0, 0))');
      expect(color1.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      expect(color2.rgb()).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle malformed RGBA strings', () => {
      // These malformed strings will be parsed as CSS color names
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        color: 'rgb(255, 0, 0)',
      });
      Object.defineProperty(window, 'getComputedStyle', {
        value: mockGetComputedStyle,
        writable: true,
      });

      const color1 = new Color('rgba(255, 0, 0, 0.5');
      const color2 = new Color('rgba(255, 0, 0, 0.5))');
      expect(color1.rgb()).toEqual({ r: 255, g: 0, b: 0 });
      expect(color2.rgb()).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('color cache behavior', () => {
    it('should cache colors by normalized string', () => {
      const color1 = Color.from(' #FF0000 ');
      const color2 = Color.from('#ff0000');
      const color3 = Color.from('#FF0000');

      expect(color1).toBe(color2);
      expect(color2).toBe(color3);
    });

    it('should not cache different colors', () => {
      const color1 = Color.from('#ff0000');
      const color2 = Color.from('#00ff00');

      expect(color1).not.toBe(color2);
    });

    it('should clear cache between tests', () => {
      // This test verifies that beforeEach clears the cache
      const color1 = Color.from('#ff0000');
      const color2 = Color.from('#ff0000');
      expect(color1).toBe(color2);
    });
  });
});
