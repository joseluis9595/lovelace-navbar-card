/// <reference types="bun" />
/**
 * Renders the built card (dist/navbar-card.js) in headless Chrome and saves
 * transparent 2x PNGs of it for the docs. Drives Chrome over the DevTools
 * protocol directly, so no extra dependencies are needed.
 *
 * Usage:
 *   bun run docs:screenshots [shot names...]           shots from shots.ts
 *   bun run docs:screenshots shot <config.yaml>        one configuration
 *   bun run docs:screenshots compare <a.yaml> <b.yaml> configurations side by side
 *
 * Options:
 *   -o, --out <file.png>  output for shot/compare (screenshot.png / compare.png)
 *   --phone               render inside the bottom of a mocked phone (mobile)
 *   --theme <name>        light, dark or both (dark is saved as <out>_dark.png)
 *   --force               overwrite images tracked by git
 *   --serve               don't capture, print the page URLs to open in a browser
 *
 * Set CHROME_PATH to use a Chrome/Chromium other than the macOS default.
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { type Annotation, type Panel, type Shot, shots } from './shots';
import {
  DARK_STANDALONE_CARD_BACKGROUND,
  type ThemeName,
  themes,
} from './themes';

const ROOT = resolve(import.meta.dir, '../..');
const CARD_JS = join(ROOT, 'dist/navbar-card.js');
const MDI_VERSION = '7.4.47';
const CACHE_DIR = join(import.meta.dir, '.cache');
const ICON_CACHE = join(CACHE_DIR, `mdi-${MDI_VERSION}.json`);
/** Icons the card renders itself (media player controls) */
const CARD_ICONS = ['mdi:music', 'mdi:pause', 'mdi:play', 'mdi:skip-next'];
/** Home Assistant's font; fallback fonts change text metrics (e.g. badges) */
const ROBOTO_VERSION = '5.3.0';
const ROBOTO_WEIGHTS = [400, 500, 700];
const SCALE = 2;
const SETTLE_MS = 800;
const POPUP_SETTLE_MS = 1500;
const PADDING = 24;
const PHONE_CROP = 150;
const DESKTOP_VIEWPORT = { height: 600, width: 1000 };
const PHONE_VIEWPORT = { height: 844, width: 390 };

const fail = (message: string): never => {
  console.error(`docs:screenshots: ${message}`);
  process.exit(1);
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// --- Command line -----------------------------------------------------------

const { positionals, values: flags } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      args: Bun.argv.slice(2),
      options: {
        force: { type: 'boolean' },
        out: { short: 'o', type: 'string' },
        phone: { type: 'boolean' },
        serve: { type: 'boolean' },
        theme: { type: 'string' },
      },
    });
  } catch (error) {
    return fail((error as Error).message);
  }
})();

const themeFlag: ThemeName[] | undefined = (() => {
  if (flags.theme === undefined) return undefined;
  if (flags.theme === 'both') return ['light', 'dark'];
  if (flags.theme === 'light' || flags.theme === 'dark') return [flags.theme];
  return fail(`--theme must be light, dark or both (got "${flags.theme}")`);
})();

async function loadPanel(file: string): Promise<Panel> {
  const path = resolve(file);
  if (!existsSync(path)) fail(`config file not found: ${file}`);
  const config = Bun.YAML.parse(await Bun.file(path).text());
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    fail(`${file} is not a navbar-card configuration`);
  }
  return { config: config as Record<string, any> };
}

async function selectShots(): Promise<Shot[]> {
  const [command, ...files] = positionals;
  if (command === 'shot' || command === 'compare') {
    if (command === 'shot' && files.length !== 1) {
      fail('usage: shot <config.yaml> [options]');
    }
    if (command === 'compare' && files.length < 2) {
      fail('usage: compare <a.yaml> <b.yaml> [more.yaml...] [options]');
    }
    return [
      {
        name: command,
        out: resolve(flags.out ?? `${command === 'shot' ? 'screenshot' : 'compare'}.png`),
        panels: await Promise.all(files.map(loadPanel)),
        phone: flags.phone,
        themes: themeFlag,
      },
    ];
  }

  const unknown = positionals.filter(name => !shots.some(s => s.name === name));
  if (unknown.length) {
    fail(
      `unknown shot(s): ${unknown.join(', ')}. Available: ${shots
        .map(s => s.name)
        .join(', ')} (or use "shot" / "compare" with YAML files)`,
    );
  }
  return (
    positionals.length
      ? shots.filter(s => positionals.includes(s.name))
      : shots
  ).map(shot => ({
    ...shot,
    out: join(ROOT, shot.out),
    // --theme narrows the themes a shot defines
    themes: (shot.themes ?? ['light']).filter(t => !themeFlag || themeFlag.includes(t)),
  }));
}

/** Output file per theme, dark is saved next to `out` as `<out>_dark`. */
const outputs = (shot: Shot): [ThemeName, string][] =>
  (shot.themes ?? ['light']).map(theme => {
    if (theme === 'light') return [theme, shot.out];
    const ext = extname(shot.out);
    return [theme, join(dirname(shot.out), `${basename(shot.out, ext)}_dark${ext}`)];
  });

const isTracked = (path: string) =>
  Bun.spawnSync(['git', 'ls-files', '--error-unmatch', path], { cwd: ROOT })
    .exitCode === 0;

const relative = (path: string) =>
  path.startsWith(`${ROOT}/`) ? path.slice(ROOT.length + 1) : path;

const toRender = (await selectShots()).filter(shot => {
  const tracked = outputs(shot)
    .map(([, out]) => out)
    .filter(isTracked);
  if (!flags.force && !flags.serve && tracked.length) {
    console.warn(
      `skip ${shot.name}: ${tracked.map(relative).join(', ')} tracked by git (--force)`,
    );
    return false;
  }
  return true;
});
if (!toRender.length) process.exit(0);

// --- Preconditions ----------------------------------------------------------

const chromePath =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chromePath)) {
  fail(
    `Chrome not found at "${chromePath}". Set CHROME_PATH to a Chrome or Chromium executable.`,
  );
}
if (!existsSync(CARD_JS)) {
  fail(`${CARD_JS} not found, run "bun run build" first.`);
}

// --- MDI icons --------------------------------------------------------------

/** Returns path data for every `mdi:*` icon used by the shots. */
async function loadIcons(list: Shot[]): Promise<Record<string, string>> {
  const cache: Record<string, string> = existsSync(ICON_CACHE)
    ? await Bun.file(ICON_CACHE).json()
    : {};
  const used = new Set<string>([
    ...CARD_ICONS,
    ...(JSON.stringify(list.map(s => s.panels)).match(/mdi:[a-z0-9-]+/g) ?? []),
  ]);
  const missing = [...used].filter(icon => !cache[icon]);
  if (missing.length) {
    console.log(`fetching ${missing.length} icon(s) from @mdi/svg`);
    await Promise.all(
      missing.map(async icon => {
        const url = `https://cdn.jsdelivr.net/npm/@mdi/svg@${MDI_VERSION}/svg/${icon.slice(4)}.svg`;
        const res = await fetch(url);
        if (!res.ok) fail(`could not fetch ${icon} (${res.status} ${url})`);
        const d = (await res.text()).match(/ d="([^"]+)"/)?.[1];
        if (!d) fail(`no path data in ${url}`);
        cache[icon] = d as string;
      }),
    );
    mkdirSync(dirname(ICON_CACHE), { recursive: true });
    await Bun.write(ICON_CACHE, JSON.stringify(cache, null, 2));
  }
  const icons: Record<string, string> = {};
  used.forEach(icon => {
    icons[icon] = cache[icon];
  });
  return icons;
}

const icons = await loadIcons(toRender);

/** Downloads the Roboto weights the card uses, returns their file paths. */
async function loadFonts(): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  await Promise.all(
    ROBOTO_WEIGHTS.map(async weight => {
      const file = join(CACHE_DIR, `roboto-${ROBOTO_VERSION}-${weight}.woff2`);
      if (!existsSync(file)) {
        const url = `https://cdn.jsdelivr.net/npm/@fontsource/roboto@${ROBOTO_VERSION}/files/roboto-latin-${weight}-normal.woff2`;
        console.log(`fetching Roboto ${weight}`);
        const res = await fetch(url);
        if (!res.ok) fail(`could not fetch Roboto (${res.status} ${url})`);
        mkdirSync(CACHE_DIR, { recursive: true });
        await Bun.write(file, await res.arrayBuffer());
      }
      files[`/fonts/roboto-${weight}.woff2`] = file;
    }),
  );
  return files;
}

const fonts = await loadFonts();

// --- Jobs and local server (ES modules don't load from file://) -------------

/** Everything stage.html and frame.html need to render one image. */
type Job = {
  mode: 'card' | 'phone';
  dark: boolean;
  annotations: Annotation[];
  /** CSS background behind the card, null for a transparent image */
  background: string | null;
  fullscreen: boolean;
  theme: Record<string, string>;
  stack: boolean;
  viewport: { width: number; height: number };
  padding: number;
  phoneCrop: number;
  settleMs: number;
  icons: Record<string, string>;
  panels: Panel[];
};

function createJob(shot: Shot, themeName: ThemeName): Job {
  const hasPopup = shot.panels.some(p => p.openPopup != null);
  // Phones, open popups (for their backdrop) and full screens show the dashboard
  const background =
    shot.background ??
    (shot.phone || hasPopup || shot.fullscreen
      ? 'var(--primary-background-color)'
      : null);
  return {
    annotations: shot.annotations ?? [],
    background,
    dark: themeName === 'dark',
    fullscreen: !!shot.fullscreen,
    icons,
    mode: shot.phone ? 'phone' : 'card',
    padding: PADDING,
    panels: shot.panels,
    phoneCrop: shot.phoneCrop ?? PHONE_CROP,
    settleMs: hasPopup ? POPUP_SETTLE_MS : SETTLE_MS,
    stack: !!shot.stack,
    theme: {
      ...themes[themeName],
      // Phones get a gesture bar inset (as the Companion app sets); cards are
      // inset by the padding so cards docked to an edge get even margins
      ...(shot.phone
        ? { '--safe-area-inset-bottom': '24px' }
        : { '--navbar-edge-inset': `${PADDING}px` }),
      ...(themeName === 'dark' && !background
        ? { '--card-background-color': DARK_STANDALONE_CARD_BACKGROUND }
        : {}),
    },
    viewport:
      shot.viewport ?? (shot.phone ? PHONE_VIEWPORT : DESKTOP_VIEWPORT),
  };
}

const jobs = new Map<string, Job>();

const server = Bun.serve({
  fetch(req) {
    const url = new URL(req.url);
    switch (url.pathname) {
      case '/stage.html':
      case '/frame.html':
        return new Response(Bun.file(join(import.meta.dir, url.pathname)));
      case '/navbar-card.js':
        return new Response(Bun.file(CARD_JS), {
          headers: { 'content-type': 'text/javascript' },
        });
      case '/job.json': {
        const job = jobs.get(url.searchParams.get('id') ?? '');
        return job
          ? Response.json(job)
          : new Response('unknown job', { status: 404 });
      }
      default:
        return fonts[url.pathname]
          ? new Response(Bun.file(fonts[url.pathname]), {
              headers: { 'content-type': 'font/woff2' },
            })
          : new Response('not found', { status: 404 });
    }
  },
  hostname: '127.0.0.1',
  port: 0,
});

if (flags.serve) {
  for (const shot of toRender) {
    for (const [themeName] of outputs(shot)) {
      const id = String(jobs.size + 1);
      jobs.set(id, createJob(shot, themeName));
      console.log(`${shot.name} (${themeName}): ${server.url}stage.html?job=${id}`);
    }
  }
  console.log('serving, press Ctrl+C to stop');
  await new Promise(() => {});
}

// --- Chrome -----------------------------------------------------------------

const profileDir = mkdtempSync(join(tmpdir(), 'navbar-card-shots-'));
const chrome = Bun.spawn(
  [
    chromePath,
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    '--hide-scrollbars',
    // Software rendering and a fixed color profile give identical PNGs per run
    '--disable-gpu',
    '--force-color-profile=srgb',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  { stderr: 'ignore', stdout: 'ignore' },
);

const cleanup = () => {
  chrome.kill();
  server.stop(true);
  rmSync(profileDir, { force: true, recursive: true });
};

/** Chrome writes the port it picked to DevToolsActivePort in the profile. */
async function devtoolsPort(): Promise<number> {
  const file = join(profileDir, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    if (existsSync(file)) {
      const port = Number((await Bun.file(file).text()).split('\n')[0]);
      if (port) return port;
    }
    await sleep(100);
  }
  throw new Error('Chrome did not start (no DevToolsActivePort)');
}

type CdpEvent = { method: string; params: any };

/** Minimal Chrome DevTools protocol client for the first page target. */
async function connect(port: number) {
  const targets: any[] = await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json();
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no page target in Chrome');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let lastId = 0;
  const pending = new Map<number, (m: any) => void>();
  const listeners = new Set<(e: CdpEvent) => void>();
  ws.addEventListener('message', e => {
    const m = JSON.parse(String(e.data));
    const resolveFn = m.id ? pending.get(m.id) : undefined;
    if (resolveFn) {
      pending.delete(m.id);
      resolveFn(m);
    } else {
      listeners.forEach(fn => {
        fn(m);
      });
    }
  });

  const send = (method: string, params: object = {}) =>
    new Promise<any>((resolveFn, reject) => {
      const id = ++lastId;
      pending.set(id, m =>
        m.error
          ? reject(new Error(`${method}: ${m.error.message}`))
          : resolveFn(m.result),
      );
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression: string) =>
    (
      await send('Runtime.evaluate', {
        awaitPromise: true,
        expression,
        returnByValue: true,
      })
    ).result.value;

  return { close: () => ws.close(), evaluate, listeners, send };
}

type Cdp = Awaited<ReturnType<typeof connect>>;

async function capture(cdp: Cdp, job: Job, out: string): Promise<void> {
  const logs: string[] = [];
  const onEvent = (m: CdpEvent) => {
    if (m.method === 'Runtime.consoleAPICalled') {
      logs.push(
        `${m.params.type}: ${m.params.args
          .map((a: any) => a.value ?? a.description)
          .join(' ')}`,
      );
    } else if (m.method === 'Runtime.exceptionThrown') {
      const details = m.params.exceptionDetails;
      logs.push(`exception: ${details.exception?.description ?? details.text}`);
    }
  };
  cdp.listeners.add(onEvent);

  const id = String(jobs.size + 1);
  jobs.set(id, job);
  try {
    const loaded = new Promise<void>(r => {
      const onLoad = (m: CdpEvent) => {
        if (m.method !== 'Page.loadEventFired') return;
        cdp.listeners.delete(onLoad);
        r();
      };
      cdp.listeners.add(onLoad);
    });
    await cdp.send('Page.navigate', {
      url: `${server.url}stage.html?job=${id}`,
    });
    await loaded;

    let state: string | null = null;
    for (let i = 0; i < 150 && !state; i++) {
      state = await cdp.evaluate(
        'window.__error ?? (window.__ready ? "ready" : null)',
      );
      if (!state) await sleep(100);
    }
    if (state !== 'ready') throw new Error(state ?? 'stage did not render');

    const rect = await cdp.evaluate(`(() => {
      const r = document.getElementById('stage').getBoundingClientRect();
      return { height: r.height, width: r.width, x: r.x, y: r.y };
    })()`);
    const { data } = await cdp.send('Page.captureScreenshot', {
      captureBeyondViewport: true,
      clip: {
        height: Math.ceil(rect.height),
        scale: 1,
        width: Math.ceil(rect.width),
        x: Math.floor(rect.x),
        y: Math.floor(rect.y),
      },
      format: 'png',
    });
    mkdirSync(dirname(out), { recursive: true });
    await Bun.write(out, Buffer.from(data, 'base64'));
  } catch (error) {
    throw new Error(
      `${(error as Error).message}${
        logs.length ? `\nconsole:\n  ${logs.join('\n  ')}` : ''
      }`,
    );
  } finally {
    cdp.listeners.delete(onEvent);
  }
}

try {
  const cdp = await connect(await devtoolsPort());
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: SCALE,
    height: 1200,
    mobile: false,
    width: 2400,
  });
  await cdp.send('Emulation.setDefaultBackgroundColorOverride', {
    color: { a: 0, b: 0, g: 0, r: 0 },
  });
  for (const shot of toRender) {
    for (const [themeName, out] of outputs(shot)) {
      try {
        await capture(cdp, createJob(shot, themeName), out);
      } catch (error) {
        throw new Error(`${shot.name} (${themeName}): ${(error as Error).message}`);
      }
      console.log(`✓ ${shot.name} (${themeName}) → ${relative(out)}`);
    }
  }
  cdp.close();
} catch (error) {
  cleanup();
  fail((error as Error).message);
}
cleanup();
