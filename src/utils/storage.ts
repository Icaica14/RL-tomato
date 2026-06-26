export const APP_STORAGE_VERSION = 'rl-tomato-v3-episode-replay-guide';
export const STORAGE_VERSION_KEY = 'rl-tomato-storage-version';
export const LEGACY_STORAGE_KEYS = ['rl-tomato-config','rl-tomato-log','rl-tomato-metrics','rl-tomato-values','rl-tomato-episodes'];

export function migrateStorage(storage: Storage = localStorage) {
  const current = storage.getItem(STORAGE_VERSION_KEY);
  if (current !== APP_STORAGE_VERSION) {
    LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
    storage.setItem(STORAGE_VERSION_KEY, APP_STORAGE_VERSION);
    return true;
  }
  return false;
}

export function clearExperimentStorage(storage: Storage = localStorage) {
  LEGACY_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  storage.setItem(STORAGE_VERSION_KEY, APP_STORAGE_VERSION);
}
