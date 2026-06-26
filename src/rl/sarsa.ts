import { ActionId } from '../types/tomato';
import { FormulaDetails, QTable } from '../types/rl';

export function sarsaUpdate(q: QTable, stateId: string, actionId: ActionId, reward: number, nextStateId: string, nextActionId: ActionId, done: boolean, alpha: number, gamma: number) {
  const oldValue = q[stateId][actionId];
  const nextValue = done ? 0 : q[nextStateId][nextActionId];
  const target = reward + gamma * nextValue;
  const error = target - oldValue;
  const newValue = oldValue + alpha * error;
  const table = { ...q, [stateId]: { ...q[stateId], [actionId]: newValue } };
  const formula: FormulaDetails = {
    algorithm: 'SARSA',
    symbolic: "Q(s,a) ← Q(s,a) + α [r + γ Q(s',a') − Q(s,a)]",
    numerical: `Q(stato, azione) ← ${oldValue.toFixed(2)} + ${alpha} × [${reward.toFixed(2)} + ${gamma} × ${nextValue.toFixed(2)} − ${oldValue.toFixed(2)}] = ${newValue.toFixed(2)}`,
    oldValue,
    reward,
    gamma,
    nextValue,
    target,
    error,
    alpha,
    newValue,
    stateId,
    actionId,
    nextStateId,
    nextActionId,
    explanation: 'SARSA è on-policy: impara dall’azione successiva che l’agente sceglie davvero, inclusa l’esplorazione.',
  };
  return { table, formula };
}
