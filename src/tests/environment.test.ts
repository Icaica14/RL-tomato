import { describe, expect, it } from 'vitest';
import { balancedTomato } from '../presets/tomatoPresets';
import { bucketIndex, defaultInitialState, stepEnvironment } from '../rl/environment';
import { exportConfig, importConfig } from '../utils/serialization';

describe('tomato environment', () => {
  it('Water moves at most one bucket to the right and applies action cost', () => {
    const c = balancedTomato(); c.rewardMode = 'sparse';
    const before = bucketIndex(defaultInitialState.waterLevel, c.gridSize);
    const r = stepEnvironment(defaultInitialState, 'water', c);
    expect(bucketIndex(r.nextState.waterLevel, c.gridSize) - before).toBeLessThanOrEqual(1);
    expect(bucketIndex(r.nextState.waterLevel, c.gridSize)).toBe(before + 1);
    expect(r.explanation.rewardBreakdown).toContain('costo azione -1');
  });

  it('Fertilize moves at most one bucket upward and applies action cost', () => {
    const c = balancedTomato(); c.rewardMode = 'sparse';
    const before = bucketIndex(defaultInitialState.nutrientLevel, c.gridSize);
    const r = stepEnvironment(defaultInitialState, 'fertilize', c);
    expect(bucketIndex(r.nextState.nutrientLevel, c.gridSize) - before).toBeLessThanOrEqual(1);
    expect(bucketIndex(r.nextState.nutrientLevel, c.gridSize)).toBe(before + 1);
    expect(r.explanation.rewardBreakdown).toContain('costo azione -2');
  });

  it('Do Nothing moves water and nutrients down gradually', () => {
    const c = balancedTomato();
    const r = stepEnvironment(defaultInitialState, 'do_nothing', c);
    expect(bucketIndex(r.nextState.waterLevel, c.gridSize)).toBe(bucketIndex(defaultInitialState.waterLevel, c.gridSize) - 1);
    expect(bucketIndex(r.nextState.nutrientLevel, c.gridSize)).toBe(bucketIndex(defaultInitialState.nutrientLevel, c.gridSize) - 1);
  });

  it('No v1 transition jumps more than one bucket per axis', () => {
    const c = balancedTomato();
    for (const action of ['do_nothing', 'water', 'fertilize'] as const) {
      const r = stepEnvironment(defaultInitialState, action, c);
      expect(Math.abs(bucketIndex(r.nextState.waterLevel, c.gridSize) - bucketIndex(defaultInitialState.waterLevel, c.gridSize))).toBeLessThanOrEqual(1);
      expect(Math.abs(bucketIndex(r.nextState.nutrientLevel, c.gridSize) - bucketIndex(defaultInitialState.nutrientLevel, c.gridSize))).toBeLessThanOrEqual(1);
    }
  });

  it('Health <= 0 terminates episode', () => {
    const c = balancedTomato();
    const r = stepEnvironment({ ...defaultInitialState, health: 1, waterLevel: 0, nutrientLevel: 0, currentCellId: 'cell-0-0' }, 'do_nothing', c);
    expect(r.done).toBe(true);
    expect(r.terminalReason).toContain('salute ha raggiunto zero');
  });

  it('day >= harvestDay terminates episode', () => {
    const c = balancedTomato(); c.harvestDay = 1;
    const r = stepEnvironment(defaultInitialState, 'do_nothing', c);
    expect(r.done).toBe(true);
    expect(r.terminalReason).toContain('giorno di raccolta');
  });

  it('Import/export config roundtrip preserves config', () => {
    const c = balancedTomato();
    expect(importConfig(exportConfig(c))).toEqual(c);
  });
});
