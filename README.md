# RL Tomato Lab

RL Tomato Lab is a clean React + TypeScript learning lab for reinforcement learning. It uses a deterministic **Tomato GridWorld** to make the full loop visible: state → action → next state → reward → terminal? → value update → policy update.

## The grid is an abstract state space

The grid is **not a physical map**. The X axis is water level and the Y axis is nutrient level. Each cell is a discrete plant-condition state used by V(s), Q(s,a), visit counts, and the policy.

## Core concepts in the app

- **State:** day, water, nutrients, health, fruit progress, alive/dead, and current cell id.
- **Actions:** exactly three deterministic treatments: Do Nothing, Water, Fertilize.
- **Reward:** sparse, shaped, or custom reward constants explain why a number was assigned.
- **Episode:** one plant-management run from day 0 to death or harvest day.
- **Terminal condition:** health reaches zero, alive becomes false, a terminal cell is entered, or harvest day is reached.

## Run locally

```bash
npm install
npm run dev
npm test
npm run build
```

## Manual Mode

Manual Mode is the first tab. Click Do Nothing, Water, or Fertilize and inspect the step report, current state, reward breakdown, terminal reason, and lesson explanation before selecting any algorithm.

## Algorithms

- **TD(0) Prediction:** updates V(s) with `V(s) ← V(s) + α [r + γ V(s') − V(s)]`.
- **SARSA:** on-policy control; updates Q(s,a) using the actual next action selected by epsilon-greedy behavior.
- **Q-learning:** off-policy control; updates Q(s,a) using the best estimated next action.
- **Monte Carlo:** placeholder panel explains that Monte Carlo waits for episode end, uses actual total return, and does not bootstrap from V(s').

## Parameters

- **alpha:** how strongly the agent changes its belief after one new experience.
- **gamma:** how much future rewards matter compared with immediate rewards.
- **epsilon:** how often the agent tries a random action instead of the current best action.

## Suggested learning path

1. Open Balanced Tomato.
2. Use Manual Mode.
3. Take one Water action and inspect the reward.
4. Turn on TD(0) and inspect one update.
5. Run one episode.
6. Run 100 episodes.
7. Inspect V(s), Q(s,a), policy probabilities, and logs.
8. Compare SARSA and Q-learning.

## Presets

Balanced Tomato, Sparse Harvest Reward, Overwatering Trap, Nutrient Burn, and Minimal TD Demo are included. They stay deterministic and do not include pests or weather.

## Future extensions

- stochastic transitions
- weather
- pests
- partial observability
- more realistic plant model
