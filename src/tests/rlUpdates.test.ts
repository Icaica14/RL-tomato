import { describe, expect, it } from 'vitest';
import { td0Update } from '../rl/tdPrediction';
import { qLearningUpdate } from '../rl/qLearning';
import { sarsaUpdate } from '../rl/sarsa';
import { QTable, VTable } from '../types/rl';

describe('RL updates', () => {
  it('TD(0) computes newV and includes target/error/value details', () => {
    const v: VTable = { s: 10, sp: 20 };
    const { table, formula } = td0Update(v, 's', 5, 'sp', false, 0.5, 0.9);
    expect(table.s).toBeCloseTo(10 + 0.5 * (5 + 0.9 * 20 - 10));
    expect(formula.oldValue).toBe(10);
    expect(formula.target).toBeCloseTo(23);
    expect(formula.error).toBeCloseTo(13);
    expect(formula.newValue).toBeCloseTo(16.5);
  });

  it('Q-learning uses max Q of next state and includes target/error/value details', () => {
    const q: QTable = { s: { do_nothing: 1, water: 2, fertilize: 3 }, sp: { do_nothing: 4, water: 10, fertilize: -1 } };
    const { table, formula } = qLearningUpdate(q, 's', 'fertilize', 2, 'sp', false, 0.5, 0.9);
    expect(formula.bestNextActionId).toBe('water');
    expect(table.s.fertilize).toBeCloseTo(3 + 0.5 * (2 + 0.9 * 10 - 3));
    expect(formula.oldValue).toBe(3);
    expect(formula.target).toBeCloseTo(11);
    expect(formula.error).toBeCloseTo(8);
    expect(formula.newValue).toBeCloseTo(7);
  });

  it('SARSA uses actual next action, not max action', () => {
    const q: QTable = { s: { do_nothing: 1, water: 2, fertilize: 3 }, sp: { do_nothing: 4, water: 10, fertilize: -1 } };
    const { table, formula } = sarsaUpdate(q, 's', 'water', 2, 'sp', 'fertilize', false, 0.5, 0.9);
    expect(formula.nextActionId).toBe('fertilize');
    expect(table.s.water).toBeCloseTo(2 + 0.5 * (2 + 0.9 * (-1) - 2));
  });
});
