import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NavbarCard } from '@/navbar-card';
import { NavbarCustomActions } from '@/types';

import { executeAction } from '../../lib/action-handler';

// Minimal NavbarCard stand-in: for the quickbar action, executeAction only reads
// `context.config` (through the haptic helper).
const createContext = () => ({ config: {} }) as unknown as NavbarCard;

const runQuickbar = (mode?: 'entities' | 'devices' | 'commands') => {
  executeAction({
    action: mode
      ? { action: NavbarCustomActions.quickbar, mode }
      : { action: NavbarCustomActions.quickbar },
    actionType: 'tap',
    context: createContext(),
    data: {},
    target: document.createElement('div'),
  });
};

describe('quickbar action', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector('home-assistant')?.remove();
  });

  it('calls the HA quickbar entry point with the mapped mode (HA 2026.6+)', () => {
    const showQuickBar = vi.fn();
    const haRoot = document.createElement('home-assistant') as HTMLElement & {
      _showQuickBar?: unknown;
    };
    haRoot._showQuickBar = showQuickBar;
    document.body.appendChild(haRoot);

    runQuickbar('entities');

    expect(showQuickBar).toHaveBeenCalledTimes(1);
    const [event, mode] = showQuickBar.mock.calls[0];
    expect(mode).toBe('entity');
    // The synthetic event must satisfy HA's `_canShowQuickBar` guard, which reads
    // `composedPath()[0].tagName` and `defaultPrevented`.
    expect(event.composedPath()).toContain(document.body);
    expect(event.defaultPrevented).toBe(false);
    expect(typeof event.preventDefault).toBe('function');
  });

  it('maps every configured mode to its HA quickbar section', () => {
    const showQuickBar = vi.fn();
    const haRoot = document.createElement('home-assistant') as HTMLElement & {
      _showQuickBar?: unknown;
    };
    haRoot._showQuickBar = showQuickBar;
    document.body.appendChild(haRoot);

    runQuickbar('devices');
    runQuickbar('commands');
    runQuickbar(); // no mode -> default quickbar

    expect(showQuickBar.mock.calls.map(call => call[1])).toEqual([
      'device',
      'command',
      undefined,
    ]);
  });

  it('falls back to a synthetic keyboard shortcut when the entry point is absent (older HA)', () => {
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    runQuickbar('entities');

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as KeyboardEvent;
    expect(event.type).toBe('keydown');
    expect(event.key).toBe('e');
  });
});
