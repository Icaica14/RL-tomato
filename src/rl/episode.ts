import { Algorithm, EpisodeMetric, EpisodeStep, EpisodeTrace, FormulaDetails } from '../types/rl';
import { ActionId, StepResult } from '../types/tomato';

export function makeEpisodeStep(result: StepResult, action: ActionId, formulaDetails?: FormulaDetails): EpisodeStep {
  return {
    step: result.nextState.day,
    previousStateId: result.previousState.currentCellId,
    nextStateId: result.nextState.currentCellId,
    action,
    reward: result.reward,
    waterLevel: result.nextState.waterLevel,
    nutrientLevel: result.nextState.nutrientLevel,
    health: result.nextState.health,
    fruitProgress: result.nextState.fruitProgress,
    done: result.done,
    explanation: result.explanation.plainLanguage,
    formulaDetails,
  };
}

export function makeEpisodeTrace(episodeNumber: number, algorithm: Algorithm, steps: EpisodeStep[]): EpisodeTrace {
  const totalReward = steps.reduce((sum, step) => sum + step.reward, 0);
  const last = steps.at(-1);
  return { episodeNumber, algorithm, totalReward, terminalReason: last?.done ? last.explanation : undefined, steps };
}

export function makeEpisodeMetric(trace: EpisodeTrace, harvestDay: number): EpisodeMetric {
  const last = trace.steps.at(-1);
  return {
    episode: trace.episodeNumber,
    totalReward: trace.totalReward,
    length: last?.step ?? 0,
    algorithm: trace.algorithm,
    terminalReason: trace.terminalReason,
    harvested: Boolean(last?.done && last.step >= harvestDay && (last.health ?? 0) > 0),
    plantDied: Boolean(last?.done && (last.health ?? 1) <= 0),
  };
}

export function replayStepState(trace: EpisodeTrace | undefined, index: number) {
  return trace?.steps[index];
}
