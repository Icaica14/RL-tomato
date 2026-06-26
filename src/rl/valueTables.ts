import { ActionId, TomatoConfig } from '../types/tomato'; import { CountTable, QTable, StateActionCountTable, VTable } from '../types/rl';
export const actions:ActionId[]=['do_nothing','water','fertilize'];
export function createVTable(config:TomatoConfig, initial=0):VTable{return Object.fromEntries(config.cells.map(c=>[c.id,initial]));}
export function createQTable(config:TomatoConfig, initial=0):QTable{return Object.fromEntries(config.cells.map(c=>[c.id,{do_nothing:initial,water:initial,fertilize:initial}]));}
export function createCounts(config:TomatoConfig):CountTable{return Object.fromEntries(config.cells.map(c=>[c.id,0]));}
export function createSACounts(config:TomatoConfig):StateActionCountTable{return Object.fromEntries(config.cells.map(c=>[c.id,{do_nothing:0,water:0,fertilize:0}]));}
