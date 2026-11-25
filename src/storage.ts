const STORAGE_KEY = 'repopulse.projects.v1'
const STORAGE_VERSION = 1

type StoredEnvelope<T> = { version: number; savedAt: string; data: T }

/** Restore the user's project selections and locally edited checklist state. */
export function loadProjects<T>(fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const envelope = JSON.parse(raw) as StoredEnvelope<T>
    if (envelope.version !== STORAGE_VERSION || !envelope.data) return fallback
    return envelope.data
  } catch {
    return fallback
  }
}

/** Persist only browser-local state. GitHub-backed cross-device persistence will be added separately. */
export function saveProjects<T>(projects: T): void {
  if (typeof window === 'undefined') return
  try {
    const envelope: StoredEnvelope<T> = { version: STORAGE_VERSION, savedAt: new Date().toISOString(), data: projects }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Storage may be unavailable or full; the dashboard remains usable for this session.
  }
}

export function clearLocalProjects(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
