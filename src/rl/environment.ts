import { ActionId, PlantState, StepResult, TomatoCell, TomatoConfig } from '../types/tomato';
import { clamp, round } from '../utils/math';

export const bucketLabels = ['molto bassa', 'bassa', 'bilanciata', 'alta', 'eccessiva'];
export const defaultInitialState: PlantState = {
  day: 0,
  waterLevel: 50,
  nutrientLevel: 50,
  health: 70,
  fruitProgress: 0,
  alive: true,
  currentCellId: 'cell-2-2',
};

export function bucketIndex(level: number, gridSize = 5) {
  return Math.min(gridSize - 1, Math.floor(clamp(level) / (100 / gridSize)));
}

export function bucketCenter(index: number, gridSize = 5) {
  const width = 100 / gridSize;
  return clamp(index * width + width / 2);
}

export function cellIdForLevels(w: number, n: number, gridSize = 5) {
  return `cell-${bucketIndex(w, gridSize)}-${bucketIndex(n, gridSize)}`;
}

export function getCell(config: TomatoConfig, w: number, n: number): TomatoCell {
  return config.cells.find((c) => c.id === cellIdForLevels(w, n, config.gridSize)) ?? config.cells[0];
}

function nextEducationalBuckets(state: PlantState, actionId: ActionId, gridSize: number) {
  const x = bucketIndex(state.waterLevel, gridSize);
  const y = bucketIndex(state.nutrientLevel, gridSize);
  if (actionId === 'water') return { x: Math.min(gridSize - 1, x + 1), y };
  if (actionId === 'fertilize') return { x, y: Math.min(gridSize - 1, y + 1) };
  return { x: Math.max(0, x - 1), y: Math.max(0, y - 1) };
}

function growth(wi: number, ni: number) {
  const danger = (i: number) => i === 0 || i === 4;
  const low = (i: number) => i <= 1;
  if (danger(wi) && danger(ni)) return { h: -15, f: 0, t: 'Acqua e nutrienti sono entrambi in zone pericolose: la salute scende molto.' };
  if (danger(wi) || danger(ni)) return { h: -8, f: 0, t: 'Una risorsa è in una zona pericolosa: la salute scende.' };
  if (wi === 2 && ni === 2) return { h: 2, f: 5, t: 'Acqua e nutrienti sono bilanciati: salute e frutti migliorano.' };
  if (low(wi) || low(ni)) return { h: -3, f: 1, t: 'Una risorsa è bassa: i frutti crescono poco e la salute cala.' };
  return { h: 0, f: 2, t: 'La pianta è in una condizione accettabile ma non ideale: i frutti crescono lentamente.' };
}

export function stepEnvironment(state: PlantState, actionId: ActionId, config: TomatoConfig): StepResult {
  const previousState = { ...state };
  const action = config.actions[actionId];
  const previousX = bucketIndex(state.waterLevel, config.gridSize);
  const previousY = bucketIndex(state.nutrientLevel, config.gridSize);
  const nextBuckets = nextEducationalBuckets(state, actionId, config.gridSize);
  const afterAction = {
    waterLevel: bucketCenter(nextBuckets.x, config.gridSize),
    nutrientLevel: bucketCenter(nextBuckets.y, config.gridSize),
  };
  const cell = getCell(config, afterAction.waterLevel, afterAction.nutrientLevel);
  const g = growth(cell.x, cell.y);
  const rawHealth = state.health + cell.healthDelta + g.h;
  const rawFruit = state.fruitProgress + cell.fruitDelta + g.f;
  const nextDay = state.day + 1;
  let alive = rawHealth > 0;
  let terminalReason: string | undefined;
  if (!alive) terminalReason = 'La pianta è morta perché la salute ha raggiunto zero.';
  if (cell.terminal) {
    alive = false;
    terminalReason = `L'episodio è terminato perché la cella "${cell.label}" è terminale.`;
  }
  if (nextDay >= config.harvestDay && alive) terminalReason = 'L’episodio è terminato perché è stato raggiunto il giorno di raccolta.';
  const nextState = {
    day: nextDay,
    waterLevel: afterAction.waterLevel,
    nutrientLevel: afterAction.nutrientLevel,
    health: clamp(rawHealth),
    fruitProgress: clamp(rawFruit),
    alive,
    currentCellId: cell.id,
  };
  const done = !alive || nextDay >= config.harvestDay || cell.terminal;
  const healthDeltaTotal = nextState.health - state.health;
  const fruitDeltaTotal = nextState.fruitProgress - state.fruitProgress;
  const parts = [`costo azione ${action.actionCost}`, `ricompensa cella ${cell.rewardOnEnter}`];
  let reward = action.actionCost + cell.rewardOnEnter;
  const rc = config.rewardConstants;
  if (config.rewardMode !== 'sparse') {
    const fruitReward = rc.fruitGainMultiplier * Math.max(0, fruitDeltaTotal);
    const healthTerm = healthDeltaTotal > 0 ? rc.healthGainMultiplier * healthDeltaTotal : rc.stressPenaltyMultiplier * healthDeltaTotal;
    reward += fruitReward + healthTerm;
    parts.push(`guadagno frutti ${round(fruitReward)}`, `variazione salute ${round(healthTerm)}`);
  }
  if (!alive) {
    reward += rc.deathPenalty;
    parts.push(`penalità morte ${rc.deathPenalty}`);
  }
  if (nextDay >= config.harvestDay && alive) {
    const h = rc.harvestFruitWeight * nextState.fruitProgress + rc.harvestHealthWeight * nextState.health;
    reward += h;
    parts.push(`bonus raccolta ${round(h)}`);
  }
  reward = round(reward);
  const from = `acqua ${bucketLabels[previousX]}, nutrienti ${bucketLabels[previousY]}`;
  const to = `acqua ${bucketLabels[cell.x]}, nutrienti ${bucketLabels[cell.y]}`;
  const movement = `Lo stato si è spostato da [${from}] a [${to}] perché hai scelto "${action.label}".`;
  const plainLanguage = `${action.explanation} ${movement} La pianta è entrata in "${cell.label}". ${cell.explanation} ${g.t} La ricompensa è ${reward}. ${terminalReason ?? 'L’episodio continua.'}`;
  return {
    previousState,
    nextState,
    reward,
    done,
    terminalReason,
    explanation: {
      previousState,
      action,
      afterAction,
      cell,
      cellEffect: `La cella aggiunge salute ${cell.healthDelta}, frutti ${cell.fruitDelta}, ricompensa ${cell.rewardOnEnter}.`,
      growthEffect: g.t,
      rewardBreakdown: parts,
      terminalReason,
      plainLanguage,
      healthDeltaTotal,
      fruitDeltaTotal,
    },
  };
}
