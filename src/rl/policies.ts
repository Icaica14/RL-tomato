import { ActionId } from '../types/tomato'; import { QTable } from '../types/rl'; import { actions } from './valueTables';
export function bestAction(q:QTable,stateId:string):ActionId{return actions.reduce((b,a)=>q[stateId][a]>q[stateId][b]?a:b,actions[0]);}
export function epsilonGreedy(q:QTable,stateId:string,epsilon:number,rand:()=>number):ActionId{return rand()<epsilon?actions[Math.floor(rand()*actions.length)]:bestAction(q,stateId);}
export function policyProbabilities(q:QTable,stateId:string,epsilon:number):Record<ActionId,number>{const b=bestAction(q,stateId), base=epsilon/actions.length; return {do_nothing:base+(b==='do_nothing'?1-epsilon:0),water:base+(b==='water'?1-epsilon:0),fertilize:base+(b==='fertilize'?1-epsilon:0)};}
