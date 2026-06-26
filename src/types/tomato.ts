export type ActionId='do_nothing'|'water'|'fertilize';
export type RewardMode='sparse'|'shaped'|'custom';
export type CellType='Balanced growth'|'Dry stress'|'Overwatered'|'Nutrient deficiency'|'Nutrient excess'|'Double stress'|'Recovery'|'Dead / terminal'|'Harvest / terminal'|'Custom';
export interface PlantState{day:number;waterLevel:number;nutrientLevel:number;health:number;fruitProgress:number;alive:boolean;currentCellId:string}
export interface TomatoCell{id:string;x:number;y:number;waterBucketLabel:string;nutrientBucketLabel:string;cellType:CellType;rewardOnEnter:number;healthDelta:number;fruitDelta:number;terminal:boolean;label:string;explanation:string}
export interface ActionEffect{id:ActionId;label:string;badge:string;actionCost:number;waterDelta:number;nutrientDelta:number;explanation:string}
export interface RewardConstants{deathPenalty:number;harvestFruitWeight:number;harvestHealthWeight:number;stressPenaltyMultiplier:number;fruitGainMultiplier:number;healthGainMultiplier:number}
export interface TomatoConfig{gridSize:number;harvestDay:number;rewardMode:RewardMode;cells:TomatoCell[];actions:Record<ActionId,ActionEffect>;rewardConstants:RewardConstants;seed:number}
export type MovementType='orizzontale'|'verticale'|'diagonale'|'fermo';
export interface GridMovement{previousWaterBucket:string;previousNutrientBucket:string;nextWaterBucket:string;nextNutrientBucket:string;deltaX:number;deltaY:number;movementType:MovementType;simpleExplanation:string}
export interface StepExplanation{previousState:PlantState;action:ActionEffect;afterAction:{waterLevel:number;nutrientLevel:number};cell:TomatoCell;cellEffect:string;growthEffect:string;rewardBreakdown:string[];terminalReason?:string;plainLanguage:string;healthDeltaTotal:number;fruitDeltaTotal:number;gridMovement:GridMovement}
export interface StepResult{previousState:PlantState;nextState:PlantState;reward:number;done:boolean;terminalReason?:string;explanation:StepExplanation}
