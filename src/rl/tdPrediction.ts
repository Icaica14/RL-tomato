import { FormulaDetails, VTable } from '../types/rl';

export function td0Update(v: VTable, stateId: string, reward: number, nextStateId: string, done: boolean, alpha: number, gamma: number) {
  const oldValue = v[stateId] ?? 0;
  const nextValue = done ? 0 : (v[nextStateId] ?? 0);
  const target = reward + gamma * nextValue;
  const error = target - oldValue;
  const newValue = oldValue + alpha * error;
  const table = { ...v, [stateId]: newValue };
  const formula: FormulaDetails = {
    algorithm: 'TD(0) Prediction',
    symbolic: "V(s) ← V(s) + α [r + γ V(s') − V(s)]",
    numerical: `V(stato precedente) ← ${oldValue.toFixed(2)} + ${alpha} × [${reward.toFixed(2)} + ${gamma} × ${nextValue.toFixed(2)} − ${oldValue.toFixed(2)}] = ${newValue.toFixed(2)}`,
    oldValue,
    reward,
    gamma,
    nextValue,
    target,
    error,
    alpha,
    newValue,
    stateId,
    nextStateId,
    explanation: `Il valore dello stato precedente ${newValue >= oldValue ? 'aumenta' : 'diminuisce'} perché la ricompensa e il valore stimato del nuovo stato sono ${newValue >= oldValue ? 'migliori' : 'peggiori'} di quanto l’agente si aspettava.`,
  };
  return { table, formula };
}
