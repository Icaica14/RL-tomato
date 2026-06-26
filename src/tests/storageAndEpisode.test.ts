import { describe, expect, it } from 'vitest';
import { makeEpisodeMetric, makeEpisodeStep, makeEpisodeTrace, replayStepState } from '../rl/episode';
import { defaultInitialState, stepEnvironment } from '../rl/environment';
import { balancedTomato } from '../presets/tomatoPresets';
import { APP_STORAGE_VERSION, migrateStorage, STORAGE_VERSION_KEY } from '../utils/storage';

function makeMemoryStorage(): Storage {
  let data: Record<string, string> = {};
  return {
    get length() { return Object.keys(data).length; },
    clear: () => { data = {}; },
    getItem: (key) => data[key] ?? null,
    key: (index) => Object.keys(data)[index] ?? null,
    removeItem: (key) => { delete data[key]; },
    setItem: (key, value) => { data[key] = String(value); },
  };
}

describe('storage migration and episode traces', () => {
  it('resets old local values when storage version changes', () => {
    const storage = makeMemoryStorage();
    storage.setItem('rl-tomato-config', '{old:true}');
    storage.setItem(STORAGE_VERSION_KEY, 'old-version');
    expect(migrateStorage(storage)).toBe(true);
    expect(storage.getItem('rl-tomato-config')).toBeNull();
    expect(storage.getItem(STORAGE_VERSION_KEY)).toBe(APP_STORAGE_VERSION);
  });

  it('records an episode trace after environment steps and builds learning metrics', () => {
    const config = balancedTomato();
    const one = stepEnvironment(defaultInitialState, 'water', config);
    const two = stepEnvironment(one.nextState, 'fertilize', config);
    const trace = makeEpisodeTrace(1, 'Manual Mode', [makeEpisodeStep(one, 'water'), makeEpisodeStep(two, 'fertilize')]);
    const metric = makeEpisodeMetric(trace, config.harvestDay);
    expect(trace.steps).toHaveLength(2);
    expect(trace.totalReward).toBeCloseTo(one.reward + two.reward);
    expect(metric.length).toBe(2);
  });

  it('replay data access does not mutate live plant state', () => {
    const config = balancedTomato();
    const livePlant = { ...defaultInitialState };
    const result = stepEnvironment(livePlant, 'water', config);
    const trace = makeEpisodeTrace(1, 'Manual Mode', [makeEpisodeStep(result, 'water')]);
    const replay = replayStepState(trace, 0);
    expect(replay?.nextStateId).toBe(result.nextState.currentCellId);
    expect(livePlant).toEqual(defaultInitialState);
  });
});
