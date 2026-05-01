/**
 * CineCards AI — client-side analytics emitter.
 *
 * No backend, no third-party SDK. Events are appended to localStorage under
 * `cinecards.events` and capped at the last MAX_EVENTS entries (ring buffer
 * drops oldest). All functions are SSR-safe — they no-op when `window` is
 * undefined.
 *
 * See `docs/analytics-events.md` for the event taxonomy.
 */

export interface AnalyticsEvent {
  event: string;
  props?: Record<string, unknown>;
  ts: number;
}

const STORAGE_KEY = "cinecards.events";
const MAX_EVENTS = 500;

const isBrowser = (): boolean => typeof window !== "undefined";

const readAll = (): AnalyticsEvent[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (events: AnalyticsEvent[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* quota or disabled storage — silently drop */
  }
};

export const track = (eventName: string, props?: Record<string, unknown>): void => {
  if (!isBrowser()) return;
  const events = readAll();
  events.push({ event: eventName, props, ts: Date.now() });
  // Ring-buffer: drop oldest until within cap.
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  writeAll(events);
};

export const getEvents = (): AnalyticsEvent[] => readAll();

export const clearEvents = (): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
