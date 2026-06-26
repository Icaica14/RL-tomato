import { ActionId, ActionEffect, TomatoCell, TomatoConfig } from '../types/tomato';
import { bucketLabels } from '../rl/environment';

export const defaultActions: Record<ActionId, ActionEffect> = {
  do_nothing: {
    id: 'do_nothing',
    label: 'Non fare nulla',
    badge: 'Ø',
    actionCost: 0,
    waterDelta: -1,
    nutrientDelta: -1,
    explanation: 'La pianta consuma naturalmente acqua e nutrienti.',
  },
  water: {
    id: 'water',
    label: 'Annaffia',
    badge: 'H₂O',
    actionCost: -1,
    waterDelta: 1,
    nutrientDelta: 0,
    explanation: 'Hai annaffiato: in v1 lo stato può spostarsi al massimo di una cella verso destra sull’asse acqua.',
  },
  fertilize: {
    id: 'fertilize',
    label: 'Fertilizza',
    badge: 'Nut',
    actionCost: -2,
    waterDelta: 0,
    nutrientDelta: 1,
    explanation: 'Hai fertilizzato: in v1 lo stato può spostarsi al massimo di una cella verso l’alto sull’asse nutrienti.',
  },
};

function makeCells(overwater = 0, nutrientBurn = 0, sparse = false): TomatoCell[] {
  const cells: TomatoCell[] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      let type: TomatoCell['cellType'] = 'Recovery';
      let reward = 0;
      let h = 0;
      let f = 0;
      let label = 'Recupero';
      let exp = 'Questa regione è sopravvivibile, ma non ideale.';
      const danger = x === 0 || x === 4 || y === 0 || y === 4;
      if (x === 2 && y === 2) {
        type = 'Balanced growth'; reward = sparse ? 0 : 4; h = 1; f = 3; label = 'Crescita bilanciata'; exp = 'Acqua e nutrienti sono bilanciati: la pianta può produrre frutti.';
      } else if (x === 0 && y === 0) {
        type = 'Double stress'; reward = sparse ? 0 : -8; h = -8; label = 'Doppio stress'; exp = 'Entrambe le risorse sono criticamente basse.';
      } else if (x <= 1) {
        type = 'Dry stress'; reward = sparse ? 0 : -3; h = -2; label = 'Stress da secco'; exp = 'La pianta ha poca acqua.';
      } else if (x === 4) {
        type = 'Overwatered'; reward = sparse ? 0 : -4 - overwater; h = -3 - overwater; label = 'Troppa acqua'; exp = 'Troppa acqua stressa le radici.';
      } else if (y <= 1) {
        type = 'Nutrient deficiency'; reward = sparse ? 0 : -3; h = -2; label = 'Carenza nutrienti'; exp = 'La pianta ha pochi nutrienti.';
      } else if (y === 4) {
        type = 'Nutrient excess'; reward = sparse ? 0 : -4 - nutrientBurn; h = -3 - nutrientBurn; label = 'Eccesso nutrienti'; exp = 'Troppi nutrienti possono bruciare la pianta.';
      }
      if (danger && x !== 2 && y !== 2) f = 0;
      cells.push({
        id: `cell-${x}-${y}`,
        x,
        y,
        waterBucketLabel: bucketLabels[x],
        nutrientBucketLabel: bucketLabels[y],
        cellType: type,
        rewardOnEnter: reward,
        healthDelta: h,
        fruitDelta: f,
        terminal: false,
        label,
        explanation: exp,
      });
    }
  }
  return cells;
}

export function balancedTomato(): TomatoConfig {
  return {
    gridSize: 5,
    harvestDay: 30,
    rewardMode: 'shaped',
    cells: makeCells(),
    actions: defaultActions,
    rewardConstants: { deathPenalty: -100, harvestFruitWeight: 1, harvestHealthWeight: 0.3, stressPenaltyMultiplier: 0.2, fruitGainMultiplier: 1, healthGainMultiplier: 0.1 },
    seed: 7,
  };
}

export const presets = [
  { name: 'Pomodoro bilanciato', config: balancedTomato() },
  { name: 'Ricompensa raccolta sparsa', config: { ...balancedTomato(), rewardMode: 'sparse' as const, cells: makeCells(0, 0, true) } },
  { name: 'Trappola troppa acqua', config: { ...balancedTomato(), cells: makeCells(5, 0) } },
  { name: 'Bruciatura da nutrienti', config: { ...balancedTomato(), cells: makeCells(0, 5) } },
  { name: 'Demo TD minimale', config: { ...balancedTomato(), harvestDay: 8 } },
];
