type RGB = {
  r: number;
  g: number;
  b: number;
};

type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type HEX = string;

type HEX_ALPHA = string;

const hexToDecimal = (hex: string) => parseInt(hex, 16);

const decimalToHex = (decimal: number) => decimal.toString(16).padStart(2, '0');

const isValidInt = (value: string) => {
  try {
    const parsedValue = parseInt(value);
    if (isNaN(parsedValue)) return false;
  } catch {
    return false;
  }
  return true;
};

const hue2rgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

const complementaryRGBColor = (r: number, g: number, b: number) => {
  if (Math.max(r, g, b) == Math.min(r, g, b)) {
    return { r: 255 - r, g: 255 - g, b: 255 - b };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ((r /= 255), (g /= 255), (b /= 255));
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = Math.round(h * 60 + 180) % 360;
    h /= 360;

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
};

/*****************************************
 ************** Color class **************
 *****************************************/
export class Color {
  private static colorCache = new Map<string, Color>();

  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 255;

  constructor(data: string | number[] | Color) {
    if (data instanceof Color) {
      this.r = data.r;
      this.g = data.g;
      this.b = data.b;
      this.a = data.a;
    } else if (typeof data == 'string') {
      if (data.startsWith('#')) {
        this._parseHexString(data);
      } else if (data.startsWith('rgb(')) {
        this._parseRGBString(data);
      } else if (data.startsWith('rgba(')) {
        this._parseRGBAString(data);
      } else if (isValidInt(data)) {
        this._parseHexString(`#${data}`);
      } else {
        try {
          this._readColorFromDOM(data);
        } catch {
          throw Error(`Format not supported for color string: "${data}"`);
        }
      }
    } else if (Array.isArray(data)) {
      this._parseColorArray(data);
    } else {
      throw Error(`Format not supported for color: "${typeof data}"`);
    }
  }

  /**
   * Get or create a Color instance, using cache for performance
   */
  static from(color: string): Color {
    const normalizedColor = color.toLowerCase().trim();
    if (!this.colorCache.has(normalizedColor)) {
      this.colorCache.set(normalizedColor, new Color(normalizedColor));
    }
    return this.colorCache.get(normalizedColor)!;
  }

  ////////////////////////////
  // INTERNAL PARSING FUNCTIONS
  ////////////////////////////

  _readColorFromDOM(color: string) {
    const d = document.createElement('div');
    d.style.color = color;
    document.body.appendChild(d);
    const parsedColor = window.getComputedStyle(d).color;
    this._parseRGBString(parsedColor);
  }

  _parseColorArray(data: unknown[]) {
    const colorArray = data.map(x => parseInt(x));
    if (colorArray.length < 3) {
      throw Error(
        `Invalid array format color string: "${data}"\nSupported formats: [r,g,b] | [r,g,b,a]`,
      );
    }
    this.r = colorArray[0];
    this.g = colorArray[1];
    this.b = colorArray[2];
    this.a = colorArray.at(3) ?? this.a;
  }

  _parseRGBString(data: string) {
    const colorString = data.replace('rgb(', '').replace(')', '');
    const colorComponents = colorString.split(',');
    if (data.indexOf('rgb(') == -1 || colorComponents.length != 3) {
      throw Error(`Invalid 'rgb(r,g,b)' format for color string: "${data}"`);
    }
    this.r = parseInt(colorComponents[0]);
    this.g = parseInt(colorComponents[1]);
    this.b = parseInt(colorComponents[2]);
  }

  _parseRGBAString(data: string) {
    const colorString = data.replace('rgba(', '').replace(')', '');
    const colorComponents = colorString.split(',');
    if (data.indexOf('rgba(') == -1 || colorComponents.length != 4) {
      throw Error(`Invalid 'rgba(r,g,b,a)' format for color string: "${data}"`);
    }
    this.r = parseInt(colorComponents[0]);
    this.g = parseInt(colorComponents[1]);
    this.b = parseInt(colorComponents[2]);
    this.a = parseInt(colorComponents[3]);
  }

  _parseHexString(data: string) {
    const colorString = data.replace('#', '');

    switch (colorString.length) {
      case 3:
        this.r = hexToDecimal(
          colorString.slice(0, 1) + colorString.slice(0, 1),
        );
        this.g = hexToDecimal(
          colorString.slice(1, 2) + colorString.slice(1, 2),
        );
        this.b = hexToDecimal(
          colorString.slice(2, 3) + colorString.slice(2, 3),
        );
        break;
      case 6:
        this.r = hexToDecimal(colorString.slice(0, 2));
        this.g = hexToDecimal(colorString.slice(2, 4));
        this.b = hexToDecimal(colorString.slice(4, 6));
        break;
      case 8:
        this.r = hexToDecimal(colorString.slice(0, 2));
        this.g = hexToDecimal(colorString.slice(2, 4));
        this.b = hexToDecimal(colorString.slice(4, 6));
        this.a = hexToDecimal(colorString.slice(6, 8));
        break;
      default:
        throw Error(`Invalid hex format for color string: "${data}"`);
    }
  }

  ////////////////////////////
  // COLOR TRANSFORMATIONS
  ////////////////////////////

  /**
   * Changes the opacity value of this color
   *
   * @param opacity Opacity value [0,1]
   * @returns A new `Color` instance with the adjusted opacity.
   */
  opacity(opacity: number): Color {
    this.a = Math.max(0, Math.min(opacity * 255, 255));
    return this;
  }

  /**
   * Creates a new complimentary color based on this instance
   *
   * @returns A new `Color` instance with complementary value.
   */
  complementary(): Color {
    const { r, g, b } = complementaryRGBColor(this.r, this.g, this.b);
    return new Color([r, g, b, this.a]);
  }

  /**
   * Adjusts the color brightness by a percentage to create a shaded variant.
   *
   * @param percent Percentage to adjust the shade. Positive values lighten the color, negative values darken it.
   * @returns A new `Color` instance with the adjusted shade.
   */
  shade(percent: number): Color {
    let R = (this.r * (100 + percent)) / 100;
    let G = (this.g * (100 + percent)) / 100;
    let B = (this.b * (100 + percent)) / 100;

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const brightness = Math.round((R * 299 + G * 587 + B * 114) / 1000);

    if (brightness == 0) return this.complementary();
    if (brightness < 80 && percent < 100) return this.shade(percent + 50);

    return new Color([R, G, B]);
  }

  /**
   * Computes a contrasting color (either black or white) based on the perceived brightness of this color.
   *
   * @returns A new `Color` instance representing the contrasting color.
   */
  contrastingColor(): Color {
    return new Color(this.luma() >= 165 ? '#000' : '#fff');
  }

  ////////////////////////////
  // DATA ACCESSORS
  ////////////////////////////
  /**
   * Calculates the luma (perceived brightness) of the color.
   * Uses the Rec. 709 formula to account for human eye sensitivity to different colors.
   *
   * @returns The luma value as a number ranging from 0 to 255.
   */
  luma(): number {
    return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b; // SMPTE C, Rec. 709 weightings
  }

  ////////////////////////////
  // OUTPUT FORMATS
  ////////////////////////////

  /**
   * Converts the color to an RGB format.
   *
   * @returns An object containing the red, green, and blue components of the color.
   */
  rgb(): RGB {
    return { r: this.r, g: this.g, b: this.b };
  }

  /**
   * Converts the color to an RGBA format.
   *
   * @returns An object containing the red, green, blue, and alpha (opacity) components of the color.
   */
  rgba(): RGBA {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }

  /**
   * Converts the color to a hexadecimal (hex) string format.
   *
   * @returns A hex string representing the color in RGB format (e.g., `#RRGGBB`).
   */
  hex(): HEX {
    return `#${decimalToHex(this.r)}${decimalToHex(this.g)}${decimalToHex(this.b)}`;
  }

  /**
   * Converts the color to a hexadecimal (hex) string format including alpha (opacity) value.
   *
   * @returns A hex string representing the color in RGBA format (e.g., `#AARRGGBB`).
   */
  hexa(): HEX_ALPHA {
    return `#${decimalToHex(this.a)}${decimalToHex(this.r)}${decimalToHex(this.g)}${decimalToHex(this.b)}`;
  }

  /**
   * Converts the color to an array format.
   *
   * @returns An array containing the red, green, blue, and alpha (opacity) components of the color.
   */
  array(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }
}
