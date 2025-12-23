import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend Vitest's expect method with methods from jest-dom
expect.extend(matchers);
