import '@testing-library/jest-dom/vitest';

/**
 * jsdom has no matchMedia. Stub one that mirrors window.innerWidth for
 * min-width queries, and notifies listeners on resize so existing tests keep
 * working without a production resize fallback.
 */
type MqlListener = (event: MediaQueryListEvent) => void;

type StubMql = {
  listeners: Set<MqlListener>;
  media: string;
  matches: boolean;
};

const activeQueries = new Set<StubMql>();

const minWidthFromMedia = (media: string): number | null => {
  const match = /min-width:\s*(\d+)px/.exec(media);
  return match ? Number(match[1]) : null;
};

const matchesMedia = (media: string): boolean => {
  const minWidth = minWidthFromMedia(media);
  if (minWidth == null) return false;
  return (window.innerWidth || 0) >= minWidth;
};

window.matchMedia = (media: string): MediaQueryList => {
  const stub: StubMql = {
    listeners: new Set(),
    matches: matchesMedia(media),
    media,
  };
  activeQueries.add(stub);

  return {
    addEventListener: (_type: string, listener: EventListener) => {
      stub.listeners.add(listener as MqlListener);
    },
    addListener: () => {},
    dispatchEvent: () => false,
    get matches() {
      return stub.matches;
    },
    media,
    onchange: null,
    removeEventListener: (_type: string, listener: EventListener) => {
      stub.listeners.delete(listener as MqlListener);
      if (stub.listeners.size === 0) activeQueries.delete(stub);
    },
    removeListener: () => {},
  } as MediaQueryList;
};

window.addEventListener('resize', () => {
  for (const stub of activeQueries) {
    const next = matchesMedia(stub.media);
    if (next === stub.matches) continue;
    stub.matches = next;
    const event = { matches: next, media: stub.media } as MediaQueryListEvent;
    for (const listener of stub.listeners) listener(event);
  }
});
