import { afterEach, describe, expect, it, vi } from 'vitest';

import { executeAction } from '@/lib/action-handler';
import type { NavbarCard } from '@/navbar-card';
import { NavbarCustomActions } from '@/types';

type HaRootWithQuickBar = HTMLElement & {
  _showQuickBar?: ReturnType<typeof vi.fn>;
};

const createContext = () => ({ config: {} }) as unknown as NavbarCard;

const mountHaRoot = (showQuickBar?: ReturnType<typeof vi.fn>) => {
  const haRoot = document.createElement('home-assistant') as HaRootWithQuickBar;
  if (showQuickBar) {
    haRoot._showQuickBar = showQuickBar;
  }
  document.body.appendChild(haRoot);
  return haRoot;
};

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

describe('executeAction — quickbar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector('home-assistant')?.remove();
  });

  it('calls _showQuickBar with the mapped mode on HA 2026.6+', () => {
    const showQuickBar = vi.fn();
    mountHaRoot(showQuickBar);

    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
    runQuickbar('entities');

    expect(showQuickBar).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).not.toHaveBeenCalled();

    const [event, mode] = showQuickBar.mock.calls[0];
    expect(mode).toBe('entity');
    expect(event.composedPath()).toContain(document.body);
    expect(event.defaultPrevented).toBe(false);
    expect(typeof event.preventDefault).toBe('function');
  });

  it('maps every configured mode to its HA quickbar section', () => {
    const showQuickBar = vi.fn();
    mountHaRoot(showQuickBar);

    runQuickbar('devices');
    runQuickbar('commands');
    runQuickbar();

    expect(showQuickBar.mock.calls.map(call => call[1])).toEqual([
      'device',
      'command',
      undefined,
    ]);
  });

  it('falls back to a synthetic keyboard shortcut when _showQuickBar is absent', () => {
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    runQuickbar('entities');

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0] as KeyboardEvent;
    expect(event.type).toBe('keydown');
    expect(event.key).toBe('e');
  });
});
